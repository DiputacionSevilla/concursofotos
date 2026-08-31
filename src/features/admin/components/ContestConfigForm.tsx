'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/shared/types/database'
import { updateContestConfig } from '../services/moderation-actions'

function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16)
}

function toIso(local: string): string {
  return new Date(local).toISOString()
}

export function ContestConfigForm({ config }: { config: Tables<'contest_config'> }) {
  const router = useRouter()
  const [values, setValues] = useState({
    fecha_limite_fotos: toLocalInput(config.fecha_limite_fotos),
    fecha_apertura: toLocalInput(config.fecha_apertura),
    fecha_cierre: toLocalInput(config.fecha_cierre),
    fecha_anuncio_ganadores: toLocalInput(config.fecha_anuncio_ganadores),
    max_fotos_por_participante: config.max_fotos_por_participante,
    tamano_max_mb: config.tamano_max_mb,
    edad_minima: config.edad_minima,
    galeria_publica_desde_envio: config.galeria_publica_desde_envio,
    bases_texto: config.bases_texto ?? '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    try {
      await updateContestConfig({
        ...values,
        fecha_limite_fotos: values.fecha_limite_fotos ? toIso(values.fecha_limite_fotos) : null,
        fecha_apertura: values.fecha_apertura ? toIso(values.fecha_apertura) : null,
        fecha_cierre: values.fecha_cierre ? toIso(values.fecha_cierre) : null,
        fecha_anuncio_ganadores: values.fecha_anuncio_ganadores
          ? toIso(values.fecha_anuncio_ganadores)
          : null,
      })
      setStatus('saved')
      router.refresh()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-display text-lg font-semibold text-stone-900">Configuración del concurso</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Hacer las fotos (fecha límite)">
          <input
            type="datetime-local"
            value={values.fecha_limite_fotos}
            onChange={(e) => setValues((v) => ({ ...v, fecha_limite_fotos: e.target.value }))}
            className="input"
          />
        </Field>
        <Field label="Anuncio de ganadores">
          <input
            type="datetime-local"
            value={values.fecha_anuncio_ganadores}
            onChange={(e) => setValues((v) => ({ ...v, fecha_anuncio_ganadores: e.target.value }))}
            className="input"
          />
        </Field>
        <Field label="Apertura de subida de fotos">
          <input
            type="datetime-local"
            value={values.fecha_apertura}
            onChange={(e) => setValues((v) => ({ ...v, fecha_apertura: e.target.value }))}
            className="input"
          />
        </Field>
        <Field label="Cierre de subida de fotos">
          <input
            type="datetime-local"
            value={values.fecha_cierre}
            onChange={(e) => setValues((v) => ({ ...v, fecha_cierre: e.target.value }))}
            className="input"
          />
        </Field>
        <Field label="Máx. fotos por participante">
          <input
            type="number"
            min={1}
            max={20}
            value={values.max_fotos_por_participante}
            onChange={(e) =>
              setValues((v) => ({ ...v, max_fotos_por_participante: Number(e.target.value) }))
            }
            className="input"
          />
        </Field>
        <Field label="Tamaño máx. por foto (MB)">
          <input
            type="number"
            min={1}
            max={50}
            value={values.tamano_max_mb}
            onChange={(e) => setValues((v) => ({ ...v, tamano_max_mb: Number(e.target.value) }))}
            className="input"
          />
        </Field>
        <Field label="Edad mínima (0 = sin restricción)">
          <input
            type="number"
            min={0}
            max={99}
            value={values.edad_minima}
            onChange={(e) => setValues((v) => ({ ...v, edad_minima: Number(e.target.value) }))}
            className="input"
          />
        </Field>
        <div className="flex items-end gap-2 pb-2">
          <input
            id="galeria_publica"
            type="checkbox"
            checked={values.galeria_publica_desde_envio}
            onChange={(e) =>
              setValues((v) => ({ ...v, galeria_publica_desde_envio: e.target.checked }))
            }
            className="h-4 w-4 rounded border-stone-300 text-terracotta-600"
          />
          <label htmlFor="galeria_publica" className="text-sm text-stone-700">
            Mostrar fotos aprobadas en la galería antes del cierre
          </label>
        </div>
      </div>

      <Field label="Bases del concurso (texto público)">
        <textarea
          rows={8}
          value={values.bases_texto}
          onChange={(e) => setValues((v) => ({ ...v, bases_texto: e.target.value }))}
          className="input"
          placeholder="Pega aquí el texto oficial de las bases cuando esté disponible..."
        />
      </Field>

      {status === 'error' && <p className="text-sm text-red-600">No se pudo guardar. Inténtalo de nuevo.</p>}
      {status === 'saved' && <p className="text-sm text-green-700">Cambios guardados.</p>}

      <button type="submit" disabled={status === 'saving'} className="btn-primary">
        {status === 'saving' ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      {children}
    </label>
  )
}
