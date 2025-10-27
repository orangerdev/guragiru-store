# GuraGiru Shop DB - REST API Documentation

## Overview

GuraGiru Shop DB adalah sistem sync produk A/B dengan zero-downtime menggunakan Cloudflare Workers dan D1 Database. API ini memungkinkan sinkronisasi produk tanpa mengganggu operasional aplikasi.

## Base URL

```
https://your-worker-domain.workers.dev
```

## Authentication

### API Token

Semua endpoint sync memerlukan autentikasi menggunakan Bearer token:

```http
Authorization: Bearer <your-api-token>
```

**Environment Variable:** `API_TOKEN`

### Error Responses untuk Authentication

```json
{
  "error": "Authorization header required. Use: Authorization: Bearer <token>"
}
```

```json
{
  "error": "Invalid API token"
}
```

```json
{
  "error": "Server configuration error: API_TOKEN not configured"
}
```

## Endpoints

### 1. Health Check

Endpoint untuk memeriksa status sistem.

**GET** `/api/health`

**Headers:** None required

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-26T10:30:00.000Z"
}
```

---

### 2. Get Products

Mendapatkan daftar produk dari tabel aktif.

**GET** `/api/db/products`

**Headers:** None required

**Query Parameters:**
- `id` (optional): ID produk spesifik
- `order_by` (optional): Kolom untuk pengurutan. Default: `id`. Opsi yang diizinkan: `id`, `datetime`, `product_name`, `product_slug`, `created_at`, `updated_at`
- `order` (optional): Arah pengurutan. Default: `asc`. Opsi: `asc` atau `desc`
- `limit` (optional): Jumlah item per halaman. Default: `-1` untuk menampilkan semua produk (tanpa pagination)
- `page` (optional): Nomor halaman (mulai dari 1). Default: `1`. Diabaikan jika `limit = -1`.

**Examples:**

**Get all products:**
```bash
curl -X GET "https://your-worker-domain.workers.dev/api/db/products"
```

**Get all products ordered by datetime DESC:**
```bash
curl -X GET "https://your-worker-domain.workers.dev/api/db/products?order_by=datetime&order=desc"
```

**Get paginated products (limit 20, page 2):**
```bash
curl -X GET "https://your-worker-domain.workers.dev/api/db/products?limit=20&page=2"
```

**Get specific product:**
```bash
curl -X GET "https://your-worker-domain.workers.dev/api/db/products?id=123"
```

**Response (All products):**
```json
{
  "message": "Products retrieved",
  "active_table": "products_a",
  "order": { "by": "id", "direction": "ASC" },
  "pagination": { "limit": -1, "page": 1, "applied": false },
  "count": 1,
  "data": [
    {
      "id": 1,
      "datetime": "2025-10-26 10:30:00",
      "product_name": "Sample Product",
      "product_slug": "sample-product",
      "description": "Product description",
      "asset_link": "https://example.com/image.jpg",
      "asset_type": "image",
      "created_at": "2025-10-26 10:30:00",
      "updated_at": "2025-10-26 10:30:00"
    }
  ]
}
```

**Response (Specific product):**
```json
{
  "product": {
    "id": 1,
    "datetime": "2025-10-26 10:30:00",
    "product_name": "Sample Product",
    "product_slug": "sample-product",
    "description": "Product description",
    "asset_link": "https://example.com/image.jpg",
    "asset_type": "image",
    "created_at": "2025-10-26 10:30:00",
    "updated_at": "2025-10-26 10:30:00"
  }
}
```

---

### 3. Initialize Database Schema

Membuat struktur database yang diperlukan.

**POST** `/api/schema`

**Headers:** None required

**Body:** None required

**Example:**
```bash
curl -X POST "https://your-worker-domain.workers.dev/api/schema"
```

**Response:**
```json
{
  "message": "Database schema created successfully",
  "tables": ["config", "products_a", "products_b"]
}
```

---

## Product Sync Workflow

Sistem sync menggunakan pola A/B table switching untuk zero-downtime updates.

### 4. Start Sync

Memulai proses sinkronisasi produk. Ini akan membersihkan tabel inactive dan mempersiapkannya untuk data baru.

**POST** `/api/start_sync`

**Headers:**
```http
Authorization: Bearer <your-api-token>
Content-Type: application/json
```

**Body:** None required

**Example:**
```bash
curl -X POST "https://your-worker-domain.workers.dev/api/start_sync" \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Sync started successfully",
  "active_table": "products_a",
  "target_sync_table": "products_b",
  "status": "ready_for_sync"
}
```

---

### 5. Sync Product Data

Menambahkan produk ke tabel sync (inactive table).

**POST** `/api/sync`

**Headers:**
```http
Authorization: Bearer <your-api-token>
Content-Type: application/json
```

**Body:**
```json
{
  "product_name": "Product Name",
  "product_slug": "product-slug",
  "description": "Product description (optional)",
  "asset_link": "https://example.com/asset.jpg (optional)",
  "asset_type": "image", // "image" or "video" (optional)
  "datetime": "2025-10-26 10:30:00 (optional - auto-generated if not provided)"
}
```

**Field Requirements:**
- `product_name`: **Required** - String, nama produk
- `product_slug`: **Required** - String, slug produk (akan dibuat unique otomatis jika duplikat)
- `description`: Optional - String, deskripsi produk
- `asset_link`: Optional - String, URL asset produk
- `asset_type`: Optional - String, tipe asset ("image" atau "video")
- `datetime`: Optional - String, timestamp (format: YYYY-MM-DD HH:MM:SS)

**Example:**
```bash
curl -X POST "https://your-worker-domain.workers.dev/api/sync" \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Sample Product",
    "product_slug": "sample-product",
    "description": "This is a sample product",
    "asset_link": "https://example.com/image.jpg",
    "asset_type": "image"
  }'
```

**Response:**
```json
{
  "message": "Product synced successfully",
  "target_table": "products_b",
  "data": {
    "id": 1,
    "datetime": "2025-10-26 10:30:00",
    "product_name": "Sample Product",
    "product_slug": "sample-product",
    "description": "This is a sample product",
    "asset_link": "https://example.com/image.jpg",
    "asset_type": "image",
    "created_at": "2025-10-26 10:30:00",
    "updated_at": "2025-10-26 10:30:00"
  },
  "slug_generated": null // atau slug baru jika ada duplikat
}
```

**Response (dengan slug auto-generated):**
```json
{
  "message": "Product synced successfully",
  "target_table": "products_b",
  "data": {
    "id": 2,
    "datetime": "2025-10-26 10:35:00",
    "product_name": "Sample Product",
    "product_slug": "sample-product-2",
    // ... other fields
  },
  "slug_generated": "sample-product-2"
}
```

---

### 6. End Sync

Menyelesaikan proses sync dan beralih ke tabel yang baru diperbarui.

**POST** `/api/end_sync`

**Headers:**
```http
Authorization: Bearer <your-api-token>
Content-Type: application/json
```

**Body:** None required

**Example:**
```bash
curl -X POST "https://your-worker-domain.workers.dev/api/end_sync" \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Sync completed successfully",
  "previous_active_table": "products_a",
  "new_active_table": "products_b",
  "product_count": 150,
  "switched_at": "2025-10-26T10:45:00.000Z"
}
```

---

## Complete Sync Workflow Example

Berikut adalah contoh workflow lengkap untuk sync produk:

### 1. Mulai Sync
```bash
curl -X POST "https://your-worker-domain.workers.dev/api/start_sync" \
  -H "Authorization: Bearer your-secret-token"
```

### 2. Sync Multiple Products
```bash
# Product 1
curl -X POST "https://your-worker-domain.workers.dev/api/sync" \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Product 1",
    "product_slug": "product-1",
    "description": "First product"
  }'

# Product 2  
curl -X POST "https://your-worker-domain.workers.dev/api/sync" \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Product 2",
    "product_slug": "product-2",
    "description": "Second product"
  }'
```

### 3. Selesaikan Sync
```bash
curl -X POST "https://your-worker-domain.workers.dev/api/end_sync" \
  -H "Authorization: Bearer your-secret-token"
```

## Error Responses

### Validation Errors

**400 Bad Request** - Invalid product data:
```json
{
  "error": "Invalid product data",
  "details": [
    "product_name is required and must be a string",
    "product_slug is required and must be a string"
  ]
}
```

### Authentication Errors

**401 Unauthorized** - Missing authorization:
```json
{
  "error": "Authorization header required. Use: Authorization: Bearer <token>"
}
```

**403 Forbidden** - Invalid token:
```json
{
  "error": "Invalid API token"
}
```

### Method Errors

**405 Method Not Allowed**:
```json
{
  "error": "Only POST method allowed"
}
```

### Server Errors

**500 Internal Server Error**:
```json
{
  "error": "Failed to sync product",
  "message": "Detailed error message"
}
```

## Configuration

### Environment Variables

Pastikan variabel environment berikut telah dikonfigurasi:

1. **API_TOKEN** - Token untuk autentikasi sync endpoints
2. **NODE_ENV** - Environment mode (production/staging/development)

### Cloudflare Wrangler Setup

Tambahkan ke `wrangler.toml`:

```toml
[vars]
NODE_ENV = "production"

# Untuk development, bisa langsung set di vars:
# API_TOKEN = "your-dev-token"

# Untuk production, gunakan secrets:
# wrangler secret put API_TOKEN
```

### Setting API Token

**Development:**
```bash
# Edit wrangler.toml
[vars]
API_TOKEN = "your-development-token"
```

**Production:**
```bash
# Gunakan Cloudflare secrets
wrangler secret put API_TOKEN
# Enter your production token when prompted
```

## Security Best Practices

1. **Token Security:**
   - Gunakan token yang kuat dan unik
   - Jangan commit token ke repository
   - Rotasi token secara berkala

2. **HTTPS Only:**
   - Pastikan semua request menggunakan HTTPS
   - Token akan terekspos jika menggunakan HTTP

3. **Rate Limiting:**
   - Implementasi rate limiting di level Cloudflare
   - Monitor penggunaan API

4. **Logging:**
   - Log semua sync operations
   - Monitor failed authentication attempts

## Rate Limits

Cloudflare Workers memiliki limits:
- **Free Plan**: 100,000 requests/day
- **Paid Plan**: 10,000,000+ requests/month
- **CPU Time**: 10ms (Free), 50ms (Paid)

## Support

Untuk pertanyaan atau issue, silakan buat issue di repository atau hubungi tim development.

---

**Last Updated:** October 26, 2025
**API Version:** 1.0.0