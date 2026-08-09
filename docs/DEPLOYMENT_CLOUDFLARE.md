# Deploy to Cloudflare (Workers and Pages)

This repository supports two deployment targets:

- Cloudflare Workers via OpenNext (recommended for full Workers control)
- Cloudflare Pages via `@cloudflare/next-on-pages` (already wired; convenient CI)

## Prerequisites
- Cloudflare account
- `npm` installed locally
- A Cloudflare Pages project created (can also be created during first deploy)

## Environment variables
For both targets, you will need at least:

- `NEXT_PUBLIC_API_BASE_URL` → your Workers API base, for example:
  - `https://<your-worker>.workers.dev`

You can add it to both Production and Preview environments.

On Workers (OpenNext), these are configured in `wrangler.toml` under the `[vars]` section, or via the Cloudflare Dashboard.

---

## Option A — Workers (OpenNext)

This follows Cloudflare’s Next.js on Workers guide using `@opennextjs/cloudflare`.

Prerequisites:
- Node.js 20.19+ (per wrangler and adapter engine requirements)
- Cloudflare account and `wrangler` logged in (`npx wrangler login`)

One-time setup (already applied in this repo):
- `wrangler.toml` with `main = ".open-next/worker.js"`, `compatibility_date`, `compatibility_flags = ["nodejs_compat"]`, and `[assets]` binding
- `open-next.config.ts` using `defineCloudflareConfig()`
- Scripts in `package.json`: `preview`, `deploy`, `cf-typegen`

Local preview:

```bash
npm run preview
```

Deploy to Workers (workers.dev or custom domain):

```bash
npm run deploy
```

Type generation (optional – keeps env bindings typed):

```bash
npm run cf-typegen
```

Notes:
- If you receive engine warnings/errors, upgrade Node to >= 20.19.0.
- Edge runtime route handlers must not be mixed with Node runtime in the same function. This repo sets `export const runtime = 'nodejs'` for `src/app/api/products/route.ts` to satisfy the adapter.

### Custom domain

This repo configures the Worker to use `guragiru.com` and `www.guragiru.com` via `wrangler.toml`:

```
[routes]
patterns = [
   { pattern = "guragiru.com", custom_domain = true },
   { pattern = "www.guragiru.com", custom_domain = true }
]
```

Requirements:
- The `guragiru.com` zone must be in your Cloudflare account.
- DNS for `guragiru.com` and `www` should be proxied (orange cloud) to enable Workers.

### Workers Builds (CI)

We included `.github/workflows/deploy-workers.yml` to deploy on pushes to `main` using Wrangler. Configure GitHub secrets in your repo:

- `CLOUDFLARE_API_TOKEN` (with `Workers Scripts:Edit`, `Workers Routes:Edit`, `Account Settings:Read`)
- `CLOUDFLARE_ACCOUNT_ID`

---

## One-time local setup

1. Authenticate Wrangler
   - Run: `npx wrangler login`
2. Build with the Next adapter
   - Run: `npm run cf:build`
   - Output goes to `.vercel/output` (static assets + functions)
3. Deploy to Pages
   - Run: `npm run cf:deploy`
   - On first deploy you will be prompted for a project or to create a new one.

## GitHub CI (recommended)
Alternatively, connect the repo to Cloudflare Pages for auto deployments on push:

- Framework preset: "Next.js (Pages Functions)"
- Build command: `npx @cloudflare/next-on-pages@latest`
- Build output directory: `.vercel/output/static`
- Functions directory: `.vercel/output/functions`
- Environment variables: add `NEXT_PUBLIC_API_BASE_URL`

## Notes
- `next/image` is configured to allow Google Drive/CDN hosts in `next.config.js`.
- The frontend calls your Workers API via `NEXT_PUBLIC_API_BASE_URL`.
- If you later add additional server-side resources (KV, D1, R2), bind them in Pages project settings and access them in functions as per `next-on-pages` docs.
