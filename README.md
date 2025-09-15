# Guragiru Store - Mobile E-commerce Platform

A modern, mobile-first e-commerce platform built with Next.js and optimized for mobile devices. Designed specifically for the Guragiru jastip service with seamless Cloudflare deployment.

## 🚀 Features

### Mobile-First Design
- **100% Mobile Optimized**: Designed exclusively for mobile devices
- **Touch-Friendly Interface**: Large buttons and touch targets (44px minimum)
- **Safe Area Support**: Handles iPhone notches and Android navigation bars
- **PWA Ready**: Progressive Web App capabilities with offline support

### E-commerce Functionality
- **Product Catalog**: Beautiful grid layout with product cards
- **Shopping Cart**: Slide-out cart with real-time updates
- **Category Filtering**: Easy product browsing by category
- **Order Management**: Track orders and purchase history
- **User Profile**: Comprehensive user account management

### Technical Features
- **Next.js 15**: Latest React framework with static generation
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first styling with mobile-first responsive design
- **Cloudflare Pages**: Fast, global deployment with edge optimization

## 📱 Mobile-Specific Optimizations

- **Viewport Configuration**: Proper mobile viewport handling
- **Touch Gestures**: Optimized for touch interactions
- **Navigation**: Fixed bottom navigation for easy thumb access
- **Loading Performance**: Optimized bundle sizes and static generation
- **Responsive Images**: Proper image handling for mobile screens

## 🛠️ Setup & Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Wrangler CLI for Cloudflare deployment

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd guragiru-store

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Deployment
npm run export       # Build static export
npm run deploy       # Deploy to Cloudflare Pages
```

## 🌐 Cloudflare Deployment

This project is configured for seamless deployment to Cloudflare Pages:

### Automatic Deployment
The project includes Wrangler configuration for easy deployment:

```bash
npm run deploy
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy to Cloudflare Pages: `wrangler pages deploy out --project-name=guragiru-store`

### Environment Configuration
The `wrangler.toml` file contains all necessary configuration for Cloudflare Pages deployment.
