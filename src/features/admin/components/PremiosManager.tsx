'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { AdminSubmissionRow } from '../services/get-all-submissions'
import { assignPremio, removePremio } from '../services/premios-actions'
import { buildGruposPremios, PREMIO_LABELS, PREMIO_ORDER } from '@/shared/utils/premios'
import type { PremioTipo } from '@/shared/types/database'

export function PremiosManager({ submissions }: { submissions: AdminSubmissionRow[] }) {
  const router = useRouter()
  const grupos = buildGruposPremios()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAssign(submissionId: string, premio: PremioTipo) {
    if (!submissionId) return
    setBusyId(submissionId)
    startTransition(async () => {
      try {
        await assignPremio(submissionId, premio)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'No se pudo asignar el premio.')
      } finally {
        setBusyId(null)
      }
    })
  }

  function handleRemove(submissionId: string) {
    setBusyId(submissionId)
    startTransition(async () => {
      try {
        await removePremio(submissionId)
        router.refresh()
      } catch {
        alert('No se pudo quitar el premio.')
      } finally {
        setBusyId(null)
      }
    })
  }

  const hayAprobadas = submissions.some((s) => s.status === 'approved' || s.status === 'winner')

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-600">
        Asigna 1er, 2º y 3er premio por cada categoría y grupo de edad, tal como indican las bases. Solo
        se pueden premiar fotos ya aprobadas.
      </p>

      {!hayAprobadas && (
        <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Todavía no hay ninguna foto aprobada, así que no hay nada que seleccionar en ningún grupo. Ve a
          la pestaña <strong>Moderación</strong> y aprueba fotos primero — en cuanto una foto esté
          aprobada, aparecerá aquí en su categoría y grupo de edad correspondiente.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {grupos.map((grupo) => {
          const enGrupo = submissions.filter(
            (s) => s.categoria === grupo.categoria && s.grupoEdad === grupo.grupoEdad
          )

          return (
            <div key={`${grupo.categoria}-${grupo.grupoEdad}`} className="card p-5">
              <h3 className="text-sm font-semibold text-stone-900">{grupo.categoriaLabel}</h3>
              <p className="text-xs text-azulejo-600">{grupo.grupoEdad}</p>

              <div className="mt-4 space-y-3">
                {PREMIO_ORDER.map((premio) => {
                  const asignada = enGrupo.find((s) => s.status === 'winner' && s.premio === premio)
                  const elegibles = enGrupo.filter(
                    (s) => s.status === 'approved' || (s.status === 'winner' && s.premio === premio)
                  )

                  return (
                    <div key={premio} className="flex items-center gap-3 rounded-lg border border-stone-200 p-2">
                      <span className="w-28 shrink-0 text-xs font-semibold text-stone-700">
                        {PREMIO_LABELS[premio]}
                      </span>

                      {asignada ? (
                        <div className="flex flex-1 items-center gap-2">
                          <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-stone-100">
                            {asignada.signedUrl && (
                              <Image src={asignada.signedUrl} alt={asignada.title} fill className="object-cover" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-stone-900">{asignada.title}</p>
                            <p className="truncate text-xs text-stone-500">{asignada.authorName}</p>
                          </div>
                          <button
                            onClick={() => handleRemove(asignada.id)}
                            disabled={isPending && busyId === asignada.id}
                            className="shrink-0 rounded-md bg-stone-500 px-2 py-1 text-xs font-semibold text-white hover:bg-stone-600 disabled:opacity-50"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <select
                          defaultValue=""
                          disabled={isPending || elegibles.length === 0}
                          onChange={(e) => handleAssign(e.target.value, premio)}
                          className="input flex-1 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="" disabled>
                            {elegibles.length === 0 ? 'Sin fotos aprobadas en este grupo' : 'Seleccionar foto...'}
                          </option>
                          {elegibles.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title} — {s.authorName}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
