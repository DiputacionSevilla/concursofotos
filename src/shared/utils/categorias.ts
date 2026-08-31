import type { SubmissionCategoria } from '@/shared/types/database'

export const CATEGORIA_OPTIONS: Array<{
  value: SubmissionCategoria
  label: string
  description: string
}> = [
  {
    value: 'paisajes',
    label: 'Paisajes que enamoran',
    description: 'Naturaleza, campos, atardeceres y entorno de Mairena.',
  },
  {
    value: 'patrimonio',
    label: 'Nuestro patrimonio',
    description: 'Monumentos, iglesias, plazas, edificios históricos y elementos culturales.',
  },
  {
    value: 'rincon',
    label: 'Un rincón por descubrir',
    description: 'Calles pintorescas, detalles o lugares menos conocidos del pueblo.',
  },
]

export const CATEGORIA_LABELS: Record<SubmissionCategoria, string> = {
  paisajes: 'Paisajes que enamoran',
  patrimonio: 'Nuestro patrimonio',
  rincon: 'Un rincón por descubrir',
}
