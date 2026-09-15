import type { AdminStats } from '../services/compute-stats'
import type { Tables } from '@/shared/types/database'
import { formatDate } from '@/shared/utils/format-date'

function diasHasta(iso: string | null): string {
  if (!iso) return 'Sin fecha'
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff > 1) return `Dentro de ${diff} días`
  if (diff === 1) return 'Mañana'
  if (diff === 0) return 'Hoy'
  if (diff === -1) return 'Hace 1 día'
  return `Hace ${Math.abs(diff)} días`
}

export function StatsOverview({ stats, config }: { stats: AdminStats; config: Tables<'contest_config'> }) {
  const maxCategoria = Math.max(1, ...stats.porCategoria.map((c) => c.count))
  const maxGrupo = Math.max(1, ...stats.porGrupoEdad.map((g) => g.count))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Fotos recibidas" value={stats.total} />
        <StatCard label="Pendientes" value={stats.porEstado.pending} accent="text-amber-600" />
        <StatCard label="Aprobadas" value={stats.porEstado.approved} accent="text-green-700" />
        <StatCard label="Rechazadas" value={stats.porEstado.rejected} accent="text-red-600" />
        <StatCard label="Ganadoras" value={stats.porEstado.winner} accent="text-terracotta-600" />
        <StatCard label="Participantes" value={stats.participantesRegistrados} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-stone-900">Fotos por categoría</h3>
          <div className="mt-4 space-y-3">
            {stats.porCategoria.map((c) => (
              <div key={c.value}>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>{c.label}</span>
                  <span className="font-medium">{c.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-azulejo-500"
                    style={{ width: `${(c.count / maxCategoria) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold text-stone-900">Fotos por grupo de edad</h3>
          <div className="mt-4 space-y-3">
            {stats.porGrupoEdad.map((g) => (
              <div key={g.label}>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>{g.label}</span>
                  <span className="font-medium">{g.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-terracotta-500"
                    style={{ width: `${(g.count / maxGrupo) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone-500">
            {stats.participantesConEnvio} de {stats.participantesRegistrados} participantes registrados ya
            han enviado una foto.
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-stone-900">Calendario del concurso</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FechaItem label="Apertura de subida" iso={config.fecha_apertura} />
          <FechaItem label="Cierre de subida" iso={config.fecha_cierre} />
          <FechaItem label="Límite para hacer las fotos" iso={config.fecha_limite_fotos} />
          <FechaItem label="Anuncio de ganadores" iso={config.fecha_anuncio_ganadores} />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="card p-4">
      <p className={`text-2xl font-bold ${accent ?? 'text-stone-900'}`}>{value}</p>
      <p className="mt-1 text-xs text-stone-500">{label}</p>
    </div>
  )
}

function FechaItem({ label, iso }: { label: string; iso: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-stone-900">
        {formatDate(iso)}
      </p>
      <p className="text-xs text-azulejo-600">{diasHasta(iso)}</p>
    </div>
  )
}
