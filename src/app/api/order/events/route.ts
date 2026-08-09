import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import { getEvents } from '@/lib/db/orders'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await getDb()
  const events = await getEvents(db)
  return NextResponse.json({ events })
}
