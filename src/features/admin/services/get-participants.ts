import { createClient } from '@/lib/supabase/server'
import { calcularEdad, grupoEdadLabel } from '@/shared/utils/edad'
import type { GrupoEdad } from '@/shared/types/database'

export type AdminParticipantRow = {
  id: string
  email: string
  nombre: string | null
  apellidos: string | null
  telefono: string | null
  fechaNacimiento: string | null
  edad: number | null
  grupoEdad: GrupoEdad | 'Sin especificar'
  perfilCompleto: boolean
  createdAt: string
  numEnvios: number
}

export async function getAllParticipants(): Promise<AdminParticipantRow[]> {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, nombre, apellidos, telefono, fecha_nacimiento, acepta_bases, created_at')
    .eq('role', 'participant')
    .order('created_at', { ascending: false })

  if (error || !profiles) return []

  const { data: submissions } = await supabase.from('submissions').select('participant_id')
  const counts = new Map<string, number>()
  for (const s of submissions ?? []) {
    counts.set(s.participant_id, (counts.get(s.participant_id) ?? 0) + 1)
  }

  return profiles.map((p) => ({
    id: p.id,
    email: p.email,
    nombre: p.nombre,
    apellidos: p.apellidos,
    telefono: p.telefono,
    fechaNacimiento: p.fecha_nacimiento,
    edad: p.fecha_nacimiento ? calcularEdad(p.fecha_nacimiento) : null,
    grupoEdad: grupoEdadLabel(p.fecha_nacimiento) as GrupoEdad | 'Sin especificar',
    perfilCompleto: Boolean(p.nombre && p.acepta_bases),
    createdAt: p.created_at,
    numEnvios: counts.get(p.id) ?? 0,
  }))
}
