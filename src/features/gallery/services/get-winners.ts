import { createAdminClient } from '@/lib/supabase/admin'
import { getContestConfig } from '@/features/contest-info/services/get-contest-config'
import { grupoEdadLabel } from '@/shared/utils/edad'
import type { GrupoEdad, PremioTipo, SubmissionCategoria } from '@/shared/types/database'

export type WinnerItem = {
  id: string
  title: string
  description: string | null
  categoria: SubmissionCategoria
  premio: PremioTipo
  signedUrl: string | null
  authorName: string
  grupoEdad: GrupoEdad | 'Sin especificar'
}

export async function getWinners(): Promise<{ items: WinnerItem[]; visible: boolean }> {
  const config = await getContestConfig()
  const visible =
    config.modo_pruebas ||
    (config.fecha_anuncio_ganadores ? new Date() > new Date(config.fecha_anuncio_ganadores) : false)

  if (!visible) return { items: [], visible: false }

  const admin = createAdminClient()
  const { data: submissions } = await admin
    .from('submissions')
    .select(
      'id, title, description, categoria, premio, storage_path, profiles!submissions_participant_id_fkey(nombre, apellidos, fecha_nacimiento)'
    )
    .eq('status', 'winner')
    .not('premio', 'is', null)

  if (!submissions) return { items: [], visible: true }

  const items = await Promise.all(
    submissions.map(async (s) => {
      const { data } = await admin.storage.from('contest-photos').createSignedUrl(s.storage_path, 3600)
      const author = s.profiles
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        categoria: s.categoria as SubmissionCategoria,
        premio: s.premio as PremioTipo,
        signedUrl: data?.signedUrl ?? null,
        authorName: [author?.nombre, author?.apellidos].filter(Boolean).join(' ') || 'Participante anónimo',
        grupoEdad: grupoEdadLabel(author?.fecha_nacimiento ?? null) as GrupoEdad | 'Sin especificar',
      }
    })
  )

  return { items, visible: true }
}
