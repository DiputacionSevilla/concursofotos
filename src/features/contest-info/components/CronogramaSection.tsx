import type { Tables } from '@/shared/types/database'
import { formatDate } from '@/shared/utils/format-date'

export function CronogramaSection({ config }: { config: Tables<'contest_config'> }) {
  const pasos = [
    { label: 'Hacer tus fotos', fecha: config.fecha_limite_fotos, hasta: true },
    { label: 'Abre la subida', fecha: config.fecha_apertura, hasta: false },
    { label: 'Cierra la subida', fecha: config.fecha_cierre, hasta: true },
    { label: 'Anuncio de ganadores', fecha: config.fecha_anuncio_ganadores, hasta: false },
  ].filter((p) => p.fecha)

  if (pasos.length === 0) return null

  return (
    <section className="bg-azulejo-50 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-azulejo-600">
            Calendario
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-stone-900">Fechas importantes</h2>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => (
            <div key={p.label} className="card relative p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-azulejo-600 text-sm font-semibold text-white">
                {i + 1}
              </span>
              <p className="mt-4 text-sm font-medium text-stone-500">{p.label}</p>
              <p className="mt-1 font-display text-lg font-semibold text-stone-900">
                {p.hasta ? 'hasta ' : ''}
                {formatDate(p.fecha)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
