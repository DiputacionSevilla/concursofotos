'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updatePasswordSchema } from '../types'
import { updatePassword } from '../services/auth'

export function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const parsed = updatePasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      setStatus('error')
      return
    }

    setStatus('loading')
    try {
      await updatePassword(parsed.data)
      router.push('/participar')
      router.refresh()
    } catch {
      setStatus('error')
      setError('No se pudo actualizar la contraseña. Puede que el enlace haya caducado.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {status === 'loading' ? 'Guardando...' : 'Guardar contraseña'}
      </button>
    </form>
  )
}
