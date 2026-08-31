'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginSchema } from '../types'
import { login } from '../services/auth'

function mapAuthError(message: string): string {
  if (/rate limit/i.test(message)) {
    return 'Se han hecho demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Email o contraseña incorrectos.'
  }
  if (/email not confirmed/i.test(message)) {
    return 'Confirma tu email antes de entrar. Revisa tu bandeja de entrada.'
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.'
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/participar'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await login(parsed.data)
      router.push(redirect)
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? mapAuthError(err.message) : 'No se pudo iniciar sesión.')
    }
  }

  const registroHref =
    redirect === '/participar' ? '/registro' : `/registro?redirect=${encodeURIComponent(redirect)}`

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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>

      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
        {status === 'loading' ? 'Entrando...' : 'Entrar'}
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/recuperar" className="text-stone-500 underline hover:text-stone-700">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href={registroHref} className="text-terracotta-700 underline hover:text-terracotta-800">
          Crear cuenta
        </Link>
      </div>
    </form>
  )
}
