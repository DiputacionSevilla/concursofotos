'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { submissionSchema, validateFile } from '../types'
import { uploadSubmission } from '../services/submissions-client'
import { CATEGORIA_OPTIONS } from '@/shared/utils/categorias'
import type { SubmissionCategoria } from '@/shared/types/database'

export function UploadForm({ userId, maxSizeMb }: { userId: string; maxSizeMb: number }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoria, setCategoria] = useState<SubmissionCategoria | ''>('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})
    setStatus('idle')

    const file = fileInputRef.current?.files?.[0]
    const parsed = submissionSchema.safeParse({ title, description, categoria })

    const fieldErrors: Record<string, string> = {}
    if (!parsed.success) {
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message
    }
    if (!file) fieldErrors.file = 'Selecciona una foto'
    else {
      const fileError = validateFile(file, maxSizeMb)
      if (fileError) fieldErrors.file = fileError
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setStatus('uploading')
    try {
      await uploadSubmission({ userId, file: file!, input: parsed.data!, maxSizeMb })
      setTitle('')
      setDescription('')
      setCategoria('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setStatus('idle')
      router.refresh()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo subir la foto.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <h2 className="font-display text-lg font-semibold text-stone-900">Sube tu foto</h2>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-stone-700">
          Título
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-stone-700">Categoría</legend>
        <div className="mt-2 space-y-2">
          {CATEGORIA_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                categoria === opt.value
                  ? 'border-terracotta-500 bg-terracotta-50'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="categoria"
                value={opt.value}
                checked={categoria === opt.value}
                onChange={() => setCategoria(opt.value)}
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

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-stone-700">
          Descripción <span className="text-stone-400">(opcional)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-stone-700">
          Foto (JPG o PNG, máx. {maxSizeMb} MB)
        </label>
        <input
          id="file"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-1 w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-terracotta-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-terracotta-700 hover:file:bg-terracotta-100"
        />
        {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
      </div>

      {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button type="submit" disabled={status === 'uploading'} className="btn-primary w-full">
        {status === 'uploading' ? 'Subiendo...' : 'Subir foto'}
      </button>
    </form>
  )
}
