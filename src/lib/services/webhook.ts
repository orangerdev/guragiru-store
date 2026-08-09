/**
 * n8n webhook sender.
 * Sends invoice notification to n8n workflow → WhatsApp.
 * Field names are a contract — n8n workflow depends on these exact keys.
 */

export interface WebhookPayload {
  file_url: string
  customer_name: string
  phone_number: string
  total_amount: string
  invoice_id: string
  mime_type: string
  file_name: string
  items: string
  payment_url: string
}

export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<void> {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
