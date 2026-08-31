import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/shared/types/database'

export async function getContestConfig(): Promise<Tables<'contest_config'>> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contest_config').select('*').eq('id', 1).single()

  if (error || !data) {
    throw new Error('No se pudo cargar la configuración del concurso')
  }

  return data
}
