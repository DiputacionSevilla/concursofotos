import { UpdatePasswordForm } from '@/features/auth/components/UpdatePasswordForm'

export default function ActualizarContrasenaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-stone-900">Nueva contraseña</h1>
          <p className="mt-1 text-sm text-stone-600">Elige una contraseña para tu cuenta.</p>
        </div>

        <div className="card p-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </div>
  )
}
