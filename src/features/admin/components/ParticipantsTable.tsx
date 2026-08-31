'use client'

import { Fragment, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { AdminParticipantRow } from '../services/get-participants'
import { deleteParticipant } from '../services/participant-actions'

export function ParticipantsTable({ items }: { items: AdminParticipantRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((p) =>
      [p.nombre, p.apellidos, p.email, p.telefono].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [items, query])

  const sinFoto = items.filter((p) => p.numEnvios === 0).length
  const perfilIncompleto = items.filter((p) => !p.perfilCompleto).length

  async function handleDelete(id: string) {
    setDeletingId(id)
    setError(null)
    try {
      await deleteParticipant(id)
      setConfirmingId(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo borrar la cuenta.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          {items.length} participantes registrados · {sinFoto} sin foto enviada · {perfilIncompleto} con
          perfil sin completar
        </p>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, email o teléfono..."
          className="input w-full max-w-xs py-1.5 text-sm"
        />
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">Todavía no se ha registrado ningún participante.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Contacto</th>
                <th className="py-2 pr-4">Grupo edad</th>
                <th className="py-2 pr-4">Registro</th>
                <th className="py-2 pr-4">Perfil</th>
                <th className="py-2 pr-4">Fotos</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((p) => (
                <Fragment key={p.id}>
                  <tr>
                    <td className="py-2 pr-4 font-medium text-stone-900">
                      {[p.nombre, p.apellidos].filter(Boolean).join(' ') || (
                        <span className="text-stone-400">Sin nombre</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-stone-600">
                      <div>{p.email}</div>
                      {p.telefono && <div className="text-xs text-stone-400">{p.telefono}</div>}
                    </td>
                    <td className="py-2 pr-4 text-stone-600">{p.grupoEdad}</td>
                    <td className="py-2 pr-4 text-stone-600">
                      {new Date(p.createdAt).toLocaleDateString('es-ES', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-2 pr-4">
                      {p.perfilCompleto ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                          Completo
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                          Incompleto
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {p.numEnvios > 0 ? (
                        <span className="rounded-full bg-azulejo-100 px-2 py-0.5 text-xs text-azulejo-700">
                          {p.numEnvios}
                        </span>
                      ) : (
                        <span className="text-stone-400">0</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {confirmingId !== p.id && (
                        <button
                          onClick={() => {
                            setError(null)
                            setConfirmingId(p.id)
                          }}
                          className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                        >
                          Borrar
                        </button>
                      )}
                    </td>
                  </tr>

                  {confirmingId === p.id && (
                    <tr>
                      <td colSpan={7} className="bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-800">
                          ¿Borrar la cuenta de {p.nombre ? `${p.nombre} ${p.apellidos ?? ''}` : p.email}?
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-red-700">
                          <li>Perderá el acceso: se borra su cuenta de inicio de sesión.</li>
                          {p.numEnvios > 0 && (
                            <li>
                              <strong>
                                Ha enviado {p.numEnvios} foto{p.numEnvios > 1 ? 's' : ''}
                              </strong>
                              : se borrarán también, incluido el fichero en Storage. Si alguna está aprobada
                              o premiada, desaparecerá de la galería y de ganadores.
                            </li>
                          )}
                          {!p.perfilCompleto && (
                            <li>
                              Su perfil está <strong>incompleto</strong>: puede que sea alguien a mitad de
                              registrarse (no necesariamente una cuenta de prueba). Comprueba que
                              realmente quieres borrarla.
                            </li>
                          )}
                        </ul>
                        <p className="mt-2 text-xs text-red-600">Esta acción no se puede deshacer.</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                          >
                            {deletingId === p.id ? 'Borrando...' : 'Sí, borrar definitivamente'}
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            disabled={deletingId === p.id}
                            className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-inset ring-stone-300 hover:bg-stone-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
