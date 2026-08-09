# Technical Design Document: Order Management System Migration to Cloudflare

**Author:** Principal Engineer  
**Date:** 2026-08-09  
**Status:** Draft for Review  
**Audience:** Engineering team, technical stakeholders

---

## 1. Context & Motivation

### Problem Statement

Guragiru's Order Management System currently runs on Google Apps Script (GAS) with Google Sheets as the database. While functional and free, the system has fundamental limitations:

- **Performance:** Invoice generation takes 5-15 seconds (template copy → cell fill → PNG export → Drive upload → DOKU API → webhook)
- **Reliability:** Single-threaded GAS runtime with quota limits (6-minute execution, 20K UrlFetchApp calls/day)
- **Maintainability:** No proper CI/CD, no type safety, no automated testing, data model is positional row parsing
- **Scalability:** Google Sheets degrades with >10K rows, no indexing, full column scans on every request
- **Vendor lock-in:** Entire business logic coupled to `SpreadsheetApp`, `DriveApp`, `UrlFetchApp` APIs

### Goal

Migrate the system to Cloudflare Workers ecosystem while:
1. **Maintaining $0/month cost** (primary constraint — this is a small business)
2. Replicating all existing features with functional parity
3. Improving performance, reliability, and developer experience
4. Keeping external integrations unchanged (DOKU payment gateway, n8n webhook → WhatsApp)

### Scope

This document covers the architecture for a **new Cloudflare Workers workspace** that replicates the Guragiru Order Management System. The existing GAS system remains untouched as a fallback.

---

## 2. Current System Architecture

### Tech Stack
- **Runtime:** Google Apps Script (V8)
- **Database:** Google Sheets (single spreadsheet, multiple sheets)
- **File Storage:** Google Drive
- **Frontend:** Inline HTML/CSS/JS served via `HtmlService`
- **Payment:** DOKU Checkout v1 API (HMAC-SHA256 auth)
- **Notifications:** n8n webhook → WhatsApp
- **Deployment:** `clasp push`

### Codebase (4 JS files, ~1,015 LOC backend)

| File | LOC | Responsibility |
|------|-----|----------------|
| `Code.js` | 79 | Entry point, routing, config constants |
| `InputOrder.js` | 193 | Order input CRUD against event sheets |
| `CreateInvoice.js` | 513 | Invoice generation, file export, DOKU, webhook |
| `Doku.js` | 230 | DOKU payment gateway client |

### Core Workflows

**Input Order:**
1. Select event sheet → select/create customer → add line items (item, qty, price, cost_price)
2. Data written to event sheet with grouped-row pattern (customer name on first row only)

**Invoice Generation (critical path):**
1. Select event → customer → items to invoice
2. Generate invoice ID: `INV-YYYYMMDD-XXXX` (daily counter via `PropertiesService`)
3. Append rows to ORDER sheet (one per item + discount/shipping)
4. Copy INVOICE template sheet → fill cells with data → `SpreadsheetApp.flush()`
5. Export as PNG via Google Sheets export API (fallback: PDF)
6. Upload to Google Drive folder
7. `Utilities.sleep(2000)` — wait for Drive file to be accessible
8. Call DOKU Checkout v1 API with HMAC-SHA256 signed request
9. POST webhook to n8n with invoice details + payment URL
10. Delete temp sheet, return file URL

### Data Models

**Event Sheets** (dynamic, one per event):
```
Col A: Customer Name (only first row of group)
Col B: Item Name
Col C: Quantity  
Col D: Unit Price
Col E: Cost Price (harga modal)
```

**ORDER Sheet** (append-only ledger):
```
Col A: Date | B: InvoiceID | C: CustomerName | D: Phone | E: Item | F: Qty | G: UnitPrice | H: SubTotal
```

**CONFIG Sheet:**
```
B2: DOKU_CLIENT_ID | B3: DOKU_SECRET_KEY | B4: DOKU_ENVIRONMENT
```

### External Integration Contracts (MUST preserve exactly)

**DOKU Signature Components** (joined by `\n`, HMAC-SHA256 signed):
```
Client-Id:{clientId}
Request-Id:{uuid}
Request-Timestamp:{iso8601}
Request-Target:/checkout/v1/payment
Digest:{base64(sha256(requestBody))}
```

**n8n Webhook Payload** (field names are contract — n8n workflow depends on these):
```json
{
  "file_url": "string",
  "customer_name": "string",
  "phone_number": "62xxx",
  "total_amount": "Rp 1.234.567",
  "invoice_id": "INV-YYYYMMDD-XXXX",
  "mime_type": "image/png",
  "file_name": "INV-xxx_Name.png",
  "items": "- Item A x 2, Rp 100.000\n- Item B x 1, Rp 50.000",
  "payment_url": "string"
}
```

---

## 3. Target Architecture

### Architecture Diagram

```
                        ┌──────────────────────────┐
                        │    Cloudflare Pages       │
                        │    (Static Frontend)      │
                        │    Vanilla TS + Vite      │
                        └───────────┬──────────────┘
                                    │ fetch(/api/*)
                                    v
                        ┌──────────────────────────┐
                        │    Cloudflare Worker      │
                        │    (Hono API Backend)     │
                        │    TypeScript             │
                        └──┬───────┬───────┬───────┘
                           │       │       │
            ┌──────────────┘       │       └──────────────┐
            v                      v                      v
   ┌─────────────────┐    ┌──────────────┐    ┌────────────────────┐
   │   D1 (SQLite)   │    │   R2 Bucket  │    │   External APIs    │
   │                 │    │              │    │                    │
   │  - events       │    │  invoice     │    │  - DOKU Payment    │
   │  - customers    │    │  images      │    │  - n8n Webhook     │
   │  - items        │    │  (PNG/PDF)   │    │                    │
   │  - orders       │    │              │    │                    │
   │  - config       │    │              │    │                    │
   │  - counters     │    │              │    │                    │
   └─────────────────┘    └──────────────┘    └────────────────────┘
```

### Technology Decisions

| Component | Choice | Justification |
|-----------|--------|---------------|
| Backend framework | **Hono** on Workers | 14KB, built for Workers, TypeScript-native, Express-like ergonomics |
| Database | **D1** (SQLite) | Free: 5GB storage, 5M reads/day. Relational model eliminates GAS's fragile positional row parsing |
| File storage | **R2** | Free: 10GB, 1M writes/month, 10M reads/month. Zero egress fees. Replaces Google Drive |
| Invoice rendering | **Satori + resvg-wasm** | Runs inside Worker (no external calls), JSX-like templates → SVG → PNG, zero cost |
| Frontend | **Vanilla TS + Vite** on Pages | Current UI is 2 tabs + 5 forms. Framework overhead unjustified. Pages: unlimited requests free |
| Auth | **Bearer token** in Worker secrets | Single-user system. No OAuth/session complexity needed |
| Crypto | **Web Crypto API** (`crypto.subtle`) | Native Workers API, replaces GAS `Utilities.computeHmacSha256Signature()` |

### What We Do NOT Need

| Service | Why Not |
|---------|---------|
| KV | D1 handles counter atomicity via `ON CONFLICT` — no need for separate KV |
| Queues | All operations are synchronous and fast enough (<1s). No async processing needed |
| Durable Objects | No WebSocket/real-time requirements |
| Workers AI | No AI features |
| Browser Rendering | Satori handles invoice rendering. Only consider if template complexity exceeds Satori's CSS subset |

---

## 4. D1 Database Schema

```sql
-- Events (replaces individual Google Sheets per event)
CREATE TABLE events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    archived    INTEGER NOT NULL DEFAULT 0
);

-- Customers per event (replaces Name column grouping)
CREATE TABLE event_customers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id    INTEGER NOT NULL REFERENCES events(id),
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(event_id, name)
);

-- Line items per customer (replaces rows under customer name group)
CREATE TABLE event_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL REFERENCES event_customers(id),
    item_name   TEXT NOT NULL,
    quantity    INTEGER NOT NULL CHECK(quantity > 0),
    price       INTEGER NOT NULL,      -- IDR, no decimals
    cost_price  INTEGER DEFAULT 0,     -- harga modal
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Invoice counter (replaces ScriptProperties daily counter)
CREATE TABLE invoice_counters (
    date        TEXT PRIMARY KEY,       -- YYYYMMDD
    counter     INTEGER NOT NULL DEFAULT 0
);

-- Orders / Invoice ledger (replaces ORDER sheet)
CREATE TABLE orders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id      TEXT NOT NULL UNIQUE,    -- INV-YYYYMMDD-XXXX
    event_name      TEXT NOT NULL,
    customer_name   TEXT NOT NULL,
    phone           TEXT NOT NULL,
    subtotal        INTEGER NOT NULL,
    discount        INTEGER NOT NULL DEFAULT 0,
    shipping        INTEGER NOT NULL DEFAULT 0,
    total           INTEGER NOT NULL,
    payment_url     TEXT,
    invoice_file    TEXT,                    -- R2 object key
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Order line items (normalized — better than flat ORDER sheet rows)
CREATE TABLE order_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL REFERENCES orders(id),
    item_name   TEXT NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  INTEGER NOT NULL,
    subtotal    INTEGER NOT NULL
);

-- Config key-value (replaces CONFIG sheet)
CREATE TABLE config (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);
-- Seed data:
-- INSERT INTO config VALUES ('doku_client_id', '...');
-- INSERT INTO config VALUES ('doku_secret_key', '...');
-- INSERT INTO config VALUES ('doku_environment', 'sandbox');
-- INSERT INTO config VALUES ('webhook_url', 'https://n8n-...');
```

### Why Relational Over Flat Rows

The current GAS system uses a "grouped rows" pattern where customer name appears only on the first row of a group. This requires fragile positional parsing (see `InputOrder.getNames()` lines 43-62 and `CreateInvoice.getCustomerItems()` lines 80-107). A single inserted/deleted row can corrupt the grouping.

The relational model eliminates this entirely: `events → event_customers → event_items` with proper foreign keys. Queries become trivial `SELECT ... WHERE customer_id = ?` instead of column-scanning with state machines.

---

## 5. API Design

All routes prefixed with `/api/v1`. Auth via `Authorization: Bearer <token>`.

### Events
```
GET    /api/v1/events                           → list non-archived events
POST   /api/v1/events                           → create event { name }
PATCH  /api/v1/events/:id/archive               → soft-archive
```

### Customers
```
GET    /api/v1/events/:eventId/customers         → list customers for event
POST   /api/v1/events/:eventId/customers         → create { name }
```

### Items
```
GET    /api/v1/customers/:customerId/items       → list items
POST   /api/v1/customers/:customerId/items       → add items { items: [{item_name, quantity, price, cost_price}] }
```

### Invoices (critical path)
```
POST   /api/v1/invoices                          → generate invoice
       Body: { event_id, customer_id, phone, discount?, shipping?, selected_item_ids[] }
       Response: { invoice_id, invoice_url, payment_url }

GET    /api/v1/invoices                          → list invoices (paginated)
GET    /api/v1/invoices/:invoiceId               → invoice detail
GET    /api/v1/invoices/:invoiceId/image          → R2 presigned URL redirect
```

### Config
```
GET    /api/v1/config                            → get non-sensitive config
PUT    /api/v1/config                            → update config
```

---

## 6. Invoice Generation Strategy (Hardest Problem)

### Current: Google Sheets as Template Engine
Copy INVOICE template sheet → fill cells → export PNG via `https://docs.google.com/spreadsheets/d/{id}/export?format=png`. This is deeply coupled to Google's infrastructure.

### Target: Satori + resvg-wasm (Runs Inside Worker)

**Satori** (by Vercel): Converts JSX-like object trees to SVG. Supports a subset of CSS (flexbox, no grid/float).
**resvg-wasm**: Converts SVG to PNG buffer via WebAssembly. Runs in Workers.

**Flow:**
```
Invoice Data → Satori (JSX → SVG) → resvg-wasm (SVG → PNG) → R2 Upload
```

**Rendering time:** ~50-200ms (vs 5-15s on GAS)

**Template pseudocode:**
```typescript
function buildInvoiceMarkup(data: InvoiceData): SatoriNode {
  return {
    type: 'div',
    props: {
      style: { width: 800, height: 1100, padding: 40, fontFamily: 'Inter', background: 'white' },
      children: [
        // Header: logo, date, invoice ID
        // Customer info
        // Items table (flexbox rows)
        ...data.items.map(item => ({
          type: 'div',
          props: {
            style: { display: 'flex', borderBottom: '1px solid #eee', padding: '8px 0' },
            children: [
              { type: 'div', props: { style: { flex: 3 }, children: [item.name] } },
              { type: 'div', props: { style: { flex: 1, textAlign: 'right' }, children: [String(item.qty)] } },
              { type: 'div', props: { style: { flex: 2, textAlign: 'right' }, children: [formatCurrency(item.price)] } },
              { type: 'div', props: { style: { flex: 2, textAlign: 'right' }, children: [formatCurrency(item.subtotal)] } },
            ]
          }
        })),
        // Subtotal, discount, shipping, total
        // Payment info footer
      ]
    }
  };
}
```

**Font handling:** Bundle Inter or Noto Sans as `.woff2` in R2. Load once at Worker startup, cache in global scope.

### Fallback: Cloudflare Browser Rendering
If Satori's CSS subset proves insufficient for the desired invoice design:
- Headless Chromium via `@cloudflare/puppeteer`
- Render full HTML/CSS page → screenshot
- **Requires Workers Paid plan ($5/month)** — free tier does not include Browser Rendering
- Adds 2-5 seconds latency per render
- Only pursue this if Satori cannot achieve acceptable visual fidelity

### Recommendation
**Start with Satori.** An invoice is a structured document (header, table, totals) — well within Satori's flexbox capabilities. Only escalate to Browser Rendering if the business owner requires pixel-perfect reproduction of complex design elements.

---

## 7. DOKU Payment Integration (1:1 Translation)

The DOKU integration is a direct port. Every GAS crypto primitive has a Workers equivalent:

| GAS API | Workers API |
|---------|-------------|
| `Utilities.getUuid()` | `crypto.randomUUID()` |
| `Utilities.computeDigest(SHA_256, body)` | `crypto.subtle.digest('SHA-256', body)` |
| `Utilities.computeHmacSha256Signature(data, key)` | `crypto.subtle.sign('HMAC', key, data)` |
| `Utilities.base64Encode(bytes)` | `btoa(String.fromCharCode(...new Uint8Array(bytes)))` |
| `UrlFetchApp.fetch(url, options)` | `fetch(url, options)` |

**Workers implementation:**
```typescript
async function generateDokuSignature(
  clientId: string, requestId: string, timestamp: string,
  body: object, secretKey: string
): Promise<string> {
  const bodyStr = JSON.stringify(body);
  const digestBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(bodyStr));
  const digest = btoa(String.fromCharCode(...new Uint8Array(digestBuf)));

  const sigString = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${timestamp}`,
    `Request-Target:/checkout/v1/payment`,
    `Digest:${digest}`,
  ].join('\n');

  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigString));
  return `HMACSHA256=${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}
```

**Contract preserved:** Same endpoint, same request body structure, same signature algorithm. Zero risk of breakage.

---

## 8. Webhook Integration (No Changes)

The n8n webhook payload shape is a contract. The Worker sends the exact same JSON:

```typescript
async function sendWebhook(webhookUrl: string, data: WebhookPayload): Promise<void> {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: data.fileUrl,           // R2 public URL (instead of Drive URL)
      customer_name: data.customerName,
      phone_number: data.phone,          // normalized 62xxx
      total_amount: formatCurrency(data.total),
      invoice_id: data.invoiceId,
      mime_type: data.mimeType,
      file_name: data.fileName,
      items: data.formattedItems,        // "- Item A x 2, Rp 100.000\n..."
      payment_url: data.paymentUrl || '',
    }),
  });
}
```

**Key difference:** `file_url` now points to an R2 public URL instead of Google Drive. The n8n workflow must be updated to handle this (or use R2 custom domain to keep URL format consistent). This is a **one-time config change** in n8n, not a code change.

---

## 9. Phone Number Normalization (Identical Logic)

```typescript
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
  if (clean.startsWith('0')) clean = '62' + clean.substring(1);
  if (!clean.startsWith('62')) clean = '62' + clean;
  return clean;
}
```

No changes. Works identically in Workers.

---

## 10. Project Structure

```
guragiru-order-management-cf/
├── packages/
│   ├── api/                              # Cloudflare Worker (Hono)
│   │   ├── src/
│   │   │   ├── index.ts                  # Worker entry, Hono app setup
│   │   │   ├── routes/
│   │   │   │   ├── events.ts             # Event CRUD
│   │   │   │   ├── customers.ts          # Customer CRUD
│   │   │   │   ├── items.ts              # Item CRUD
│   │   │   │   └── invoices.ts           # Invoice generation (critical path)
│   │   │   ├── services/
│   │   │   │   ├── invoice-renderer.ts   # Satori + resvg-wasm
│   │   │   │   ├── doku.ts               # DOKU payment client
│   │   │   │   ├── webhook.ts            # n8n webhook sender
│   │   │   │   └── phone.ts              # Phone normalization
│   │   │   ├── db/
│   │   │   │   ├── schema.sql            # D1 schema
│   │   │   │   └── migrations/           # D1 migrations
│   │   │   ├── templates/
│   │   │   │   └── invoice.ts            # Satori invoice template
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts               # Bearer token auth
│   │   │   └── types.ts                  # Shared types
│   │   ├── wrangler.toml
│   │   └── package.json
│   │
│   └── web/                              # Cloudflare Pages (frontend)
│       ├── index.html
│       ├── src/
│       │   ├── main.ts
│       │   ├── api.ts                    # fetch wrapper with auth
│       │   └── tabs/
│       │       ├── input-order.ts
│       │       └── create-invoice.ts
│       ├── styles/
│       │   └── main.css                  # Port from MainAppSimple.html
│       ├── vite.config.ts
│       └── package.json
│
├── package.json                          # Workspace root
└── README.md
```

---

## 11. Cost Analysis

### Current System: Google Apps Script

| Item | Monthly Cost |
|------|-------------|
| GAS runtime | $0 |
| Google Sheets (within 15GB Drive) | $0 |
| Google Drive file storage | $0 |
| **Total** | **$0** |

### Projected: Cloudflare (Satori Path)

Assumptions: ~50-100 invoices/month, ~500 API requests/day, 1-3 users, ~200KB per invoice image.

| Service | Free Tier Limit | Projected Usage | Monthly Cost |
|---------|----------------|-----------------|-------------|
| **Workers** | 100K req/day, 10ms CPU/req | ~500 req/day, ~5ms avg CPU | **$0** |
| **D1** | 5GB storage, 5M reads/day, 100K writes/day | <1MB, <1K reads/day, <100 writes/day | **$0** |
| **R2** | 10GB storage, 1M Class A, 10M Class B/mo | ~20MB/mo, ~100 writes, ~500 reads | **$0** |
| **Pages** | Unlimited requests, 500 builds/mo | ~500 req/day, ~10 builds/mo | **$0** |
| **Total** | | | **$0** |

### When Would Paid Tier Trigger?

| Trigger | Threshold | Cost |
|---------|-----------|------|
| Workers CPU exceeds 10ms avg | Unlikely — Satori renders in ~5-8ms | $5/month (Paid plan) |
| D1 exceeds 5GB | ~250K invoices accumulated | Included in $5/month |
| R2 exceeds 10GB | ~50K invoice images | $0.015/GB/month |
| Need Browser Rendering | Template too complex for Satori | Requires $5/month Paid plan |

### Cost Comparison Matrix

| Dimension | GAS (Current) | CF + Satori | CF + Browser Rendering |
|-----------|:---:|:---:|:---:|
| Monthly cost | $0 | $0 | $5 |
| Invoice render time | 5-15s | <1s | 3-5s |
| Uptime SLA | None (best-effort) | 99.9%+ (edge) | 99.9%+ (edge) |
| Vendor lock-in risk | High (GAS deprecation) | Medium | Medium |
| Scalability ceiling | ~10K rows | ~5GB / 5M reads | Same |

### Cost Efficiency Verdict

The Satori path achieves **$0/month** — identical to GAS — while delivering 10-15x faster invoice generation and proper database guarantees. The system will comfortably stay within free tier limits for years at current scale.

If Browser Rendering is eventually needed, the $5/month Workers Paid plan also unlocks higher D1/R2/Workers limits, providing significant headroom.

---

## 12. Migration & Deployment Plan

### Phase 1: Foundation (Week 1)
- Scaffold Hono Worker project with TypeScript
- Create D1 database, run schema migrations
- Create R2 bucket for invoice images
- Implement auth middleware (Bearer token)
- Implement events, customers, items CRUD routes
- Deploy API, test with `curl`

### Phase 2: Invoice Rendering (Week 2)
- Build Satori invoice template (replicate INVOICE sheet visual layout)
- Integrate resvg-wasm for PNG conversion
- Bundle font files in R2
- Upload rendered PNG to R2
- Test rendering with sample data, iterate until visual parity

### Phase 3: Payment + Webhook (Week 2-3)
- Port DOKU client (`crypto.subtle` translation)
- Port webhook sender (direct `fetch()` call)
- Wire full invoice generation flow end-to-end
- Test with DOKU sandbox environment

### Phase 4: Frontend (Week 3)
- Port HTML/CSS from `MainAppSimple.html` (mostly copy-paste)
- Replace `google.script.run.*` calls with `fetch('/api/v1/...')` calls
- Deploy to Cloudflare Pages
- End-to-end testing

### Phase 5: Data Migration (Week 4)
- Write one-time script: Google Sheets API → D1 insert
- Export existing invoice images: Google Drive → R2
- Migrate ORDER sheet history to `orders` + `order_items` tables
- Validate data integrity

### Phase 6: Cutover
- Run both systems in parallel for 3-5 days
- Compare invoice output side-by-side
- Update n8n webhook if Worker URL changed (or use custom domain)
- Switch users to new URL
- Keep GAS running read-only for 30 days as rollback

### Rollback Plan
GAS system remains untouched throughout. If anything fails, users return to the GAS web app URL. No destructive migration steps exist.

---

## 13. What Stays vs. What Changes

### Unchanged (External Contracts)
- DOKU API endpoint, request body, signature algorithm
- n8n webhook URL and payload field names
- Invoice ID format: `INV-YYYYMMDD-XXXX`
- Phone normalization logic (0xxx → 62xxx)
- UI flow: 2-tab design (Input Order, Create Invoice)

### Changed (Internal Architecture)

| From (GAS) | To (Cloudflare) |
|-------------|-----------------|
| Google Sheets (flat rows) | D1 SQLite (relational schema) |
| Google Drive | R2 Object Storage |
| Sheets template + PNG export | Satori + resvg-wasm |
| `google.script.run` RPC | REST API (`fetch`) |
| GAS HtmlService | Cloudflare Pages |
| ScriptProperties (counter) | D1 `invoice_counters` table |
| `Utilities.*` crypto | `crypto.subtle` Web Crypto API |
| CONFIG sheet | D1 config table + Worker secrets |
| `clasp push` | `wrangler deploy` + Pages CI |

---

## 14. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|:-----------:|:------:|------------|
| Invoice image visual mismatch | Medium | Medium | Side-by-side comparison during Phase 2. Iterate until owner approves |
| Satori font rendering differs | Low | Low | Bundle exact font (.woff2). Test with Indonesian characters |
| Workers 10ms CPU limit hit | Low | Medium | Satori typically 5-8ms. If exceeded, $5/mo Paid plan resolves it |
| D1 free tier changes | Very Low | Low | D1 is GA. 5GB is enormous for this workload |
| DOKU API incompatibility | Very Low | High | Signature algorithm is identical. Test with sandbox first |
| n8n webhook breaks | Low | High | Preserve exact field names. Only `file_url` domain changes |
| Data migration corruption | Low | High | Validate row counts and totals post-migration. Keep GAS as source of truth for 30 days |

---

## 15. Success Criteria

1. All existing features work: order input, invoice generation, DOKU payment, webhook notification
2. Invoice render time < 1 second (vs 5-15s current)
3. Monthly cost = $0 (Satori path)
4. Zero data loss during migration
5. n8n/WhatsApp flow works without n8n workflow changes (except `file_url` domain)
6. Business owner approves invoice visual design

---

## 16. Open Questions for Stakeholder

1. **Invoice design fidelity:** Must the new invoice look pixel-identical to the current Google Sheets template, or is a "same information, clean design" approach acceptable? This determines Satori vs Browser Rendering ($0 vs $5/month).
2. **Authentication:** Is a single shared Bearer token sufficient, or do we need per-user auth (e.g., if multiple staff will use the system)?
3. **Custom domain:** Should the new system run on a subdomain (e.g., `order.guragiru.com`) or a separate domain?
4. **Historical data:** Should we migrate all existing ORDER sheet history to D1, or start fresh with the new system?

---

*End of document.*
