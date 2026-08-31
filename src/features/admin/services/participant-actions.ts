'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Borrado irreversible de UNA cuenta de participante: su acceso de login, su perfil
// y sus fotos (fila + fichero en Storage). Solo admin puede llamarlo, y solo actua
// sobre cuentas con role='participant' (nunca sobre la propia cuenta admin).
export async function deleteParticipant(participantId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('No autorizado')

  const admin = createAdminClient()

  const { data: target } = await admin.from('profiles').select('role').eq('id', participantId).single()
  if (!target || target.role !== 'participant') {
    throw new Error('Solo se pueden borrar cuentas de participantes.')
  }

  const { data: submissions } = await admin
    .from('submissions')
    .select('storage_path')
    .eq('participant_id', participantId)

  const paths = (submissions ?? []).map((s) => s.storage_path)
  if (paths.length > 0) {
    await admin.storage.from('contest-photos').remove(paths)
  }

  const { error } = await admin.auth.admin.deleteUser(participantId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/galeria')
  revalidatePath('/ganadores')
  revalidatePath('/participar')
}
