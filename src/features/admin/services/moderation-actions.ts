'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { contestConfigSchema, type ContestConfigInput } from '../types'
import type { SubmissionStatus } from '@/shared/types/database'

// Las RLS (submissions_update_admin / contest_config_write_admin) son la barrera real:
// solo un usuario con profiles.role='admin' puede que estos updates surtan efecto.
// Esta funcion server-side evita ademas que alguien llame la accion sin sesion.

export async function updateSubmissionStatus(submissionId: string, status: SubmissionStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('submissions')
    .update({ status, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', submissionId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
  revalidatePath('/galeria')
}

export async function updateContestConfig(input: ContestConfigInput) {
  const parsed = contestConfigSchema.parse(input)
  const supabase = await createClient()

  const { error } = await supabase.from('contest_config').update(parsed).eq('id', 1)
  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/galeria')
}
