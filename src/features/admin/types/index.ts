import { z } from 'zod'

export const contestConfigSchema = z.object({
  fecha_limite_fotos: z.string().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  fecha_apertura: z.string().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  fecha_cierre: z.string().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  fecha_anuncio_ganadores: z.string().optional().or(z.literal('')).transform((v) => (v ? v : null)),
  max_fotos_por_participante: z.coerce.number().int().min(1).max(20),
  tamano_max_mb: z.coerce.number().int().min(1).max(50),
  edad_minima: z.coerce.number().int().min(0).max(99),
  galeria_publica_desde_envio: z.coerce.boolean(),
  bases_texto: z
    .string()
    .trim()
    .max(10000)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : null)),
})

export type ContestConfigInput = z.infer<typeof contestConfigSchema>

export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected', 'winner'] as const
