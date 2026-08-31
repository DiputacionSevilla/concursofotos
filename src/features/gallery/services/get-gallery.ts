import { createAdminClient } from '@/lib/supabase/admin'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { grupoEdadLabel } from '@/shared/utils/edad'
import type { SubmissionCategoria } from '@/shared/types/database'

export type GalleryItem = {
  id: string
  title: string
  description: string | null
  status: string
  categoria: SubmissionCategoria
  signedUrl: string | null
  authorName: string
  grupoEdad: string
}

export async function getGallery(): Promise<{ items: GalleryItem[]; visible: boolean }> {
  const config = await getContestConfig()
  const contestClosed = config.fecha_cierre ? new Date() > new Date(config.fecha_cierre) : false
  const visible = config.galeria_publica_desde_envio || contestClosed || config.modo_pruebas

  if (!visible) return { items: [], visible: false }

  const admin = createAdminClient()
  const { data: submissions } = await admin
    .from('submissions')
    .select(
      'id, title, description, status, categoria, storage_path, profiles!submissions_participant_id_fkey(nombre, apellidos, fecha_nacimiento)'
    )
    .in('status', ['approved', 'winner'])
    .order('status', { ascending: true }) // 'approved' antes que 'winner' alfabeticamente; se reordena abajo
    .order('created_at', { ascending: false })

  if (!submissions) return { items: [], visible: true }

  // ganadoras primero, luego el resto por fecha (ya vienen ordenadas por fecha dentro de cada grupo)
  const sorted = [...submissions].sort((a, b) => (a.status === b.status ? 0 : a.status === 'winner' ? -1 : 1))

  const items = await Promise.all(
    sorted.map(async (s) => {
      const { data } = await admin.storage.from('contest-photos').createSignedUrl(s.storage_path, 3600)
      const author = s.profiles
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        categoria: s.categoria as SubmissionCategoria,
        signedUrl: data?.signedUrl ?? null,
        authorName: [author?.nombre, author?.apellidos].filter(Boolean).join(' ') || 'Participante anónimo',
        grupoEdad: grupoEdadLabel(author?.fecha_nacimiento ?? null),
      }
    })
  )

  return { items, visible: true }
}
