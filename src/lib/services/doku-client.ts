/**
 * DOKU Checkout v1 payment gateway client.
 * Uses Web Crypto API (crypto.subtle) for HMAC-SHA256 signatures.
 */

interface DokuPaymentParams {
  clientId: string
  secretKey: string
  invoiceId: string
  amount: number
  customerName: string
  customerEmail: string
}

async function generateDokuSignature(
  clientId: string,
  requestId: string,
  timestamp: string,
  body: string,
  secretKey: string
): Promise<string> {
  // SHA-256 digest of request body
  const digestBuf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(body)
  )
  const digest = btoa(String.fromCharCode(...new Uint8Array(digestBuf)))

  // Signature string components (joined by newline)
  const sigString = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Target:/checkout/v1/payment`,
    `Digest:${digest}`,
  ].join('\n')

  // HMAC-SHA256 sign
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(sigString)
  )

  return `HMACSHA256=${btoa(String.fromCharCode(...new Uint8Array(sig)))}`
}

/**
 * Create a DOKU payment and return the payment URL.
 */
export async function createDokuPayment(params: DokuPaymentParams): Promise<string> {
  const { clientId, secretKey, invoiceId, amount, customerName, customerEmail } = params

  const requestId = crypto.randomUUID()
  const timestamp = new Date().toISOString()

  const requestBody = {
    order: {
      amount,
      invoice_number: invoiceId,
    },
    payment: {
      payment_due_date: 60, // minutes
    },
    customer: {
      name: customerName,
      email: customerEmail || undefined,
    },
  }

  const bodyStr = JSON.stringify(requestBody)
  const signature = await generateDokuSignature(clientId, requestId, timestamp, bodyStr, secretKey)

  const response = await fetch('https://api.doku.com/checkout/v1/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      'Request-Id': requestId,
      'Request-Timestamp': timestamp,
      Signature: signature,
    },
    body: bodyStr,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DOKU API error: ${response.status} - ${errorText}`)
  }

  const data = (await response.json()) as {
    response?: { payment?: { url?: string } }
    payment?: { url?: string }
  }

  const paymentUrl =
    data.response?.payment?.url || data.payment?.url

  if (!paymentUrl) {
    throw new Error('DOKU response missing payment URL')
  }

  return paymentUrl
}
