import { getSession } from '@/lib/auth/session'
import { hashPassword } from '@/lib/auth/password'
import { getDb } from '@/lib/db/d1'
import type { Admin } from '@/lib/db/types'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin() {
  const session = await getSession()
  if (!session || !['admin', 'administrator'].includes(session.role)) {
    return null
  }
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = await getDb()
  const result = await db.prepare('SELECT id, email, role, created_at FROM admins ORDER BY created_at ASC').all<Omit<Admin, 'password_hash'>>()

  return NextResponse.json({ users: result.results })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { email, password, role } = (await request.json()) as {
      email?: string
      password?: string
      role?: string
    }

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 })
    }

    if (!['admin', 'data_input'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin or data_input' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const db = await getDb()

    const existing = await db.prepare('SELECT id FROM admins WHERE email = ?').bind(email).first()
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const id = crypto.randomUUID()
    const password_hash = await hashPassword(password)

    await db
      .prepare('INSERT INTO admins (id, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .bind(id, email, password_hash, role)
      .run()

    return NextResponse.json({ success: true, id }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
