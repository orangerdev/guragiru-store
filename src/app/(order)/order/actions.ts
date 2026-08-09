'use server'

import { getSession } from '@/lib/auth/session'
import { assertRole } from '@/lib/auth/verify-admin'
import { getDb } from '@/lib/db/d1'
import {
  createEvent,
  archiveEvent,
  getEvents,
  getEventById,
  createCustomer,
  getCustomersByEvent,
  getCustomerById,
  createItem,
  updateItem,
  deleteItem,
  getItemsByCustomer,
  getOrders,
  getOrderById,
  getOrderItems,
  getOrderCount,
  getEventCount,
  getCustomerCount,
  getAllConfig,
  setConfig,
} from '@/lib/db/orders'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

function assertSameOrigin(headersList: Headers): void {
  const origin = headersList.get('origin')
  const host = headersList.get('host')
  if (!origin || !host) throw new Error('Missing origin headers')
  const originHost = new URL(origin).host
  if (originHost !== host) {
    throw new Error(`CSRF: origin mismatch ${originHost} !== ${host}`)
  }
}

async function requireOrderUser() {
  const session = await getSession()
  if (!session || !['admin', 'administrator', 'data_input'].includes(session.role)) {
    redirect('/admin/login')
  }
  return session
}

// ── Events ──

export async function createEventAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireOrderUser()

  const name = formData.get('name') as string
  if (!name?.trim()) throw new Error('Event name is required')

  const db = await getDb()
  await createEvent(db, name)

  revalidatePath('/order/events')
  redirect('/order/events')
}

export async function archiveEventAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  const session = await requireOrderUser()
  assertRole(session, 'admin', 'administrator')

  const id = Number(formData.get('id'))
  if (!id) throw new Error('Event ID is required')

  const db = await getDb()
  await archiveEvent(db, id)

  revalidatePath('/order/events')
  redirect('/order/events')
}

export async function getEventsAction() {
  await requireOrderUser()
  const db = await getDb()
  return getEvents(db)
}

export async function getEventAction(id: number) {
  await requireOrderUser()
  const db = await getDb()
  return getEventById(db, id)
}

// ── Customers ──

export async function createCustomerAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireOrderUser()

  const eventId = Number(formData.get('event_id'))
  const name = formData.get('name') as string
  if (!eventId || !name?.trim()) throw new Error('Event ID and customer name are required')

  const db = await getDb()
  await createCustomer(db, eventId, name)

  revalidatePath(`/order/events/${eventId}`)
  redirect(`/order/events/${eventId}`)
}

export async function getCustomersAction(eventId: number) {
  await requireOrderUser()
  const db = await getDb()
  return getCustomersByEvent(db, eventId)
}

// ── Items ──

export async function createItemAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireOrderUser()

  const customerId = Number(formData.get('customer_id'))
  const eventId = Number(formData.get('event_id'))
  const itemName = formData.get('item_name') as string
  const quantity = Number(formData.get('quantity'))
  const price = Number(formData.get('price'))
  const costPrice = Number(formData.get('cost_price') || '0')

  if (!customerId || !itemName?.trim() || !quantity || !price) {
    throw new Error('All item fields are required')
  }

  const db = await getDb()
  await createItem(db, customerId, {
    item_name: itemName,
    quantity,
    price,
    cost_price: costPrice,
  })

  revalidatePath(`/order/events/${eventId}/customers/${customerId}`)
  redirect(`/order/events/${eventId}/customers/${customerId}`)
}

export async function updateItemAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireOrderUser()

  const id = Number(formData.get('id'))
  const eventId = Number(formData.get('event_id'))
  const customerId = Number(formData.get('customer_id'))
  const itemName = formData.get('item_name') as string
  const quantity = Number(formData.get('quantity'))
  const price = Number(formData.get('price'))
  const costPrice = Number(formData.get('cost_price') || '0')

  if (!id) throw new Error('Item ID is required')

  const db = await getDb()
  await updateItem(db, id, {
    item_name: itemName,
    quantity,
    price,
    cost_price: costPrice,
  })

  revalidatePath(`/order/events/${eventId}/customers/${customerId}`)
  redirect(`/order/events/${eventId}/customers/${customerId}`)
}

export async function deleteItemAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  await requireOrderUser()

  const id = Number(formData.get('id'))
  const eventId = Number(formData.get('event_id'))
  const customerId = Number(formData.get('customer_id'))
  if (!id) throw new Error('Item ID is required')

  const db = await getDb()
  await deleteItem(db, id)

  revalidatePath(`/order/events/${eventId}/customers/${customerId}`)
  redirect(`/order/events/${eventId}/customers/${customerId}`)
}

// ── Orders ──

export async function getOrdersAction(limit = 50, offset = 0) {
  await requireOrderUser()
  const db = await getDb()
  return getOrders(db, limit, offset)
}

export async function getOrderAction(id: number) {
  await requireOrderUser()
  const db = await getDb()
  const order = await getOrderById(db, id)
  if (!order) return null
  const items = await getOrderItems(db, id)
  return { order, items }
}

// ── Config (administrator only) ──

export async function getConfigAction() {
  const session = await requireOrderUser()
  assertRole(session, 'admin', 'administrator')
  const db = await getDb()
  return getAllConfig(db)
}

export async function updateConfigAction(formData: FormData) {
  const headersList = await headers()
  assertSameOrigin(headersList)
  const session = await requireOrderUser()
  assertRole(session, 'admin', 'administrator')

  const key = formData.get('key') as string
  const value = formData.get('value') as string
  if (!key || value === null) throw new Error('Key and value are required')

  const db = await getDb()
  await setConfig(db, key, value)

  revalidatePath('/order/config')
  redirect('/order/config')
}

// ── Dashboard Stats ──

export async function getDashboardStatsAction() {
  await requireOrderUser()
  const db = await getDb()
  const [events, customers, orders] = await Promise.all([
    getEventCount(db),
    getCustomerCount(db),
    getOrderCount(db),
  ])
  return { events, customers, orders }
}
