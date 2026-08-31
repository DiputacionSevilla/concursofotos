'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signupSchema } from '../types'
import { signup } from '../services/auth'

function mapAuthError(message: string): string {
  if (/rate limit/i.test(message)) {
    return 'Se han hecho demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }
  if (/already registered|user already exists/i.test(message)) {
    return 'Ya existe una cuenta con este email. Inicia sesión.'
  }
  if (/password should be at least/i.test(message)) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }
  return 'No se pudo crear la cuenta. Inténtalo de nuevo.'
}

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/participar'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = signupSchema.safeParse({ email, password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      const result = await signup(parsed.data, redirect)
      if (result.needsEmailConfirmation) {
        setStatus('sent')
      } else {
        router.push(redirect)
        router.refresh()
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? mapAuthError(err.message) : 'No se pudo crear la cuenta.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-green-700">
          Te hemos enviado un enlace para confirmar tu cuenta a <strong>{email}</strong>. Ábrelo
          para activarla.
        </p>
      </div>
    )
  }

  const loginHref = redirect === '/participar' ? '/login' : `/login?redirect=${encodeURIComponent(redirect)}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <p className="mt-1 text-xs text-stone-500">Al menos 8 caracteres.</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">
          Repite la contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="input"
        />
      </div>

      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
        {status === 'loading' ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-stone-500">
        ¿Ya tienes cuenta?{' '}
        <Link href={loginHref} className="text-terracotta-700 underline hover:text-terracotta-800">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
