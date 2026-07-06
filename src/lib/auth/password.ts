export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt, (b) => b.toString(16).padStart(2, '0')).join('')

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoded,
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  const hashHex = Array.from(new Uint8Array(derivedBits), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('')

  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, expectedHash] = storedHash.split(':')
  if (!saltHex || !expectedHash) return false

  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
  )
  const encoded = new TextEncoder().encode(password)

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoded,
    'PBKDF2',
    false,
    ['deriveBits']
  )

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  )

  const hashHex = Array.from(new Uint8Array(derivedBits), (b) =>
    b.toString(16).padStart(2, '0')
  ).join('')

  // Constant-time comparison
  if (hashHex.length !== expectedHash.length) return false
  let mismatch = 0
  for (let i = 0; i < hashHex.length; i++) {
    mismatch |= hashHex.charCodeAt(i) ^ expectedHash.charCodeAt(i)
  }
  return mismatch === 0
}
