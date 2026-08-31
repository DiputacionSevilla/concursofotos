'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '../services/get-gallery'
import { CATEGORIA_LABELS, CATEGORIA_OPTIONS } from '@/shared/utils/categorias'
import type { SubmissionCategoria } from '@/shared/types/database'

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filtro, setFiltro] = useState<SubmissionCategoria | 'all'>('all')

  if (items.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no hay fotos publicadas en la galería.</p>
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

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((item) => (
          <figure key={item.id} className="card overflow-hidden">
            <div className="relative aspect-[4/3] bg-stone-100">
              {item.signedUrl && (
                <Image src={item.signedUrl} alt={item.title} fill className="object-cover" />
              )}
              {item.status === 'winner' && (
                <span className="absolute left-2 top-2 rounded-full bg-terracotta-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                  Ganadora
                </span>
              )}
            </div>
            <figcaption className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-azulejo-600">
                {CATEGORIA_LABELS[item.categoria]}
              </p>
              <h3 className="mt-1 font-display font-semibold text-stone-900">{item.title}</h3>
              {item.description && <p className="mt-1 text-sm text-stone-600">{item.description}</p>}
              <p className="mt-2 text-xs text-stone-400">
                {item.authorName} · {item.grupoEdad}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
