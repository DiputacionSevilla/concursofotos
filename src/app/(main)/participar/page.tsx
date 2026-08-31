import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { isContestOpen } from '@/features/contest-info/utils/contest-status'
import { getMySubmissions } from '@/features/submissions/services/get-my-submissions'
import { UploadForm } from '@/features/submissions/components/UploadForm'
import { MySubmissions } from '@/features/submissions/components/MySubmissions'

export default async function ParticiparPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/participar')

  const config = await getContestConfig()
  const submissions = await getMySubmissions(user.id)
  const contestOpen = isContestOpen(config)
  const remaining = config.max_fotos_por_participante - submissions.length
  const canUpload = contestOpen && remaining > 0

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-stone-900">Mi foto</h1>
      <p className="mt-1 text-sm text-stone-600">
        {remaining > 0
          ? `Puedes subir ${remaining} foto${remaining === 1 ? '' : 's'} más.`
          : 'Has alcanzado el número máximo de fotos permitidas.'}
      </p>

      {!contestOpen && (
        <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          {new Date() < new Date(config.fecha_apertura ?? 0)
            ? 'La subida de fotos todavía no ha comenzado. Podrás subir tu foto el 17 y 18 de septiembre.'
            : 'El plazo de subida de fotos ha finalizado.'}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        {canUpload && <UploadForm userId={user.id} maxSizeMb={config.tamano_max_mb} />}
        <div className={canUpload ? '' : 'lg:col-span-2'}>
          <MySubmissions items={submissions} />
        </div>
      </div>
    </div>
  )
}
