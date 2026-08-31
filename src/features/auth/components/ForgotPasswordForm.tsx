'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { confirmResetSchema, forgotPasswordSchema } from '../types'
import { confirmPasswordReset, sendPasswordReset } from '../services/auth'

function mapRequestError(message: string): string {
  if (/rate limit/i.test(message)) {
    return 'Se han hecho demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  }
  return 'No se pudo enviar el código. Inténtalo de nuevo.'
}

function mapConfirmError(message: string): string {
  if (/expired|invalid/i.test(message)) {
    return 'El código no es válido o ha caducado. Solicita uno nuevo.'
  }
  return 'No se pudo cambiar la contraseña. Inténtalo de nuevo.'
}

export function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleRequest(e: FormEvent) {
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
      setEmail(parsed.data.email)
      setStatus('idle')
      setStep('confirm')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? mapRequestError(err.message) : 'No se pudo enviar el código.')
    }
  }

  async function handleConfirm(e: FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = confirmResetSchema.safeParse({ token, password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await confirmPasswordReset(email, parsed.data)
      router.push('/participar')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? mapConfirmError(err.message) : 'No se pudo cambiar la contraseña.')
    }
  }

  if (step === 'confirm') {
    return (
      <form onSubmit={handleConfirm} className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700">
          Si existe una cuenta con <strong>{email}</strong>, te hemos enviado un código de 6
          dígitos. Introdúcelo junto con tu nueva contraseña.
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-stone-700">
            Código recibido por email
          </label>
          <input
            id="token"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Nueva contraseña
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
          {status === 'loading' ? 'Guardando...' : 'Cambiar contraseña'}
        </button>

        <p className="text-center text-sm text-stone-500">
          <button
            type="button"
            onClick={() => {
              setStep('request')
              setError('')
              setStatus('idle')
            }}
            className="underline hover:text-stone-700"
          >
            ¿No te ha llegado? Solicita otro código
          </button>
        </p>
      </form>
    )
  }

  return (
    <form onSubmit={handleRequest} className="space-y-4">
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
        {status === 'loading' ? 'Enviando...' : 'Enviar código'}
      </button>

      <p className="text-center text-sm text-stone-500">
        <Link href="/login" className="underline hover:text-stone-700">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  )
}
