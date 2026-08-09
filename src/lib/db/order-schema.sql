-- Order Management Schema
-- Run via: wrangler d1 execute guragiru-cms --file=src/lib/db/order-schema.sql

-- Step 1: Add role column to existing admins table
-- ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';
-- (Run separately since ALTER TABLE may fail if column already exists)

-- Events (replaces individual Google Sheets per event)
CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    archived    INTEGER NOT NULL DEFAULT 0
);

-- Customers per event
CREATE TABLE IF NOT EXISTS event_customers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id    INTEGER NOT NULL REFERENCES events(id),
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(event_id, name)
);

-- Line items per customer
CREATE TABLE IF NOT EXISTS event_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES event_customers(id),
    item_name   TEXT NOT NULL,
    quantity    INTEGER NOT NULL CHECK(quantity > 0),
    price       INTEGER NOT NULL,
    cost_price  INTEGER DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Invoice counter (daily auto-increment)
CREATE TABLE IF NOT EXISTS invoice_counters (
    date        TEXT PRIMARY KEY,
    counter     INTEGER NOT NULL DEFAULT 0
);

-- Orders / Invoice ledger
CREATE TABLE IF NOT EXISTS orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id      TEXT NOT NULL UNIQUE,
    event_name      TEXT NOT NULL,
    customer_name   TEXT NOT NULL,
    phone           TEXT NOT NULL,
    subtotal        INTEGER NOT NULL,
    discount        INTEGER NOT NULL DEFAULT 0,
    shipping        INTEGER NOT NULL DEFAULT 0,
    total           INTEGER NOT NULL,
    payment_url     TEXT,
    invoice_file    TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Order line items
CREATE TABLE IF NOT EXISTS order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    item_name   TEXT NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  INTEGER NOT NULL,
    subtotal    INTEGER NOT NULL
);

-- Config key-value store
CREATE TABLE IF NOT EXISTS config (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_event_customers_event ON event_customers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_items_customer ON event_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_invoice ON orders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_events_archived ON events(archived);
