'use client'

import { useState } from 'react'
import type { Tables } from '@/shared/types/database'

function useOrigin() {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

function CopyLinkRow({ label, path, hint }: { label: string; path: string; hint?: string }) {
  const origin = useOrigin()
  const url = `${origin}${path}`
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Portapapeles no disponible: el usuario puede seleccionar el texto manualmente.
    }
  }

  return (
    <div className="rounded-lg border border-stone-200 p-4">
      <p className="text-sm font-semibold text-stone-900">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="input flex-1 text-sm text-stone-600"
        />
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-secondary whitespace-nowrap">
            {copied ? 'Copiado' : 'Copiar enlace'}
          </button>
          <a href={path} target="_blank" rel="noreferrer" className="btn-secondary whitespace-nowrap">
            Ver
          </a>
        </div>
      </div>
    </div>
  )
}

export function SharePanel({ config }: { config: Tables<'contest_config'> }) {
  const galeriaVisible =
    config.galeria_publica_desde_envio ||
    (config.fecha_cierre ? new Date() > new Date(config.fecha_cierre) : false)
  const ganadoresVisible = config.fecha_anuncio_ganadores
    ? new Date() > new Date(config.fecha_anuncio_ganadores)
    : false

  return (
    <div className="space-y-4">
      <p className="text-sm text-stone-600">
        Estos son los enlaces públicos, sin necesidad de iniciar sesión, para enlazar desde la web
        municipal o compartir en redes sociales.
      </p>

      <CopyLinkRow
        label="Galería pública"
        path="/galeria"
        hint={
          galeriaVisible
            ? 'Visible ahora mismo para cualquier visitante.'
            : 'Aún no visible: actívalo en "Configuración" o espera al cierre del plazo.'
        }
      />

      <CopyLinkRow
        label="Página de ganadores"
        path="/ganadores"
        hint={
          ganadoresVisible
            ? 'Visible ahora mismo para cualquier visitante.'
            : 'Se mostrará automáticamente a partir de la fecha de anuncio de ganadores.'
        }
      />
    </div>
  )
}
