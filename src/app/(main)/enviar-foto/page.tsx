import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { isContestOpen } from '@/features/contest-info/utils/contest-status'
import { PublicSubmissionForm } from '@/features/submissions/components/PublicSubmissionForm'

export default async function EnviarFotoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nombre, acepta_bases')
      .eq('id', user.id)
      .single()

    // Perfil ya completo: no necesita este atajo, que siga el circuito normal de /participar.
    if (profile?.nombre && profile.acepta_bases) redirect('/participar')
  }

  const config = await getContestConfig()
  const contestOpen = isContestOpen(config)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-stone-900">Enviar foto sin registro</h1>
      <p className="mt-1 text-sm text-stone-600">
        Rellena tus datos y sube tu foto directamente, sin crear una cuenta antes.
      </p>

      {!contestOpen ? (
        <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          {new Date() < new Date(config.fecha_apertura ?? 0)
            ? 'La subida de fotos todavía no ha comenzado. Podrás enviar tu foto el 17 y 18 de septiembre.'
            : 'El plazo de subida de fotos ha finalizado.'}
        </p>
      ) : (
        <div className="mt-6">
          <PublicSubmissionForm
            prefilledEmail={user?.email}
            emailLocked={!!user}
            edadMinima={config.edad_minima}
            maxSizeMb={config.tamano_max_mb}
          />
        </div>
      )}
    </div>
  )
}
