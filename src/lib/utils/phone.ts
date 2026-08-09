/**
 * Normalize Indonesian phone numbers to 62xxx format.
 * - 08xxx → 628xxx
 * - +628xxx → 628xxx
 * - 628xxx → 628xxx (no change)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return ''
  let clean = phone.replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (clean.startsWith('0')) clean = '62' + clean.substring(1)
  if (!clean.startsWith('62')) clean = '62' + clean
  return clean
}
