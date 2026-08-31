'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { AdminSubmissionRow } from '../services/get-all-submissions'
import { updateSubmissionStatus } from '../services/moderation-actions'
import { StatusBadge } from '@/features/submissions/components/StatusBadge'
import type { SubmissionCategoria, SubmissionStatus } from '@/shared/types/database'
import { CATEGORIA_LABELS, CATEGORIA_OPTIONS } from '@/shared/utils/categorias'

const FILTERS: Array<{ value: SubmissionStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
  { value: 'winner', label: 'Ganadoras' },
]

export function ModerationTable({ items }: { items: AdminSubmissionRow[] }) {
  const router = useRouter()
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('pending')
  const [categoriaFilter, setCategoriaFilter] = useState<SubmissionCategoria | 'all'>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const [bulkBusy, setBulkBusy] = useState(false)

  const filtered = useMemo(
    () =>
      items.filter(
        (i) => (filter === 'all' || i.status === filter) && (categoriaFilter === 'all' || i.categoria === categoriaFilter)
      ),
    [items, filter, categoriaFilter]
  )

  function handleAction(id: string, status: SubmissionStatus) {
    setPendingId(id)
    startTransition(async () => {
      try {
        await updateSubmissionStatus(id, status)
        router.refresh()
      } catch {
        alert('No se pudo actualizar la foto.')
      } finally {
        setPendingId(null)
      }
    })
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id))))
  }

  async function handleBulk(status: SubmissionStatus) {
    setBulkBusy(true)
    try {
      await Promise.all(Array.from(selected).map((id) => updateSubmissionStatus(id, status)))
      setSelected(new Set())
      router.refresh()
    } catch {
      alert('No se pudieron actualizar algunas fotos.')
    } finally {
      setBulkBusy(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === f.value
                  ? 'bg-terracotta-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={categoriaFilter}
          onChange={(e) => setCategoriaFilter(e.target.value as SubmissionCategoria | 'all')}
          className="input w-auto py-1.5 text-sm"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIA_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">No hay fotos en esta categoría.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2 text-stone-600">
              <input
                type="checkbox"
                checked={selected.size > 0 && selected.size === filtered.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-stone-300 text-terracotta-600"
              />
              Seleccionar todas ({filtered.length})
            </label>

            {selected.size > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-stone-500">{selected.size} seleccionadas</span>
                <button
                  onClick={() => handleBulk('approved')}
                  disabled={bulkBusy}
                  className="rounded-md bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  Aprobar seleccionadas
                </button>
                <button
                  onClick={() => handleBulk('rejected')}
                  disabled={bulkBusy}
                  className="rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                >
                  Rechazar seleccionadas
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {filtered.map((item) => (
              <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row">
                <div className="flex shrink-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelected(item.id)}
                    className="mt-2 h-4 w-4 rounded border-stone-300 text-terracotta-600"
                  />
                  <a
                    href={item.signedUrl ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block h-40 w-full flex-shrink-0 bg-stone-100 sm:w-56"
                  >
                    {item.signedUrl && (
                      <Image src={item.signedUrl} alt={item.title} fill className="rounded-md object-cover" />
                    )}
                  </a>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-stone-900">{item.title}</h3>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {item.origen === 'email' && (
                        <span className="rounded-full bg-azulejo-100 px-2 py-0.5 text-xs text-azulejo-700">
                          Email
                        </span>
                      )}
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                  {item.description && <p className="text-sm text-stone-600">{item.description}</p>}
                  <p className="text-xs font-medium text-azulejo-700">
                    {CATEGORIA_LABELS[item.categoria]} · {item.grupoEdad}
                    {item.authorEdad !== null ? ` (${item.authorEdad} años)` : ''}
                  </p>
                  <p className="text-xs text-stone-400">
                    {item.authorName} · {item.authorEmail}
                    {item.authorTelefono ? ` · ${item.authorTelefono}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <ActionButton
                      label="Aprobar"
                      disabled={isPending && pendingId === item.id}
                      onClick={() => handleAction(item.id, 'approved')}
                      className="bg-green-700 hover:bg-green-800"
                    />
                    <ActionButton
                      label="Rechazar"
                      disabled={isPending && pendingId === item.id}
                      onClick={() => handleAction(item.id, 'rejected')}
                      className="bg-red-700 hover:bg-red-800"
                    />
                    {item.status !== 'pending' && (
                      <ActionButton
                        label="Volver a pendiente"
                        disabled={isPending && pendingId === item.id}
                        onClick={() => handleAction(item.id, 'pending')}
                        className="bg-stone-500 hover:bg-stone-600"
                      />
                    )}
                    {item.signedUrl && (
                      <a
                        href={item.signedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-azulejo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-azulejo-700"
                      >
                        Ver / descargar
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  disabled,
  className,
}: {
  label: string
  onClick: () => void
  disabled: boolean
  className: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${className}`}
    >
      {label}
    </button>
  )
}
