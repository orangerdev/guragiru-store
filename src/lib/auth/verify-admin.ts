import { SignJWT, jwtVerify } from 'jose'

const ALGORITHM = 'HS256'
const TOKEN_EXPIRY = '24h'

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return new TextEncoder().encode(secret)
}

export interface AdminPayload {
  sub: string
  email: string
  role: 'admin'
}

export async function createAdminToken(
  adminId: string,
  email: string
): Promise<string> {
  return new SignJWT({ email, role: 'admin' })
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

  if (payload.role !== 'admin') {
    throw new Error('Insufficient privilege')
  }

  return {
    sub: payload.sub as string,
    email: payload.email as string,
    role: 'admin',
  }
}
