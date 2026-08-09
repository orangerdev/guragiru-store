import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import { getItemsByCustomer } from '@/lib/db/orders'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { customerId } = await params
  const db = await getDb()
  const items = await getItemsByCustomer(db, Number(customerId))
  return NextResponse.json({ items })
}
