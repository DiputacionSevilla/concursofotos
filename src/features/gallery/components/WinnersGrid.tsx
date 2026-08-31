'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { WinnerItem } from '../services/get-winners'
import { CATEGORIA_LABELS, CATEGORIA_OPTIONS } from '@/shared/utils/categorias'
import { GRUPOS_EDAD, PREMIO_LABELS, PREMIO_ORDER } from '@/shared/utils/premios'
import type { SubmissionCategoria } from '@/shared/types/database'

const PREMIO_STYLES: Record<string, string> = {
  primero: 'bg-yellow-500 text-white',
  segundo: 'bg-stone-400 text-white',
  tercero: 'bg-amber-700 text-white',
}

export function WinnersGrid({ items }: { items: WinnerItem[] }) {
  const [filtro, setFiltro] = useState<SubmissionCategoria | 'all'>('all')

  if (items.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no se han anunciado los ganadores.</p>
  }

  const filtrados = filtro === 'all' ? items : items.filter((i) => i.categoria === filtro)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro('all')}
          className={`rounded-full px-3 py-1 text-sm ${
            filtro === 'all' ? 'bg-terracotta-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Todas
        </button>
        {CATEGORIA_OPTIONS.map((c) => (
          <button
            key={c.value}
            onClick={() => setFiltro(c.value)}
            className={`rounded-full px-3 py-1 text-sm ${
              filtro === c.value
                ? 'bg-terracotta-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        {CATEGORIA_OPTIONS.filter((c) => filtro === 'all' || filtro === c.value).map((categoria) => {
          const enCategoria = filtrados.filter((i) => i.categoria === categoria.value)
          if (enCategoria.length === 0) return null

          return (
            <div key={categoria.value}>
              <h2 className="font-display text-xl font-bold text-stone-900">{categoria.label}</h2>

              {GRUPOS_EDAD.map((grupo) => {
                const enGrupo = PREMIO_ORDER.map((premio) =>
                  enCategoria.find((i) => i.grupoEdad === grupo && i.premio === premio)
                ).filter((i): i is WinnerItem => Boolean(i))

                if (enGrupo.length === 0) return null

                return (
                  <div key={grupo} className="mt-4">
                    <h3 className="text-sm font-semibold text-azulejo-700">{grupo}</h3>
                    <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {enGrupo.map((item) => (
                        <figure key={item.id} className="card overflow-hidden">
                          <div className="relative aspect-[4/3] bg-stone-100">
                            {item.signedUrl && (
                              <Image src={item.signedUrl} alt={item.title} fill className="object-cover" />
                            )}
                            <span
                              className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow ${PREMIO_STYLES[item.premio]}`}
                            >
                              {PREMIO_LABELS[item.premio]}
                            </span>
                          </div>
                          <figcaption className="p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-azulejo-600">
                              {CATEGORIA_LABELS[item.categoria]}
                            </p>
                            <h3 className="mt-1 font-display font-semibold text-stone-900">{item.title}</h3>
                            {item.description && (
                              <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                            )}
                            <p className="mt-2 text-xs text-stone-400">{item.authorName}</p>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
