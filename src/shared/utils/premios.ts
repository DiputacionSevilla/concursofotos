import type { GrupoEdad, PremioTipo, SubmissionCategoria } from '@/shared/types/database'
import { CATEGORIA_OPTIONS } from './categorias'

export const PREMIO_LABELS: Record<PremioTipo, string> = {
  primero: '1er Premio',
  segundo: '2º Premio (finalista)',
  tercero: '3er Premio (finalista)',
}

export const PREMIO_ORDER: PremioTipo[] = ['primero', 'segundo', 'tercero']

export const GRUPOS_EDAD: GrupoEdad[] = ['Infantil / Juvenil', 'Adultos']

export type GrupoPremios = {
  categoria: SubmissionCategoria
  categoriaLabel: string
  grupoEdad: GrupoEdad
}

export function buildGruposPremios(): GrupoPremios[] {
  const grupos: GrupoPremios[] = []
  for (const cat of CATEGORIA_OPTIONS) {
    for (const grupoEdad of GRUPOS_EDAD) {
      grupos.push({ categoria: cat.value, categoriaLabel: cat.label, grupoEdad })
    }
  }
  return grupos
}
