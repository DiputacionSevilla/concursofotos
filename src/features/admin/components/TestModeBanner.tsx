'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setModoPruebas } from '../services/test-mode-actions'

export function TestModeBanner({ modoPruebas }: { modoPruebas: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function toggle(enabled: boolean) {
    setError('')
    startTransition(async () => {
      try {
        await setModoPruebas(enabled)
        router.refresh()
      } catch {
        setError('No se pudo cambiar el modo pruebas.')
      }
    })
  }

  if (modoPruebas) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-amber-400 bg-amber-50 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-amber-900">Modo pruebas activo</p>
          <p className="text-xs text-amber-800">
            Todos los controles de fecha están desactivados: se puede subir fuera de plazo, y la galería y
            los ganadores son visibles aunque no hayan llegado sus fechas. Desactívalo antes de que
            arranque el concurso real.
          </p>
        </div>
        <button
          onClick={() => toggle(false)}
          disabled={isPending}
          className="shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {isPending ? 'Desactivando...' : 'Desactivar modo pruebas'}
        </button>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2">
      <p className="text-xs text-stone-500">
        Modo pruebas desactivado — se respetan las fechas del concurso en subida, galería y ganadores.
      </p>
      <button
        onClick={() => toggle(true)}
        disabled={isPending}
        className="shrink-0 rounded-md bg-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-300 disabled:opacity-50"
      >
        {isPending ? 'Activando...' : 'Activar modo pruebas'}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  )
}
