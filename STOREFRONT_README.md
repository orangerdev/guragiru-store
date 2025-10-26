# GuraGiru Shop Storefront

WhatsApp Stories-style product showcase built with Next.js that consumes the GuraGiru Shop DB API.

## Features ✨

### 🔥 WhatsApp Story Experience
- **Full-screen Stories**: Immersive product showcase mimicking WhatsApp stories
- **Progress Indicators**: Shows current story position with support for 100+ products
- **Auto-play**: Stories progress automatically with configurable timing
- **Hold to Pause**: Hold/touch to pause story progression (mobile)
- **Tap Navigation**: Tap left/right sides to navigate between stories

### 📱 Mobile-First Design
- **Swipe Gestures**: Swipe left/right for navigation, up for message modal
- **Touch Optimized**: Responsive touch interactions
- **Mobile Gestures**: Full support for mobile touch patterns
- **PWA Ready**: Progressive Web App with offline capabilities

### 💬 WhatsApp Integration
- **Message Modal**: WhatsApp-style reply interface
- **Deep Linking**: Direct redirect to WhatsApp with pre-filled messages
- **Text Formatting**: Support for WhatsApp markdown (*bold*, _italic_, ~strikethrough~)
- **Product Info**: Auto-includes product name and description in messages

### 🎨 Advanced Features
- **Image & Video Support**: Display product images and videos
- **Smart Progress**: Grouped indicators for large product catalogs
- **Keyboard Navigation**: Arrow keys and spacebar support
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error recovery

## Quick Start 🚀

### 1. Clone & Install
```bash
git clone <repository-url>
cd shop-storefront
npm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your settings:
NEXT_PUBLIC_API_BASE_URL=https://your-worker-domain.workers.dev
NEXT_PUBLIC_WHATSAPP_PHONE=6281234567890
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE=Halo, saya tertarik dengan produk ini:
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## API Integration 🔌

The storefront consumes the GuraGiru Shop DB API:

### Endpoint Used
- **GET** `/api/db/products` - Fetches all products for display

### Product Data Structure
```typescript
interface Product {
  id: number
  product_name: string
  product_slug: string
  description?: string
  asset_link?: string
  asset_type?: 'image' | 'video'
  created_at: string
  updated_at: string
}
```

## User Experience 📖

### Story Navigation
- **Tap Left**: Previous story
- **Tap Right**: Next story
- **Tap Center**: Open message modal
- **Swipe Left**: Next story (mobile)
- **Swipe Right**: Previous story (mobile)
- **Swipe Up**: Message modal (mobile)
- **Hold/Touch**: Pause story
- **Arrow Keys**: Navigate (desktop)
- **Spacebar**: Next story (desktop)

### WhatsApp Integration Flow
1. User views product story
2. User taps center or swipes up → Message modal opens
3. User types optional message
4. User taps "Send" → Redirects to WhatsApp with:
   - Product name
   - Product description (with formatting)
   - User's custom message

### WhatsApp Text Formatting
The app supports WhatsApp markdown in product descriptions:
- `*text*` → **bold**
- `_text_` → _italic_
- `~text~` → ~~strikethrough~~
- `` `text` `` → `code`

## Tech Stack 🛠

### Core
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling

### Features
- **Custom Hooks** - Story management, swipe gestures, API calls
- **Service Layer** - API and WhatsApp integrations
- **PWA Support** - Progressive Web App capabilities

### Mobile Optimization
- **Touch Gestures** - Native-feeling swipe interactions
- **Responsive Design** - Works on all screen sizes
- **Performance** - Optimized loading and caching

## Configuration ⚙️

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com

# WhatsApp Configuration
NEXT_PUBLIC_WHATSAPP_PHONE=6281234567890
NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE=Halo, saya tertarik dengan produk ini:
```

### WhatsApp Setup
1. **Phone Number**: Include country code (e.g., `6281234567890` for Indonesia)
2. **Default Message**: Template message that appears before product info
3. **URL Encoding**: Automatically handled by the WhatsApp service

## Deployment 🚀

### Build & Export
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm install -g vercel
vercel --prod
```

## Browser Support 🌐

### Supported
- ✅ iOS Safari 12+
- ✅ Chrome 80+
- ✅ Firefox 80+
- ✅ Samsung Internet 12+
- ✅ Edge 80+

### Touch Gestures
- ✅ iOS touch events
- ✅ Android touch events
- ✅ Desktop mouse events
- ✅ Trackpad gestures

## Development 👨‍💻

### Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

For complete API documentation including sync workflows, see [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

## License 📄

[MIT License](./LICENSE)

---

**Built with ❤️ for GuraGiru Shop**  
**Last Updated:** October 26, 2025