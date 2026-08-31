import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/escudo-mairena.png"
            alt="Escudo del Ayuntamiento de Mairena del Alcor"
            width={75}
            height={90}
            className="mb-4 h-[90px] w-[75px]"
            priority
          />
          <h1 className="font-display text-2xl font-bold text-stone-900">Participar en el concurso</h1>
          <p className="mt-1 text-sm text-stone-600">Accede con tu email y contraseña.</p>
        </div>

        <div className="card p-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-sm text-stone-500">
          <Link href="/" className="underline hover:text-stone-700">
            Volver a la información del concurso
          </Link>
        </p>
      </div>
    </div>
  )
}
