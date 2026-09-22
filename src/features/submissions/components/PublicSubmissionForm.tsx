'use client'

import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createPublicSubmission } from '../services/create-public-submission'
import { buildCompleteProfileSchema } from '@/features/auth/types'
import { submissionSchema, validateFile } from '../types'
import { calcularEdad } from '@/shared/utils/edad'
import { CATEGORIA_OPTIONS } from '@/shared/utils/categorias'
import type { SubmissionCategoria } from '@/shared/types/database'

export function PublicSubmissionForm({
  prefilledEmail,
  emailLocked,
  edadMinima,
  maxSizeMb,
}: {
  prefilledEmail?: string
  emailLocked: boolean
  edadMinima: number
  maxSizeMb: number
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState({
    email: prefilledEmail ?? '',
    nombre: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    tutorNombre: '',
    tutorDni: '',
    title: '',
    description: '',
    categoria: '' as SubmissionCategoria | '',
  })
  const [aceptaBases, setAceptaBases] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const esMenor = useMemo(
    () => (values.fechaNacimiento ? calcularEdad(values.fechaNacimiento) < 18 : false),
    [values.fechaNacimiento]
  )

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setStatus('idle')

    const fieldErrors: Record<string, string> = {}

    if (!emailLocked && !/.+@.+\..+/.test(values.email)) {
      fieldErrors.email = 'Introduce un email válido'
    }

    const perfilParsed = buildCompleteProfileSchema(edadMinima).safeParse({
      nombre: values.nombre,
      apellidos: values.apellidos,
      telefono: values.telefono,
      fechaNacimiento: values.fechaNacimiento,
      tutorNombre: values.tutorNombre,
      tutorDni: values.tutorDni,
      aceptaBases,
    })
    if (!perfilParsed.success) {
      for (const issue of perfilParsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message
    }

    const submissionParsed = submissionSchema.safeParse({
      title: values.title,
      description: values.description,
      categoria: values.categoria,
    })
    if (!submissionParsed.success) {
      for (const issue of submissionParsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message
    }

    const file = fileInputRef.current?.files?.[0]
    if (!file) fieldErrors.file = 'Selecciona una foto'
    else {
      const fileError = validateFile(file, maxSizeMb)
      if (fileError) fieldErrors.file = fileError
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setStatus('saving')
    try {
      const formData = new FormData()
      formData.set('email', values.email)
      formData.set('nombre', values.nombre)
      formData.set('apellidos', values.apellidos)
      formData.set('telefono', values.telefono)
      formData.set('fechaNacimiento', values.fechaNacimiento)
      formData.set('tutorNombre', values.tutorNombre)
      formData.set('tutorDni', values.tutorDni)
      formData.set('aceptaBases', String(aceptaBases))
      formData.set('title', values.title)
      formData.set('description', values.description)
      formData.set('categoria', values.categoria)
      formData.set('file', file!)

      await createPublicSubmission(formData)

      router.push('/participar')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo enviar la foto.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card mx-auto max-w-2xl space-y-4 p-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-stone-900">Envía tu foto</h2>
        <p className="mt-1 text-sm text-stone-600">
          Completa tus datos y sube la foto en un solo paso. Quedará pendiente de revisión, igual
          que si te hubieras registrado antes.
        </p>
      </div>

      <label className="block text-sm font-medium text-stone-700">
        Email
        <input
          type="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          readOnly={emailLocked}
          className={`input ${emailLocked ? 'bg-stone-100 text-stone-500' : ''}`}
        />
        {errors.email && <p className="mt-1 text-sm font-normal text-red-600">{errors.email}</p>}
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nombre" error={errors.nombre}>
          <input type="text" value={values.nombre} onChange={(e) => update('nombre', e.target.value)} className="input" />
        </Field>
        <Field label="Apellidos" error={errors.apellidos}>
          <input
            type="text"
            value={values.apellidos}
            onChange={(e) => update('apellidos', e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Fecha de nacimiento" error={errors.fechaNacimiento}>
          <input
            type="date"
            value={values.fechaNacimiento}
            onChange={(e) => update('fechaNacimiento', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Teléfono" optional error={errors.telefono}>
          <input
            type="tel"
            value={values.telefono}
            onChange={(e) => update('telefono', e.target.value)}
            className="input"
          />
        </Field>
      </div>

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
              onChange={(e) => update('tutorNombre', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="DNI del tutor/a" error={errors.tutorDni}>
            <input
              type="text"
              value={values.tutorDni}
              onChange={(e) => update('tutorDni', e.target.value)}
              className="input"
            />
          </Field>
        </div>
      )}

      <hr className="border-stone-200" />

      <Field label="Título de la foto" error={errors.title}>
        <input type="text" value={values.title} onChange={(e) => update('title', e.target.value)} className="input" />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-stone-700">Categoría</legend>
        <div className="mt-2 space-y-2">
          {CATEGORIA_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                values.categoria === opt.value
                  ? 'border-terracotta-500 bg-terracotta-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="categoria-publica"
                checked={values.categoria === opt.value}
                onChange={() => update('categoria', opt.value)}
                className="mt-0.5 h-4 w-4 text-terracotta-600 focus:ring-terracotta-500"
              />
              <span>
                <span className="block font-medium text-stone-900">{opt.label}</span>
                <span className="block text-stone-500">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>}
      </fieldset>

      <Field label="Descripción" optional error={errors.description}>
        <textarea
          rows={3}
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
          className="input"
        />
      </Field>

      <div>
        <label htmlFor="public-file" className="block text-sm font-medium text-stone-700">
          Foto (JPG, PNG o WEBP, máx. {maxSizeMb} MB)
        </label>
        <input
          id="public-file"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-terracotta-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-terracotta-700 hover:file:bg-terracotta-100"
        />
        {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="aceptaBases"
          type="checkbox"
          checked={aceptaBases}
          onChange={(e) => setAceptaBases(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-terracotta-600 focus:ring-terracotta-600"
        />
        <label htmlFor="aceptaBases" className="text-sm text-stone-600">
          He leído y acepto las bases del concurso de fotografía.
        </label>
      </div>
      {errors.aceptaBases && <p className="text-sm text-red-600">{errors.aceptaBases}</p>}

      {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button type="submit" disabled={status === 'saving'} className="btn-primary w-full">
        {status === 'saving' ? 'Enviando...' : 'Enviar foto'}
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
