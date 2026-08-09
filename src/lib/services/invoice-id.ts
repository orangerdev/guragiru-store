/**
 * Generate invoice ID with format: INV-YYYYMMDD-XXXX
 * Uses atomic counter in D1 invoice_counters table.
 */
export async function generateInvoiceId(db: D1Database): Promise<string> {
  const now = new Date()
  const dateStr =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')

  // Atomic upsert + increment
  await db
    .prepare(
      `INSERT INTO invoice_counters (date, counter) VALUES (?, 1)
       ON CONFLICT(date) DO UPDATE SET counter = counter + 1`
    )
    .bind(dateStr)
    .run()

  const row = await db
    .prepare('SELECT counter FROM invoice_counters WHERE date = ?')
    .bind(dateStr)
    .first<{ counter: number }>()

  const counter = String(row!.counter).padStart(4, '0')
  return `INV-${dateStr}-${counter}`
}
