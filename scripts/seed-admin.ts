/**
 * Generate admin password hash and output SQL to insert into D1.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts <email> <password>
 *
 * Then run the output SQL via:
 *   wrangler d1 execute guragiru-cms --remote --command "<output SQL>"
 */

async function hashPassword(password: string): Promise<string> {
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

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Usage: npx tsx scripts/seed-admin.ts <email> <password>')
    process.exit(1)
  }

  const hash = await hashPassword(password)
  const id = crypto.randomUUID().replace(/-/g, '')

  console.log('\n--- Password Hash (for .env.local) ---')
  console.log(`ADMIN_PASSWORD_HASH=${hash}`)
  console.log(`ADMIN_EMAIL=${email}`)

  console.log('\n--- D1 SQL (run with wrangler d1 execute) ---')
  console.log(`INSERT INTO admins (id, email, password_hash) VALUES ('${id}', '${email}', '${hash}');`)

  console.log('\n--- Full wrangler command ---')
  console.log(`CLOUDFLARE_ACCOUNT_ID=f3220be65561be3e2702e46228a6defd npx wrangler d1 execute guragiru-cms --remote --command "INSERT INTO admins (id, email, password_hash) VALUES ('${id}', '${email}', '${hash}');"`)
}

main()
