'use client'

import { useState } from 'react'
import type { AdminSubmissionRow } from '../services/get-all-submissions'
import type { AdminParticipantRow } from '../services/get-participants'
import type { AdminStats } from '../services/compute-stats'
import type { Tables } from '@/shared/types/database'
import { StatsOverview } from './StatsOverview'
import { ModerationTable } from './ModerationTable'
import { ParticipantsTable } from './ParticipantsTable'
import { ManualSubmissionForm } from './ManualSubmissionForm'
import { PremiosManager } from './PremiosManager'
import { ExportPanel } from './ExportPanel'
import { SharePanel } from './SharePanel'
import { ContestConfigForm } from './ContestConfigForm'
import { DangerZone } from './DangerZone'
import { TestModeBanner } from './TestModeBanner'

type Tab =
  | 'resumen'
  | 'moderacion'
  | 'anadir-email'
  | 'participantes'
  | 'ganadores'
  | 'exportar'
  | 'compartir'
  | 'configuracion'
  | 'peligro'

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'resumen', label: 'Resumen' },
  { value: 'moderacion', label: 'Moderación' },
  { value: 'anadir-email', label: 'Añadir por email' },
  { value: 'participantes', label: 'Participantes' },
  { value: 'ganadores', label: 'Ganadores' },
  { value: 'exportar', label: 'Exportar' },
  { value: 'compartir', label: 'Compartir' },
  { value: 'configuracion', label: 'Configuración' },
  { value: 'peligro', label: 'Reiniciar sistema' },
]

export function AdminDashboard({
  submissions,
  participants,
  stats,
  config,
}: {
  submissions: AdminSubmissionRow[]
  participants: AdminParticipantRow[]
  stats: AdminStats
  config: Tables<'contest_config'>
}) {
  const [tab, setTab] = useState<Tab>('resumen')

  const pendientes = stats.porEstado.pending
  const aprobadasSinFiltro = submissions.filter((s) => s.status === 'approved' || s.status === 'winner')

  return (
    <div className="space-y-4">
      <TestModeBanner modoPruebas={config.modo_pruebas} />

      <div className="flex flex-wrap gap-1 border-b border-stone-200">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              t.value === 'peligro'
                ? tab === t.value
                  ? 'text-red-700'
                  : 'text-red-400 hover:text-red-600'
                : tab === t.value
                  ? 'text-terracotta-700'
                  : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.label}
            {t.value === 'moderacion' && pendientes > 0 && (
              <span className="ml-1.5 rounded-full bg-terracotta-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {pendientes}
              </span>
            )}
            {tab === t.value && (
              <span
                className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full ${t.value === 'peligro' ? 'bg-red-600' : 'bg-terracotta-600'}`}
              />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'resumen' && <StatsOverview stats={stats} config={config} />}
        {tab === 'moderacion' && <ModerationTable items={submissions} />}
        {tab === 'anadir-email' && (
          <ManualSubmissionForm edadMinima={config.edad_minima} maxSizeMb={config.tamano_max_mb} />
        )}
        {tab === 'participantes' && <ParticipantsTable items={participants} />}
        {tab === 'ganadores' && <PremiosManager submissions={aprobadasSinFiltro} />}
        {tab === 'exportar' && <ExportPanel />}
        {tab === 'compartir' && <SharePanel config={config} />}
        {tab === 'configuracion' && <ContestConfigForm config={config} />}
        {tab === 'peligro' && <DangerZone />}
      </div>
    </div>
  )
}
