'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { buildCompleteProfileSchema } from '@/features/auth/types'
import { submissionSchema, validateFile } from '../types'
import { mapInsertError } from '../utils/map-insert-error'

const emailSchema = z.string().trim().toLowerCase().email('Introduce un email válido')

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v : ''
}

// Permite subir una foto sin haber pasado antes por /registro + /completar-perfil:
// registra al participante (o completa su perfil, si ya tenia sesion iniciada pero
// perfil incompleto) a partir de los mismos datos del formulario de envio, y a
// continuacion sube la foto. Reduce el alta a una sola pantalla en vez de tres.
export async function createPublicSubmission(formData: FormData) {
  const config = await getContestConfig()
  const supabase = await createClient()

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser()

  const profileInput = buildCompleteProfileSchema(config.edad_minima).parse({
    nombre: str(formData.get('nombre')),
    apellidos: str(formData.get('apellidos')),
    telefono: str(formData.get('telefono')),
    fechaNacimiento: str(formData.get('fechaNacimiento')),
    tutorNombre: str(formData.get('tutorNombre')),
    tutorDni: str(formData.get('tutorDni')),
    aceptaBases: formData.get('aceptaBases') === 'true',
  })

  const submissionInput = submissionSchema.parse({
    title: str(formData.get('title')),
    description: str(formData.get('description')),
    categoria: str(formData.get('categoria')),
  })

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('Selecciona una foto')
  const fileError = validateFile(file, config.tamano_max_mb)
  if (fileError) throw new Error(fileError)

  const profileUpdate = {
    nombre: profileInput.nombre,
    apellidos: profileInput.apellidos,
    telefono: profileInput.telefono ?? null,
    fecha_nacimiento: profileInput.fechaNacimiento,
    tutor_nombre: profileInput.tutorNombre ?? null,
    tutor_dni: profileInput.tutorDni ?? null,
    acepta_bases: true,
  }

  let participantId: string

  if (sessionUser) {
    // Ya hay sesion (p.ej. se registro pero no llego a completar el perfil): se
    // completa con estos mismos datos, sin crear una cuenta nueva.
    participantId = sessionUser.id
    const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', participantId)
    if (error) throw new Error(error.message)
  } else {
    const email = emailSchema.parse(str(formData.get('email')))

    // La lectura por email requiere el cliente admin: RLS solo deja leer el propio perfil.
    const admin = createAdminClient()
    const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
    if (existing) {
      throw new Error('Ya existe una cuenta con este email. Inicia sesión para subir tu foto.')
    }

    const password = crypto.randomUUID()
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
    })
    if (createError || !created.user) {
      throw new Error(createError?.message ?? 'No se pudo crear la cuenta del participante.')
    }
    participantId = created.user.id

    const { error: profileError } = await admin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', participantId)
    if (profileError) throw new Error(profileError.message)

    // Inicia sesion con la cuenta recien creada para que, a partir de aqui, la subida
    // de foto y las siguientes visitas a /participar usen el mismo circuito (RLS
    // normal) que un participante que se registro por el camino largo.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) throw new Error(signInError.message)
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${participantId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('contest-photos')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const { error: insertError } = await supabase.from('submissions').insert({
    participant_id: participantId,
    storage_path: path,
    title: submissionInput.title,
    description: submissionInput.description ?? null,
    categoria: submissionInput.categoria,
  })

  if (insertError) {
    await supabase.storage.from('contest-photos').remove([path])
    throw new Error(mapInsertError(insertError.message))
  }

  revalidatePath('/participar')
  revalidatePath('/galeria')
}
