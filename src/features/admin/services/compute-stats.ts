import type { AdminSubmissionRow } from './get-all-submissions'
import { CATEGORIA_OPTIONS } from '@/shared/utils/categorias'
import { GRUPOS_EDAD } from '@/shared/utils/premios'
import type { SubmissionStatus } from '@/shared/types/database'

export type AdminStats = {
  total: number
  porEstado: Record<SubmissionStatus, number>
  porCategoria: Array<{ value: string; label: string; count: number }>
  porGrupoEdad: Array<{ label: string; count: number }>
  participantesRegistrados: number
  participantesConEnvio: number
}

export function computeStats(
  submissions: AdminSubmissionRow[],
  participantesRegistrados: number
): AdminStats {
  const porEstado: Record<SubmissionStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    winner: 0,
  }
  for (const s of submissions) porEstado[s.status]++

  const porCategoria = CATEGORIA_OPTIONS.map((c) => ({
    value: c.value,
    label: c.label,
    count: submissions.filter((s) => s.categoria === c.value).length,
  }))

  const porGrupoEdad = GRUPOS_EDAD.map((g) => ({
    label: g,
    count: submissions.filter((s) => s.grupoEdad === g).length,
  }))

  const participantesConEnvio = new Set(submissions.map((s) => s.participantId)).size

  return {
    total: submissions.length,
    porEstado,
    porCategoria,
    porGrupoEdad,
    participantesRegistrados,
    participantesConEnvio,
  }
}
