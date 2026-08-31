import { NextResponse } from 'next/server'
import { requireAdmin } from '@/features/admin/services/require-admin'
import { getAllSubmissions } from '@/features/admin/services/get-all-submissions'
import { buildCsv } from '@/features/admin/services/build-csv'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const submissions = await getAllSubmissions()
  const csv = buildCsv(submissions)
  const fecha = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="concurso-fotos-${fecha}.csv"`,
    },
  })
}
