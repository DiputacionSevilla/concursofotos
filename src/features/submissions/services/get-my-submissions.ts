import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/shared/types/database'

export type SubmissionWithUrl = Tables<'submissions'> & { signedUrl: string | null }

export async function getMySubmissions(userId: string): Promise<SubmissionWithUrl[]> {
  const supabase = await createClient()
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('participant_id', userId)
    .order('created_at', { ascending: false })

  if (error || !submissions) return []

  return Promise.all(
    submissions.map(async (submission) => {
      const { data } = await supabase.storage
        .from('contest-photos')
        .createSignedUrl(submission.storage_path, 3600)
      return { ...submission, signedUrl: data?.signedUrl ?? null }
    })
  )
}
