import { createAdminToken, type UserRole } from '@/lib/auth/verify-admin'
import { verifyPassword } from '@/lib/auth/password'
import { setSessionCookie } from '@/lib/auth/session'
import { getDb } from '@/lib/db/d1'
import type { Admin } from '@/lib/db/types'
import { NextRequest, NextResponse } from 'next/server'

const ORDER_ROLES: UserRole[] = ['admin', 'administrator', 'data_input']

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

    if (!ORDER_ROLES.includes(admin.role as UserRole)) {
      return NextResponse.json(
        { error: 'Access denied. Order management role required.' },
        { status: 403 }
      )
    }

    const valid = await verifyPassword(password, admin.password_hash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await createAdminToken(admin.id, email, admin.role as UserRole)
    await setSessionCookie(token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Order login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
