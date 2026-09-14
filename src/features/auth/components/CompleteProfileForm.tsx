'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { buildCompleteProfileSchema } from '../types'
import { calcularEdad } from '@/shared/utils/edad'

type InitialValues = {
  nombre: string
  apellidos: string
  telefono: string
  fechaNacimiento: string
  tutorNombre: string
  tutorDni: string
}

export function CompleteProfileForm({
  userId,
  edadMinima,
  initialValues,
}: {
  userId: string
  edadMinima: number
  initialValues?: Partial<InitialValues>
}) {
  const router = useRouter()
  const [values, setValues] = useState({
    nombre: initialValues?.nombre ?? '',
    apellidos: initialValues?.apellidos ?? '',
    telefono: initialValues?.telefono ?? '',
    fechaNacimiento: initialValues?.fechaNacimiento ?? '',
    tutorNombre: initialValues?.tutorNombre ?? '',
    tutorDni: initialValues?.tutorDni ?? '',
    aceptaBases: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  const esMenor = useMemo(
    () => (values.fechaNacimiento ? calcularEdad(values.fechaNacimiento) < 18 : false),
    [values.fechaNacimiento]
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = buildCompleteProfileSchema(edadMinima).safeParse(values)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message
      setErrors(fieldErrors)
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        nombre: parsed.data.nombre,
        apellidos: parsed.data.apellidos,
        telefono: parsed.data.telefono ?? null,
        fecha_nacimiento: parsed.data.fechaNacimiento,
        tutor_nombre: parsed.data.tutorNombre ?? null,
        tutor_dni: parsed.data.tutorDni ?? null,
        acepta_bases: true,
      })
      .eq('id', userId)

    if (error) {
      setStatus('error')
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={errors.nombre}>
          <input
            type="text"
            value={values.nombre}
            onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
            className="input"
          />
        </Field>

        <Field label="Apellidos" error={errors.apellidos}>
          <input
            type="text"
            value={values.apellidos}
            onChange={(e) => setValues((v) => ({ ...v, apellidos: e.target.value }))}
            className="input"
          />
        </Field>
      </div>

      <Field label="Fecha de nacimiento" error={errors.fechaNacimiento}>
        <input
          type="date"
          value={values.fechaNacimiento}
          onChange={(e) => setValues((v) => ({ ...v, fechaNacimiento: e.target.value }))}
          className="input"
        />
      </Field>

      <Field label="Teléfono" optional error={errors.telefono}>
        <input
          type="tel"
          value={values.telefono}
          onChange={(e) => setValues((v) => ({ ...v, telefono: e.target.value }))}
          className="input"
        />
      </Field>

      {esMenor && (
        <div className="space-y-4 rounded-lg border border-terracotta-200 bg-terracotta-50 p-4">
          <p className="text-sm text-terracotta-900">
            Al ser menor de edad, necesitamos los datos de tu padre, madre o tutor/a para
            autorizar tu participación.
          </p>
          <Field label="Nombre y apellidos del tutor/a" error={errors.tutorNombre}>
            <input
              type="text"
              value={values.tutorNombre}
              onChange={(e) => setValues((v) => ({ ...v, tutorNombre: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="DNI del tutor/a" error={errors.tutorDni}>
            <input
              type="text"
              value={values.tutorDni}
              onChange={(e) => setValues((v) => ({ ...v, tutorDni: e.target.value }))}
              className="input"
            />
          </Field>
        </div>
      )}

      <div className="flex items-start gap-2">
        <input
          id="aceptaBases"
          type="checkbox"
          checked={values.aceptaBases}
          onChange={(e) => setValues((v) => ({ ...v, aceptaBases: e.target.checked }))}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-terracotta-600 focus:ring-terracotta-600"
        />
        <label htmlFor="aceptaBases" className="text-sm text-stone-600">
          He leído y acepto las bases del concurso de fotografía.
        </label>
      </div>
      {errors.aceptaBases && <p className="text-sm text-red-600">{errors.aceptaBases}</p>}

      {status === 'error' && (
        <p className="text-sm text-red-600">No se pudo guardar tu perfil. Inténtalo de nuevo.</p>
      )}

      <button type="submit" disabled={status === 'saving'} className="btn-primary w-full">
        {status === 'saving' ? 'Guardando...' : 'Continuar'}
      </button>
    </form>
  )
}

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string
  optional?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label} {optional && <span className="font-normal text-stone-400">(opcional)</span>}
      {children}
      {error && <p className="mt-1 text-sm font-normal text-red-600">{error}</p>}
    </label>
  )
}
