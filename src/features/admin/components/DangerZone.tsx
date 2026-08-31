'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getResetPreview, resetSystemData, type ResetPreview } from '../services/reset-actions'
import { RESET_CONFIRM_PHRASE } from '@/shared/utils/reset'

type Step = 'loading' | 'ready' | 'confirming' | 'done' | 'error'

export function DangerZone() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('loading')
  const [preview, setPreview] = useState<ResetPreview | null>(null)
  const [understood, setUnderstood] = useState(false)
  const [phrase, setPhrase] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ deletedSubmissions: number; deletedParticipants: number } | null>(
    null
  )

  useEffect(() => {
    getResetPreview()
      .then((p) => {
        setPreview(p)
        setStep('ready')
      })
      .catch(() => setStep('error'))
  }, [])

  const canSubmit = understood && phrase === RESET_CONFIRM_PHRASE && password.length > 0

  async function handleReset() {
    setStep('confirming')
    setError('')
    try {
      const res = await resetSystemData({ phrase, password })
      setResult(res)
      setStep('done')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el reinicio.')
      setStep('ready')
    }
  }

  if (step === 'loading') {
    return <p className="text-sm text-stone-500">Calculando qué se vería afectado...</p>
  }

  if (step === 'error' && !preview) {
    return <p className="text-sm text-red-600">No se pudo cargar la vista previa. Recarga la página.</p>
  }

  if (step === 'done' && result) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6">
        <h3 className="text-sm font-semibold text-green-800">Sistema reiniciado</h3>
        <p className="mt-2 text-sm text-green-700">
          Se han borrado {result.deletedSubmissions} fotos y {result.deletedParticipants} cuentas de
          participantes. La cuenta de administrador y la configuración del concurso no se han tocado. El
          sistema queda listo para producción.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5">
        <h3 className="text-sm font-bold text-red-800">Zona de peligro: reiniciar el sistema</h3>
        <p className="mt-2 text-sm text-red-700">
          Esta acción borra <strong>permanentemente</strong> y sin posibilidad de deshacer:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
          <li>
            <strong>{preview?.submissions ?? 0}</strong> fotos enviadas (la fila en base de datos y el
            fichero en Storage).
          </li>
          <li>
            <strong>{preview?.participants ?? 0}</strong> cuentas de participantes registradas (incluida su
            capacidad de iniciar sesión).
          </li>
        </ul>
        <p className="mt-3 text-sm text-red-700">
          <strong>No se toca</strong> tu cuenta de administrador ni la configuración del concurso (fechas,
          bases, categorías). Esto no distingue datos de prueba de datos reales: borrará todo lo que haya
          en este momento. Úsalo justo antes de abrir el concurso al público, nunca durante el plazo de
          participación.
        </p>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="space-y-4 rounded-lg border border-stone-200 p-5">
        <label className="flex items-start gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-red-600"
          />
          Entiendo que esta acción es irreversible y que borrará los datos indicados arriba.
        </label>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            Escribe <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">{RESET_CONFIRM_PHRASE}</code>{' '}
            para confirmar
          </label>
          <input
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            className="input mt-1"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">Tu contraseña de administrador</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
            autoComplete="current-password"
          />
        </div>

        <button
          onClick={handleReset}
          disabled={!canSubmit || step === 'confirming'}
          className="w-full rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {step === 'confirming' ? 'Reiniciando...' : 'Borrar todo y dejar el sistema listo para producción'}
        </button>
      </div>
    </div>
  )
}
