'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { grupoEdadLabel } from '@/shared/utils/edad'
import type { PremioTipo } from '@/shared/types/database'

// Las RLS (submissions_update_admin) son la barrera real: solo profiles.role='admin'
// puede que estos updates surtan efecto. Esto evita ademas llamadas sin sesion.

export async function assignPremio(submissionId: string, premio: PremioTipo) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: target, error: targetError } = await supabase
    .from('submissions')
    .select('id, categoria, status, profiles!submissions_participant_id_fkey(fecha_nacimiento)')
    .eq('id', submissionId)
    .single()

  if (targetError || !target) throw new Error('Foto no encontrada')
  if (target.status !== 'approved' && target.status !== 'winner') {
    throw new Error('Solo se puede premiar una foto aprobada')
  }

  const grupoEdad = grupoEdadLabel(target.profiles?.fecha_nacimiento ?? null)

  // Libera el mismo puesto (categoria + grupo de edad + premio) si lo tenia otra foto.
  const { data: sameCategoria } = await supabase
    .from('submissions')
    .select('id, premio, profiles!submissions_participant_id_fkey(fecha_nacimiento)')
    .eq('categoria', target.categoria)
    .eq('status', 'winner')
    .eq('premio', premio)
    .neq('id', submissionId)

  const toClear = (sameCategoria ?? []).filter(
    (s) => grupoEdadLabel(s.profiles?.fecha_nacimiento ?? null) === grupoEdad
  )

  for (const s of toClear) {
    await supabase.from('submissions').update({ status: 'approved', premio: null }).eq('id', s.id)
  }

  const { error } = await supabase
    .from('submissions')
    .update({ status: 'winner', premio, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/galeria')
  revalidatePath('/ganadores')
}

export async function removePremio(submissionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('submissions')
    .update({ status: 'approved', premio: null, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/galeria')
  revalidatePath('/ganadores')
}
