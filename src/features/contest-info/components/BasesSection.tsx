import type { Tables } from '@/shared/types/database'
import { CATEGORIA_OPTIONS } from '@/shared/utils/categorias'

type BaseSection = { numero: string; titulo: string; parrafos: string[] }

function parseBases(texto: string): BaseSection[] {
  const secciones: BaseSection[] = []
  for (const raw of texto.split('\n')) {
    const linea = raw.trim()
    const encabezado = linea.match(/^(\d+)\.\s+(.*)$/)
    if (encabezado) {
      secciones.push({ numero: encabezado[1], titulo: encabezado[2], parrafos: [] })
    } else if (linea && secciones.length > 0) {
      secciones[secciones.length - 1].parrafos.push(linea)
    }
  }
  return secciones
}

function Parrafo({ texto }: { texto: string }) {
  const separador = texto.indexOf(':')
  if (separador > 0 && separador < 60) {
    return (
      <p>
        <strong className="text-stone-900">{texto.slice(0, separador + 1)}</strong>
        {texto.slice(separador + 1)}
      </p>
    )
  }
  return <p>{texto}</p>
}

export function BasesSection({ config }: { config: Tables<'contest_config'> }) {
  const secciones = config.bases_texto ? parseBases(config.bases_texto) : []

  return (
    <section id="bases" className="mx-auto max-w-3xl px-4 py-16">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-stone-900">
          Bases del concurso
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIA_OPTIONS.map((c) => (
          <div key={c.value} className="card p-4">
            <h3 className="font-display text-base font-semibold text-terracotta-700">{c.label}</h3>
            <p className="mt-1 text-sm text-stone-600">{c.description}</p>
          </div>
        ))}
      </div>

      {secciones.length > 0 ? (
        <div className="mt-8 space-y-3">
          {secciones.map((s) => (
            <details key={s.numero} className="card group open:shadow-md" open={Number(s.numero) <= 2}>
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-display text-base font-semibold text-stone-900">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-terracotta-100 text-sm text-terracotta-700">
                  {s.numero}
                </span>
                {s.titulo}
                <svg
                  className="ml-auto h-4 w-4 flex-shrink-0 text-stone-400 transition group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="space-y-2 px-4 pb-4 pl-14 text-sm leading-relaxed text-stone-600">
                {s.parrafos.map((p, i) => (
                  <Parrafo key={i} texto={p} />
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          Las bases oficiales se publicarán próximamente. Mientras tanto, cada participante puede
          subir hasta {config.max_fotos_por_participante} foto
          {config.max_fotos_por_participante === 1 ? '' : 's'} (máx.{' '}
          {config.tamano_max_mb} MB por foto, formato JPG, PNG o WEBP).
        </p>
      )}
    </section>
  )
}
