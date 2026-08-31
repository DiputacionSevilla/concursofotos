import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompleteProfileForm } from '@/features/auth/components/CompleteProfileForm'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'

export default async function CompletarPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, config] = await Promise.all([
    supabase
      .from('profiles')
      .select('nombre, apellidos, telefono, fecha_nacimiento, tutor_nombre, tutor_dni, acepta_bases')
      .eq('id', user.id)
      .single(),
    getContestConfig(),
  ])

  const { redirect: redirectParam } = await searchParams
  const safeRedirect = redirectParam?.startsWith('/') ? redirectParam : '/participar'

  if (profile?.nombre && profile.acepta_bases) redirect(safeRedirect)

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-stone-900">Completa tu perfil</h1>
          <p className="mt-1 text-sm text-stone-600">
            Necesitamos estos datos para poder inscribirte en el concurso.
          </p>
        </div>
        <div className="card p-6">
          <CompleteProfileForm
            userId={user.id}
            redirect={safeRedirect}
            edadMinima={config.edad_minima}
            initialValues={{
              nombre: profile?.nombre ?? '',
              apellidos: profile?.apellidos ?? '',
              telefono: profile?.telefono ?? '',
              fechaNacimiento: profile?.fecha_nacimiento ?? '',
              tutorNombre: profile?.tutor_nombre ?? '',
              tutorDni: profile?.tutor_dni ?? '',
            }}
          />
        </div>
      </div>
    </div>
  )
}
