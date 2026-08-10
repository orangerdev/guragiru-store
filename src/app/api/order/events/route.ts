import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import { getEvents, createEvent } from '@/lib/db/orders'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const events = await getEvents(db)
  return NextResponse.json({ events })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { name?: string }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Nama event wajib diisi' }, { status: 400 })
  }

  const db = await getDb()
  const event = await createEvent(db, body.name.trim())
  return NextResponse.json({ event }, { status: 201 })
}
