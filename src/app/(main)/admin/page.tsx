import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllSubmissions } from '@/features/admin/services/get-all-submissions'
import { getAllParticipants } from '@/features/admin/services/get-participants'
import { computeStats } from '@/features/admin/services/compute-stats'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { AdminDashboard } from '@/features/admin/components/AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [submissions, participants, config] = await Promise.all([
    getAllSubmissions(),
    getAllParticipants(),
    getContestConfig(),
  ])

  const stats = computeStats(submissions, participants.length)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-900">Panel de administración</h1>
        <p className="mt-1 text-sm text-stone-600">
          Gestiona las fotos recibidas, los premios, las exportaciones y la configuración del concurso.
        </p>
      </div>

      <AdminDashboard submissions={submissions} participants={participants} stats={stats} config={config} />
    </div>
  )
}
