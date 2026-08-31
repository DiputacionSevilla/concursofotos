import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { requireAdmin } from '@/features/admin/services/require-admin'
import { getAllSubmissions, type AdminSubmissionRow } from '@/features/admin/services/get-all-submissions'
import { buildCsv } from '@/features/admin/services/build-csv'
import { CATEGORIA_LABELS } from '@/shared/utils/categorias'
import type { SubmissionStatus } from '@/shared/types/database'

function sanitize(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .slice(0, 60)
}

function extensionOf(storagePath: string): string {
  return storagePath.split('.').pop() || 'jpg'
}

export async function GET(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status') as SubmissionStatus | 'all' | null
  const categoriaFilter = searchParams.get('categoria')

  const all = await getAllSubmissions()
  const filtered = all.filter((s) => {
    const matchesStatus = !statusFilter || statusFilter === 'all' ? true : s.status === statusFilter
    const matchesCategoria = categoriaFilter ? s.categoria === categoriaFilter : true
    return matchesStatus && matchesCategoria
  })

  if (filtered.length === 0) {
    return NextResponse.json({ error: 'No hay fotos que coincidan con el filtro' }, { status: 404 })
  }

  const zip = new JSZip()
  const usedNames = new Set<string>()

  await Promise.all(
    filtered.map(async (s: AdminSubmissionRow) => {
      const { data, error } = await admin.supabase.storage.from('contest-photos').download(s.storage_path)
      if (error || !data) return

      const carpeta = CATEGORIA_LABELS[s.categoria]
      let base = sanitize(`${s.authorApellidos ?? ''} ${s.authorNombre ?? ''} - ${s.title}`) || s.id
      let filename = `${carpeta}/${base}.${extensionOf(s.storage_path)}`
      let n = 2
      while (usedNames.has(filename)) {
        filename = `${carpeta}/${base} (${n}).${extensionOf(s.storage_path)}`
        n++
      }
      usedNames.add(filename)

      const buffer = await data.arrayBuffer()
      zip.file(filename, buffer)
    })
  )

  zip.file('listado.csv', buildCsv(filtered))

  const generated = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
  const bytes = new Uint8Array(generated)
  const fecha = new Date().toISOString().slice(0, 10)

  return new NextResponse(new Blob([bytes]), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="concurso-fotos-${fecha}.zip"`,
    },
  })
}
