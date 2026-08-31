import type { SubmissionStatus } from '@/shared/types/database'

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: 'Pendiente de revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  winner: 'Ganadora',
}

const STYLES: Record<SubmissionStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  winner: 'bg-terracotta-100 text-terracotta-800 font-semibold',
}

export function StatusBadge({ status }: { status: string }) {
  const s = status as SubmissionStatus
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${STYLES[s] ?? 'bg-stone-100 text-stone-700'}`}>
      {STATUS_LABELS[s] ?? status}
    </span>
  )
}
