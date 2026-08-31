'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { buildCompleteProfileSchema } from '@/features/auth/types'
import { submissionSchema, validateFile } from '@/features/submissions/types'

const emailSchema = z.string().trim().toLowerCase().email('Introduce un email válido')

function str(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v : ''
}

function mapInsertError(message: string): string {
  if (message.includes('maximo de')) return message.replace('maximo', 'máximo')
  if (message.includes('no ha comenzado')) return 'El concurso aún no ha comenzado.'
  if (message.includes('ha finalizado')) return 'El plazo de participación ha finalizado.'
  return message
}

// Da de alta, en nombre del admin, una foto recibida por un canal externo (email,
// buzon fisico...) para participantes que no usan la web. Reutiliza exactamente las
// mismas validaciones que el alta normal (perfil + foto), y entra en el mismo circuito
// de moderacion/premios/galeria que cualquier otra submission. Usa el cliente
// service_role, que la funcion enforce_submission_rules() trata de forma especial
// para no exigir que la ventana de fechas del formulario publico ya este abierta.
export async function createManualSubmission(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (adminProfile?.role !== 'admin') throw new Error('No autorizado')

  const config = await getContestConfig()

  const email = emailSchema.parse(str(formData.get('email')))

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

  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('profiles')
    .select('id, nombre')
    .eq('email', email)
    .maybeSingle()

  let participantId: string

  if (existing) {
    participantId = existing.id
    if (!existing.nombre) {
      const { error } = await admin
        .from('profiles')
        .update({
          nombre: profileInput.nombre,
          apellidos: profileInput.apellidos,
          telefono: profileInput.telefono ?? null,
          fecha_nacimiento: profileInput.fechaNacimiento,
          tutor_nombre: profileInput.tutorNombre ?? null,
          tutor_dni: profileInput.tutorDni ?? null,
          acepta_bases: true,
        })
        .eq('id', participantId)
      if (error) throw new Error(error.message)
    }
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      password: crypto.randomUUID(),
    })
    if (createError || !created.user) {
      throw new Error(createError?.message ?? 'No se pudo crear la cuenta del participante.')
    }
    participantId = created.user.id

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        nombre: profileInput.nombre,
        apellidos: profileInput.apellidos,
        telefono: profileInput.telefono ?? null,
        fecha_nacimiento: profileInput.fechaNacimiento,
        tutor_nombre: profileInput.tutorNombre ?? null,
        tutor_dni: profileInput.tutorDni ?? null,
        acepta_bases: true,
      })
      .eq('id', participantId)
    if (profileError) throw new Error(profileError.message)
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${participantId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await admin.storage
    .from('contest-photos')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const { error: insertError } = await admin.from('submissions').insert({
    participant_id: participantId,
    storage_path: path,
    title: submissionInput.title,
    description: submissionInput.description ?? null,
    categoria: submissionInput.categoria,
    origen: 'email',
  })

  if (insertError) {
    await admin.storage.from('contest-photos').remove([path])
    throw new Error(mapInsertError(insertError.message))
  }

  revalidatePath('/admin')
  revalidatePath('/participar')
  revalidatePath('/galeria')
}
