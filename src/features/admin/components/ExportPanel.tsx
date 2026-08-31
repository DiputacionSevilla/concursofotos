import { CATEGORIA_OPTIONS } from '@/shared/utils/categorias'

export function ExportPanel() {
  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-stone-900">Listado de fotos enviadas</h3>
        <p className="mt-1 text-xs text-stone-500">
          Una fila por cada foto enviada (con los datos de quien la envió: contacto, categoría, estado,
          premio...). Quien se ha registrado pero no ha enviado foto <strong>no aparece aquí</strong> —
          usa el listado de participantes para eso.
        </p>
        <a href="/api/admin/export/csv" className="btn-primary mt-4 inline-block">
          Descargar fotos CSV
        </a>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-stone-900">Listado de participantes</h3>
        <p className="mt-1 text-xs text-stone-500">
          Una fila por cada cuenta registrada (haya enviado foto o no), con si completó el perfil y cuántas
          fotos ha enviado. Coincide con el número que ves en &quot;Resumen&quot; y en la pestaña
          &quot;Participantes&quot;.
        </p>
        <a href="/api/admin/export/csv/participantes" className="btn-primary mt-4 inline-block">
          Descargar participantes CSV
        </a>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-stone-900">Descarga masiva de fotos</h3>
        <p className="mt-1 text-xs text-stone-500">
          Descarga las fotos organizadas en carpetas por categoría, junto con un listado.csv dentro del
          ZIP.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/api/admin/export/zip?status=approved" className="btn-primary">
            ZIP · Aprobadas
          </a>
          <a href="/api/admin/export/zip?status=winner" className="btn-secondary">
            ZIP · Ganadoras
          </a>
          <a href="/api/admin/export/zip?status=all" className="btn-secondary">
            ZIP · Todas
          </a>
        </div>

        <p className="mt-4 text-xs font-medium text-stone-500">Por categoría (solo aprobadas)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIA_OPTIONS.map((c) => (
            <a
              key={c.value}
              href={`/api/admin/export/zip?status=approved&categoria=${c.value}`}
              className="rounded-md bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-200"
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
