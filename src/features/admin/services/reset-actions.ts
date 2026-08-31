'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { RESET_CONFIRM_PHRASE } from '@/shared/utils/reset'

export type ResetPreview = {
  submissions: number
  participants: number
}

async function requireAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !user.email) throw new Error('No autenticado')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('No autorizado')

  return { supabase, user }
}

// Vista previa de lo que borraria un reset, para mostrar el impacto real antes de confirmar.
export async function getResetPreview(): Promise<ResetPreview> {
  const { supabase } = await requireAdminUser()

  const [{ count: submissions }, { count: participants }] = await Promise.all([
    supabase.from('submissions').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'participant'),
  ])

  return { submissions: submissions ?? 0, participants: participants ?? 0 }
}

// Borrado irreversible de datos de prueba: todas las submissions (fila + foto en Storage)
// y todas las cuentas de participantes (role='participant'), incluida su cuenta de login.
// La cuenta admin y la configuracion del concurso (contest_config) no se tocan.
//
// Doble verificacion server-side antes de borrar nada: la frase de confirmacion exacta
// Y la contraseña del propio admin (reautenticacion). Ninguna de las dos se confia desde
// el cliente sin validar aqui.
export async function resetSystemData(input: { phrase: string; password: string }) {
  const { supabase, user } = await requireAdminUser()

  if (input.phrase.trim() !== RESET_CONFIRM_PHRASE) {
    throw new Error('La frase de confirmación no coincide.')
  }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: input.password,
  })
  if (authError) throw new Error('Contraseña incorrecta.')

  const admin = createAdminClient()

  const { data: submissions } = await admin.from('submissions').select('storage_path')
  const paths = (submissions ?? []).map((s) => s.storage_path)
  if (paths.length > 0) {
    await admin.storage.from('contest-photos').remove(paths)
  }

  const { data: participants } = await admin.from('profiles').select('id').eq('role', 'participant')
  for (const p of participants ?? []) {
    await admin.auth.admin.deleteUser(p.id)
  }

  revalidatePath('/admin')
  revalidatePath('/galeria')
  revalidatePath('/ganadores')
  revalidatePath('/participar')

  return { deletedSubmissions: paths.length, deletedParticipants: (participants ?? []).length }
}
