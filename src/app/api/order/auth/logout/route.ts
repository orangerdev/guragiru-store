import { clearSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function POST() {
  await clearSession()
  return NextResponse.redirect(new URL('/order/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
}
