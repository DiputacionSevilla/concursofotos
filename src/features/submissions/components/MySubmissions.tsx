'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { SubmissionWithUrl } from '../services/get-my-submissions'
import { deleteSubmission } from '../services/submissions-client'
import { StatusBadge } from './StatusBadge'
import { CATEGORIA_LABELS } from '@/shared/utils/categorias'
import type { SubmissionCategoria } from '@/shared/types/database'

export function MySubmissions({ items }: { items: SubmissionWithUrl[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(item: SubmissionWithUrl) {
    if (!confirm(`¿Eliminar "${item.title}"?`)) return
    setDeletingId(item.id)
    try {
      await deleteSubmission(item.storage_path, item.id)
      router.refresh()
    } catch {
      alert('No se pudo eliminar la foto. Inténtalo de nuevo.')
    } finally {
      setDeletingId(null)
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no has subido ninguna foto.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} className="card overflow-hidden">
          <div className="relative aspect-[4/3] bg-stone-100">
            {item.signedUrl && (
              <Image src={item.signedUrl} alt={item.title} fill className="object-cover" />
            )}
          </div>
          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-stone-900">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-azulejo-600">
              {CATEGORIA_LABELS[item.categoria as SubmissionCategoria]}
            </p>
            {item.description && <p className="text-sm text-stone-600">{item.description}</p>}
            {item.status === 'pending' && (
              <button
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.id}
                className="text-sm text-red-600 hover:underline disabled:opacity-60"
              >
                {deletingId === item.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
