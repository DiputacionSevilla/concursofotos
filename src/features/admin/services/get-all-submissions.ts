import { createClient } from '@/lib/supabase/server'
import { calcularEdad, grupoEdadLabel } from '@/shared/utils/edad'
import type {
  GrupoEdad,
  PremioTipo,
  SubmissionCategoria,
  SubmissionOrigen,
  SubmissionStatus,
} from '@/shared/types/database'

export type AdminSubmissionRow = {
  id: string
  title: string
  description: string | null
  status: SubmissionStatus
  categoria: SubmissionCategoria
  premio: PremioTipo | null
  origen: SubmissionOrigen
  created_at: string
  reviewed_at: string | null
  storage_path: string
  signedUrl: string | null
  participantId: string
  authorNombre: string | null
  authorApellidos: string | null
  authorName: string
  authorEmail: string
  authorTelefono: string | null
  authorFechaNacimiento: string | null
  authorEdad: number | null
  grupoEdad: GrupoEdad | 'Sin especificar'
  tutorNombre: string | null
  tutorDni: string | null
}

export async function getAllSubmissions(): Promise<AdminSubmissionRow[]> {
  const supabase = await createClient()

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select(
      'id, title, description, status, categoria, premio, origen, created_at, reviewed_at, storage_path, participant_id, profiles!submissions_participant_id_fkey(nombre, apellidos, email, telefono, fecha_nacimiento, tutor_nombre, tutor_dni)'
    )
    .order('created_at', { ascending: false })

  if (error || !submissions) return []

  return Promise.all(
    submissions.map(async (s) => {
      const { data } = await supabase.storage.from('contest-photos').createSignedUrl(s.storage_path, 3600)
      const author = s.profiles
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status as SubmissionStatus,
        categoria: s.categoria as SubmissionCategoria,
        premio: s.premio as PremioTipo | null,
        origen: s.origen as SubmissionOrigen,
        created_at: s.created_at,
        reviewed_at: s.reviewed_at,
        storage_path: s.storage_path,
        signedUrl: data?.signedUrl ?? null,
        participantId: s.participant_id,
        authorNombre: author?.nombre ?? null,
        authorApellidos: author?.apellidos ?? null,
        authorName: [author?.nombre, author?.apellidos].filter(Boolean).join(' ') || 'Sin nombre',
        authorEmail: author?.email ?? '',
        authorTelefono: author?.telefono ?? null,
        authorFechaNacimiento: author?.fecha_nacimiento ?? null,
        authorEdad: author?.fecha_nacimiento ? calcularEdad(author.fecha_nacimiento) : null,
        grupoEdad: grupoEdadLabel(author?.fecha_nacimiento ?? null) as GrupoEdad | 'Sin especificar',
        tutorNombre: author?.tutor_nombre ?? null,
        tutorDni: author?.tutor_dni ?? null,
      }
    })
  )
}
