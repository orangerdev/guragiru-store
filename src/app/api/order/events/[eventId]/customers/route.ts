import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import { getCustomersByEvent, createCustomer } from '@/lib/db/orders'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { eventId } = await params
  const db = await getDb()
  const customers = await getCustomersByEvent(db, Number(eventId))
  return NextResponse.json({ customers })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { eventId } = await params
  const body = await request.json() as { name?: string }
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Nama customer wajib diisi' }, { status: 400 })
  }

  const db = await getDb()
  const customer = await createCustomer(db, Number(eventId), body.name.trim())
  return NextResponse.json({ customer }, { status: 201 })
}
