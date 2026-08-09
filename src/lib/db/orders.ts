import type { Event, EventCustomer, EventItem, Order, OrderItem, ConfigEntry } from './types'

// ── Events ──

export async function getEvents(db: D1Database, includeArchived = false): Promise<Event[]> {
  const query = includeArchived
    ? 'SELECT * FROM events ORDER BY created_at DESC'
    : 'SELECT * FROM events WHERE archived = 0 ORDER BY created_at DESC'
  const result = await db.prepare(query).all<Event>()
  return result.results
}

export async function getEventById(db: D1Database, id: number): Promise<Event | null> {
  return db.prepare('SELECT * FROM events WHERE id = ?').bind(id).first<Event>()
}

export async function createEvent(db: D1Database, name: string): Promise<Event | null> {
  await db
    .prepare('INSERT INTO events (name) VALUES (?)')
    .bind(name.trim())
    .run()
  return db
    .prepare('SELECT * FROM events WHERE name = ?')
    .bind(name.trim())
    .first<Event>()
}

export async function archiveEvent(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('UPDATE events SET archived = 1 WHERE id = ?')
    .bind(id)
    .run()
  return result.success
}

// ── Customers ──

export async function getCustomersByEvent(db: D1Database, eventId: number): Promise<EventCustomer[]> {
  const result = await db
    .prepare('SELECT * FROM event_customers WHERE event_id = ? ORDER BY created_at DESC')
    .bind(eventId)
    .all<EventCustomer>()
  return result.results
}

export async function getCustomerById(db: D1Database, id: number): Promise<EventCustomer | null> {
  return db.prepare('SELECT * FROM event_customers WHERE id = ?').bind(id).first<EventCustomer>()
}

export async function createCustomer(db: D1Database, eventId: number, name: string): Promise<EventCustomer | null> {
  await db
    .prepare('INSERT INTO event_customers (event_id, name) VALUES (?, ?)')
    .bind(eventId, name.trim())
    .run()
  return db
    .prepare('SELECT * FROM event_customers WHERE event_id = ? AND name = ?')
    .bind(eventId, name.trim())
    .first<EventCustomer>()
}

// ── Items ──

export async function getItemsByCustomer(db: D1Database, customerId: number): Promise<EventItem[]> {
  const result = await db
    .prepare('SELECT * FROM event_items WHERE customer_id = ? ORDER BY created_at DESC')
    .bind(customerId)
    .all<EventItem>()
  return result.results
}

export async function getItemById(db: D1Database, id: number): Promise<EventItem | null> {
  return db.prepare('SELECT * FROM event_items WHERE id = ?').bind(id).first<EventItem>()
}

export async function createItem(
  db: D1Database,
  customerId: number,
  data: { item_name: string; quantity: number; price: number; cost_price?: number }
): Promise<EventItem | null> {
  const result = await db
    .prepare('INSERT INTO event_items (customer_id, item_name, quantity, price, cost_price) VALUES (?, ?, ?, ?, ?)')
    .bind(customerId, data.item_name.trim(), data.quantity, data.price, data.cost_price ?? 0)
    .run()
  const id = result.meta.last_row_id
  return db.prepare('SELECT * FROM event_items WHERE id = ?').bind(id).first<EventItem>()
}

export async function updateItem(
  db: D1Database,
  id: number,
  data: { item_name?: string; quantity?: number; price?: number; cost_price?: number }
): Promise<EventItem | null> {
  const existing = await getItemById(db, id)
  if (!existing) return null

  await db
    .prepare(
      'UPDATE event_items SET item_name = ?, quantity = ?, price = ?, cost_price = ? WHERE id = ?'
    )
    .bind(
      data.item_name?.trim() ?? existing.item_name,
      data.quantity ?? existing.quantity,
      data.price ?? existing.price,
      data.cost_price ?? existing.cost_price,
      id
    )
    .run()
  return getItemById(db, id)
}

export async function deleteItem(db: D1Database, id: number): Promise<boolean> {
  const result = await db.prepare('DELETE FROM event_items WHERE id = ?').bind(id).run()
  return result.success
}

// ── Orders ──

export async function getOrders(db: D1Database, limit = 50, offset = 0): Promise<Order[]> {
  const result = await db
    .prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(limit, offset)
    .all<Order>()
  return result.results
}

export async function getOrderById(db: D1Database, id: number): Promise<Order | null> {
  return db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<Order>()
}

export async function getOrderByInvoiceId(db: D1Database, invoiceId: string): Promise<Order | null> {
  return db.prepare('SELECT * FROM orders WHERE invoice_id = ?').bind(invoiceId).first<Order>()
}

export async function getOrderItems(db: D1Database, orderId: number): Promise<OrderItem[]> {
  const result = await db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .bind(orderId)
    .all<OrderItem>()
  return result.results
}

export async function getOrderCount(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) as count FROM orders').first<{ count: number }>()
  return row?.count ?? 0
}

export async function createOrderWithItems(
  db: D1Database,
  order: {
    invoice_id: string
    event_name: string
    customer_name: string
    phone: string
    subtotal: number
    discount: number
    shipping: number
    total: number
    payment_url?: string
    invoice_file?: string
  },
  items: { item_name: string; quantity: number; unit_price: number; subtotal: number }[]
): Promise<Order | null> {
  const orderStmt = db
    .prepare(
      `INSERT INTO orders (invoice_id, event_name, customer_name, phone, subtotal, discount, shipping, total, payment_url, invoice_file)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      order.invoice_id,
      order.event_name,
      order.customer_name,
      order.phone,
      order.subtotal,
      order.discount,
      order.shipping,
      order.total,
      order.payment_url ?? null,
      order.invoice_file ?? null
    )

  const itemStmts = items.map((item) =>
    db
      .prepare(
        'INSERT INTO order_items (order_id, item_name, quantity, unit_price, subtotal) VALUES ((SELECT id FROM orders WHERE invoice_id = ?), ?, ?, ?, ?)'
      )
      .bind(order.invoice_id, item.item_name, item.quantity, item.unit_price, item.subtotal)
  )

  await db.batch([orderStmt, ...itemStmts])
  return getOrderByInvoiceId(db, order.invoice_id)
}

// ── Config ──

export async function getConfig(db: D1Database, key: string): Promise<string | null> {
  const row = await db.prepare('SELECT value FROM config WHERE key = ?').bind(key).first<ConfigEntry>()
  return row?.value ?? null
}

export async function getAllConfig(db: D1Database): Promise<ConfigEntry[]> {
  const result = await db.prepare('SELECT * FROM config ORDER BY key').all<ConfigEntry>()
  return result.results
}

export async function setConfig(db: D1Database, key: string, value: string): Promise<void> {
  await db
    .prepare('INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?')
    .bind(key, value, value)
    .run()
}

// ── Stats ──

export async function getEventCount(db: D1Database): Promise<number> {
  const row = await db.prepare('SELECT COUNT(*) as count FROM events WHERE archived = 0').first<{ count: number }>()
  return row?.count ?? 0
}

export async function getCustomerCount(db: D1Database): Promise<number> {
  const row = await db
    .prepare('SELECT COUNT(*) as count FROM event_customers')
    .first<{ count: number }>()
  return row?.count ?? 0
}
