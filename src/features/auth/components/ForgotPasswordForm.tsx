'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { forgotPasswordSchema } from '../types'
import { sendPasswordReset } from '../services/auth'

function mapAuthError(message: string): string {
  if (/rate limit/i.test(message)) {
    return 'Se han hecho demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }
  return 'No se pudo enviar el enlace. Inténtalo de nuevo.'
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await sendPasswordReset(parsed.data)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? mapAuthError(err.message) : 'No se pudo enviar el enlace.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-green-700">
          Si existe una cuenta con <strong>{email}</strong>, te hemos enviado un enlace para
          restablecer tu contraseña.
        </p>
      </div>
    )
  }

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

      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
        {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
      </button>

      <p className="text-center text-sm text-stone-500">
        <Link href="/login" className="underline hover:text-stone-700">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  )
}
