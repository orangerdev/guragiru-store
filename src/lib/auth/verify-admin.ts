import { SignJWT, jwtVerify } from 'jose'

const ALGORITHM = 'HS256'
const TOKEN_EXPIRY = '24h'

export type UserRole = 'admin' | 'administrator' | 'data_input'

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return new TextEncoder().encode(secret)
}

export interface AdminPayload {
  sub: string
  email: string
  role: UserRole
}

export async function createAdminToken(
  adminId: string,
  email: string,
  role: UserRole = 'admin'
): Promise<string> {
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecretKey())
}

export async function verifyAdminToken(
  token: string
): Promise<AdminPayload> {
  const { payload } = await jwtVerify(token, getSecretKey(), {
    algorithms: [ALGORITHM],
  })

  const role = payload.role as string
  const validRoles: UserRole[] = ['admin', 'administrator', 'data_input']
  if (!validRoles.includes(role as UserRole)) {
    throw new Error('Invalid role')
  }

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: role as UserRole,
  }
}

export function assertRole(
  session: AdminPayload,
  ...allowedRoles: UserRole[]
): void {
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Insufficient privilege')
  }
}
