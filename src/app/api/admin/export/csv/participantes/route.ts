import { NextResponse } from 'next/server'
import { requireAdmin } from '@/features/admin/services/require-admin'
import { getAllParticipants } from '@/features/admin/services/get-participants'
import { buildParticipantsCsv } from '@/features/admin/services/build-csv'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const participants = await getAllParticipants()
  const csv = buildParticipantsCsv(participants)
  const fecha = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="concurso-participantes-${fecha}.csv"`,
    },
  })
}
