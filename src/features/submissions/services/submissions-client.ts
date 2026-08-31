import { createClient } from '@/lib/supabase/client'
import { validateFile, type SubmissionInput } from '../types'

export async function uploadSubmission(params: {
  userId: string
  file: File
  input: SubmissionInput
  maxSizeMb: number
}) {
  const { userId, file, input, maxSizeMb } = params

  const fileError = validateFile(file, maxSizeMb)
  if (fileError) throw new Error(fileError)

  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('contest-photos')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError

  const { error: insertError } = await supabase.from('submissions').insert({
    participant_id: userId,
    storage_path: path,
    title: input.title,
    description: input.description ?? null,
    categoria: input.categoria,
  })

  if (insertError) {
    // La foto ya se subio a Storage pero el insert fallo (limite de fotos, concurso cerrado...):
    // deshacer para no dejar ficheros huerfanos.
    await supabase.storage.from('contest-photos').remove([path])
    throw new Error(mapInsertError(insertError.message))
  }
}

export async function deleteSubmission(storagePath: string, submissionId: string) {
  const supabase = createClient()

  // Borrar primero el objeto de Storage: su policy exige que la submission siga
  // en 'pending', asi que el orden importa (si se borra la fila antes, la policy
  // de Storage ya no encuentra la submission y rechaza el delete).
  const { error: storageError } = await supabase.storage.from('contest-photos').remove([storagePath])
  if (storageError) throw storageError

  const { error: dbError } = await supabase.from('submissions').delete().eq('id', submissionId)
  if (dbError) throw dbError
}

function mapInsertError(message: string): string {
  if (message.includes('maximo de')) return message.replace('maximo', 'máximo')
  if (message.includes('no ha comenzado')) return 'El concurso aún no ha comenzado.'
  if (message.includes('ha finalizado')) return 'El plazo de participación ha finalizado.'
  return message
}
