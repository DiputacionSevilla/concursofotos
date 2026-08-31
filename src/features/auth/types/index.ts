import { z } from 'zod'
import { calcularEdad } from '@/shared/utils/edad'

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Introduce un email válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Introduce un email válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Introduce un email válido'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const confirmResetSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(6, 'El código tiene 6 dígitos')
      .max(8, 'El código tiene 6 dígitos'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ConfirmResetInput = z.infer<typeof confirmResetSchema>

export function buildCompleteProfileSchema(edadMinima: number) {
  return z
    .object({
      nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
      apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios').max(150),
      telefono: z
        .string()
        .trim()
        .max(20)
        .optional()
        .or(z.literal(''))
        .transform((v) => (v ? v : undefined)),
      fechaNacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
      tutorNombre: z
        .string()
        .trim()
        .max(150)
        .optional()
        .or(z.literal(''))
        .transform((v) => (v ? v : undefined)),
      tutorDni: z
        .string()
        .trim()
        .max(20)
        .optional()
        .or(z.literal(''))
        .transform((v) => (v ? v : undefined)),
      aceptaBases: z.literal(true, {
        errorMap: () => ({ message: 'Debes aceptar las bases del concurso' }),
      }),
    })
    .superRefine((data, ctx) => {
      const edad = calcularEdad(data.fechaNacimiento)
      if (edad < edadMinima) {
        ctx.addIssue({
          code: 'custom',
          path: ['fechaNacimiento'],
          message: `Debes tener al menos ${edadMinima} años para participar`,
        })
        return
      }
      if (edad < 18 && (!data.tutorNombre || !data.tutorDni)) {
        if (!data.tutorNombre) {
          ctx.addIssue({
            code: 'custom',
            path: ['tutorNombre'],
            message: 'Obligatorio para menores de edad',
          })
        }
        if (!data.tutorDni) {
          ctx.addIssue({
            code: 'custom',
            path: ['tutorDni'],
            message: 'Obligatorio para menores de edad',
          })
        }
      }
    })
}

export type CompleteProfileInput = z.infer<ReturnType<typeof buildCompleteProfileSchema>>
