# GuraGiru Shop Storefront - AI Agent Instructions

## Project Overview
Next.js 15 e-commerce storefront with WhatsApp-style story interface for products, deployed to Cloudflare Workers using OpenNext adapter. Consumes external Cloudflare Workers API (`shop-db.orangerdigiart.workers.dev`) for product data.

## Architecture

### Dual-Runtime Pattern (Critical)
- **Client Pages**: `'use client'` directive for all interactive components (`src/app/shop/page.tsx`, `src/components/*`)
- **API Routes**: MUST use `export const runtime = 'nodejs'` (see `src/app/api/products/route.ts:1`) due to OpenNext Cloudflare adapter requirements
- **Never mix**: Edge runtime in API routes will break Workers deployment

### Data Flow
```
External API (Workers) → Internal API Route (/api/products) → Client Components
```
- Internal route proxies external API to enable caching and Google Drive URL transformation
- Uses `axios-cache-interceptor` with 1-minute TTL (see `src/services/http.ts`)
- Filters to **image-only products** in API route (`asset_type === 'image'`)

### Google Drive Asset Handling
All product images use Google Drive. Transform URLs via `src/utils/googleDrive.ts`:
- Extract file ID from various Drive URL formats
- Convert to optimized direct URLs with `sz=w800-h800` parameter
- Apply in API route (`route.ts:67`) before sending to client

## Key Patterns

### 1. Pagination Implementation
Pages use infinite scroll with Intersection Observer (see `src/app/shop/page.tsx:84-100`):
```typescript
const LIMIT = 10
const [page, setPage] = useState(1)
const sentinelRef = useRef<HTMLDivElement | null>(null)
const requestedPagesRef = useRef<Set<number>>(new Set()) // Prevent duplicate requests
```
- Track requested pages to avoid re-fetching
- Continue loading until API returns empty array (not `length < LIMIT`)
- Use `isFetchingRef` to prevent concurrent requests

### 2. Cart Persistence
`useCart` hook (src/hooks/useCart.ts) uses localStorage with custom events:
- Load on mount, persist on change
- Dispatch `cart:updated` event for cross-component sync
- Check hydration with `ready` state before localStorage access

### 3. Story Interface
WhatsApp-style story viewer with auto-progress (see `src/components/StoryViewer.tsx`):
- Tap left/right for navigation
- Swipe gestures via `useSwipeGestures` hook
- Hold to pause (mobile), keyboard arrows (desktop)
- Progress bar shows current position with grouped indicators for 100+ items

## Development Workflow

### Commands
```bash
npm run dev           # Local dev server (Next.js)
npm run preview       # Test Workers build locally (requires wrangler login)
npm run deploy        # Deploy to Cloudflare Workers
npm run cf-typegen    # Generate Cloudflare binding types
```

### Environment Setup
1. **wrangler.toml `[vars]`** for Workers deployment (see wrangler.toml:23-26)
2. **`.env.local`** for local dev (not committed):
   ```
   NEXT_PUBLIC_API_BASE_URL=https://shop-db.orangerdigiart.workers.dev
   NEXT_PUBLIC_WHATSAPP_PHONE=62811984666
   ```

### Deployment Configuration
- **Workers**: Primary target via `opennextjs-cloudflare` (see `open-next.config.ts`)
- Custom domains configured in wrangler.toml or Dashboard
- CI/CD via `.github/workflows/deploy-workers.yml` (requires `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` secrets)

## Common Tasks

### Adding New Product Filters
1. Update API route query param forwarding (`src/app/api/products/route.ts:9-21`)
2. Add param to `apiService.getProducts()` signature (`src/services/api.ts:7-11`)
3. Update internal fetch calls with new param

### Modifying Asset Display
1. Google Drive transforms are in `src/utils/googleDrive.ts`
2. Apply changes in `route.ts:67` via `transformGoogleDriveUrls(product)`
3. Next.js Image config allows all HTTPS domains (`next.config.js:13-22`)

### WhatsApp Integration
- Message formatting in `src/services/whatsapp.ts`
- Uses markdown syntax: `*bold*`, `_italic_`, `~strikethrough~`
- Deep link format: `https://wa.me/{phone}?text={encodedMessage}`

## Analytics & Tracking

### Current Implementation
- **Histats**: Basic page view tracking via `src/app/layout.tsx:37-50`
- Loaded asynchronously with `strategy="afterInteractive"`

### Recommended Tracking Events
When implementing additional analytics, track these key user interactions:
```typescript
// Product engagement
- 'product_view' // When story is displayed
- 'product_tap' // When user taps center to open message modal
- 'product_cart_add' // When product added to cart

// Navigation patterns
- 'story_next' // Manual navigation (tap/swipe right)
- 'story_previous' // Manual navigation (tap/swipe left)
- 'story_auto_advance' // Auto-progress trigger

// Conversion funnel
- 'message_modal_open' // User intent to contact
- 'whatsapp_redirect' // Click "Send" button
- 'cart_view' // Open cart modal
- 'cart_checkout' // Proceed to WhatsApp with cart items
```

### Implementation Pattern
Create `src/services/analytics.ts` with typed event tracking:
```typescript
export const track = (event: string, properties?: Record<string, any>) => {
  // Histats custom events
  if (typeof window !== 'undefined' && window._Hasync) {
    window._Hasync.push(['track', event, properties])
  }
  
  // Console log for debugging (remove in production)
  console.log('[Analytics]', event, properties)
}
```

### Privacy Considerations
- No PII (personally identifiable information) in event properties
- Track product IDs/slugs, not user messages
- Respect user consent for analytics cookies if implementing GDPR compliance

## Important Constraints

1. **No Edge Runtime in API Routes**: Always use `export const runtime = 'nodejs'` for Cloudflare Workers compatibility
2. **Asset Filtering**: Only `asset_type === 'image'` products displayed (see route.ts:63-66)
3. **Cache Strategy**: 1-minute TTL on upstream API, `cache: 'no-store'` on client fetch for real-time updates
4. **Mobile-First**: All touch interactions, viewport locked, PWA-ready (see `src/app/layout.tsx:15-19`)

## File Naming Conventions
- API routes: lowercase kebab-case in `src/app/api/*/route.ts`
- Components: PascalCase `.tsx` in `src/components/`
- Hooks: camelCase with `use` prefix in `src/hooks/`
- Types: centralized in `src/types/index.ts`

## Testing Checklist
- [ ] Test pagination with 100+ products (ensures grouped progress indicators work)
- [ ] Verify Google Drive image optimization (check Network tab for `sz=` param)
- [ ] Test WhatsApp deep linking on mobile device
- [ ] Confirm Workers build succeeds: `npm run preview`
- [ ] Validate touch gestures (swipe, hold-to-pause) on mobile
