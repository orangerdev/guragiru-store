import { getSession } from '@/lib/auth/session'
import { hashPassword } from '@/lib/auth/password'
import { getDb } from '@/lib/db/d1'
import { NextRequest, NextResponse } from 'next/server'

async function requireAdmin() {
  const session = await getSession()
  if (!session || !['admin', 'administrator'].includes(session.role)) {
    return null
  }
  return session
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    const { email, password, role } = (await request.json()) as {
      email?: string
      password?: string
      role?: string
    }

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    if (!['admin', 'data_input'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be admin or data_input' }, { status: 400 })
    }

    const db = await getDb()

    const user = await db.prepare('SELECT id FROM admins WHERE id = ?').bind(id).first()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const conflict = await db.prepare('SELECT id FROM admins WHERE email = ? AND id != ?').bind(email, id).first()
    if (conflict) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })

    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
      }
      const password_hash = await hashPassword(password)
      await db
        .prepare('UPDATE admins SET email = ?, role = ?, password_hash = ? WHERE id = ?')
        .bind(email, role, password_hash, id)
        .run()
    } else {
      await db
        .prepare('UPDATE admins SET email = ?, role = ? WHERE id = ?')
        .bind(email, role, id)
        .run()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Prevent self-deletion
  if (session.sub === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  try {
    const db = await getDb()

    const user = await db.prepare('SELECT id FROM admins WHERE id = ?').bind(id).first()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await db.prepare('DELETE FROM admins WHERE id = ?').bind(id).run()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
