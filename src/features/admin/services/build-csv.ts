import type { AdminSubmissionRow } from './get-all-submissions'
import type { AdminParticipantRow } from './get-participants'
import { CATEGORIA_LABELS } from '@/shared/utils/categorias'
import { PREMIO_LABELS } from '@/shared/utils/premios'
import { STATUS_LABELS } from '@/features/submissions/components/StatusBadge'

function csvCell(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value)
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function formatFecha(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
}

export function buildCsv(submissions: AdminSubmissionRow[]): string {
  const headers = [
    'Título',
    'Categoría',
    'Grupo de edad',
    'Estado',
    'Premio',
    'Origen',
    'Nombre',
    'Apellidos',
    'Email',
    'Teléfono',
    'Fecha de nacimiento',
    'Edad',
    'Tutor/a',
    'DNI tutor/a',
    'Descripción',
    'Fecha de envío',
    'Fecha de revisión',
  ]

  const rows = submissions.map((s) => [
    s.title,
    CATEGORIA_LABELS[s.categoria],
    s.grupoEdad,
    STATUS_LABELS[s.status],
    s.premio ? PREMIO_LABELS[s.premio] : '',
    s.origen === 'email' ? 'Email' : 'Web',
    s.authorNombre ?? '',
    s.authorApellidos ?? '',
    s.authorEmail,
    s.authorTelefono ?? '',
    s.authorFechaNacimiento ?? '',
    s.authorEdad ?? '',
    s.tutorNombre ?? '',
    s.tutorDni ?? '',
    s.description ?? '',
    formatFecha(s.created_at),
    formatFecha(s.reviewed_at),
  ])

  const bom = '﻿' // Excel abre bien los acentos con BOM UTF-8
  return bom + [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
}

export function buildParticipantsCsv(participants: AdminParticipantRow[]): string {
  const headers = [
    'Nombre',
    'Apellidos',
    'Email',
    'Teléfono',
    'Fecha de nacimiento',
    'Edad',
    'Grupo de edad',
    'Perfil completo',
    'Nº de fotos enviadas',
    'Fecha de registro',
  ]

  const rows = participants.map((p) => [
    p.nombre ?? '',
    p.apellidos ?? '',
    p.email,
    p.telefono ?? '',
    p.fechaNacimiento ?? '',
    p.edad ?? '',
    p.grupoEdad,
    p.perfilCompleto ? 'Sí' : 'No',
    p.numEnvios,
    formatFecha(p.createdAt),
  ])

  const bom = '﻿'
  return bom + [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
}
