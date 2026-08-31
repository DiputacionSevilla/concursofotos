import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-stone-900">El enlace no es válido</h1>
        <p className="mt-2 text-stone-600">
          Puede que el enlace haya caducado o ya se haya usado. Solicita uno nuevo para entrar.
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-block">
          Volver a intentarlo
        </Link>
      </div>
    </div>
  )
}
