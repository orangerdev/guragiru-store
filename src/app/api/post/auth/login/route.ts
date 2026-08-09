import { createAdminToken, type UserRole } from '@/lib/auth/verify-admin'
import { verifyPassword } from '@/lib/auth/password'
import { setSessionCookie } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import type { Admin } from '@/lib/db/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const admin = await db
      .prepare('SELECT * FROM admins WHERE email = ?')
      .bind(email)
      .first<Admin>()

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, admin.password_hash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const role = (admin.role || 'admin') as UserRole
    const token = await createAdminToken(admin.id, email, role)
    await setSessionCookie(token)

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
