import { z } from 'zod'

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const submissionSchema = z.object({
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(150),
  description: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  categoria: z.enum(['paisajes', 'patrimonio', 'rincon'], {
    errorMap: () => ({ message: 'Elige una categoría' }),
  }),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

export function validateFile(file: File, maxSizeMb: number): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return 'Formato no admitido. Usa JPG, PNG o WEBP.'
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return `El archivo supera el tamaño máximo permitido (${maxSizeMb} MB).`
  }
  return null
}
