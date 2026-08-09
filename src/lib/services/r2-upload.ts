/**
 * Upload invoice PNG to R2 bucket.
 */
export async function uploadInvoiceToR2(
  r2: R2Bucket,
  invoiceId: string,
  customerName: string,
  pngData: Uint8Array
): Promise<{ key: string; fileName: string }> {
  const safeName = customerName.replace(/[^a-zA-Z0-9]/g, '_')
  const fileName = `${invoiceId}_${safeName}.png`
  const key = `invoices/${fileName}`

  await r2.put(key, pngData, {
    httpMetadata: {
      contentType: 'image/png',
    },
  })

  return { key, fileName }
}

/**
 * Get invoice image from R2 bucket.
 */
export async function getInvoiceFromR2(
  r2: R2Bucket,
  key: string
): Promise<{ data: ReadableStream; contentType: string } | null> {
  const object = await r2.get(key)
  if (!object) return null

  return {
    data: object.body,
    contentType: object.httpMetadata?.contentType || 'image/png',
  }
}
