# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
```

No test runner is configured. No lint script in package.json (ESLint config exists via Next.js defaults — run `npx eslint .` if needed).

## Architecture

### Feature Slice Design (FSD)

The codebase follows FSD with a strict one-direction import rule:

```
app → pages → widgets → features → entities → shared
```

Never import upward (e.g. `shared` must not import from `entities`).

- **`app/`** — Next.js App Router only. Thin routing layer, no business logic. Contains `[locale]/` for public routes and `admin/` for the admin panel.
- **`widgets/`** — Composite UI blocks (Header, Footer, ProductGrid, ProductGallery, CartDrawer, AdminSidebar)
- **`features/`** — User interactions with state (AddToCartButton, SizeSelector, CheckoutForm, ProductForm, CategoryFilter)
- **`entities/`** — Business domain: `product`, `category`, `order`, `cart`. Each has `model/types.ts`, `api/*.ts`, `ui/*.tsx`
- **`shared/`** — No business logic. Contains `api/` (Supabase clients, LiqPay), `config/i18n.ts`, `ui/` (Button, Input, Badge, Textarea), `lib/cn.ts`

### TypeScript path alias

`@/*` maps to the project root (not `src/`). All imports use `@/entities/...`, `@/shared/...`, etc.

### i18n

- Locales: `uk` (default), `en`
- Routing: `[locale]` segment — `/uk/...` and `/en/...`
- `middleware.ts` at project root handles locale detection via next-intl, and admin auth via cookie
- Translation strings: `messages/uk.json`, `messages/en.json`
- `i18n.ts` at project root is the next-intl config entry point (referenced by `next.config.ts`)
- Bilingual database fields: `name_uk`/`name_en`, `description_uk`/`description_en`

### Supabase

Two clients — never mix them:
- **`shared/api/supabaseClient.ts`** — anon key, browser-safe, used for public reads and storage uploads
- **`shared/api/supabaseServer.ts`** — service role key (`createServerSupabase()`), server-only, used in API routes for admin writes

Admin CRUD routes (`app/api/admin/categories/route.ts`, `app/api/admin/products/route.ts`) use the service role client to bypass RLS. Client components call these API routes via `fetch()` — they do not call Supabase directly for writes.

RLS policies (from `supabase/migration.sql`):
- Public SELECT on `categories` and `products`
- Public INSERT on `orders` (for checkout)
- No public writes on `categories` or `products` — must go through service role API routes

### Admin auth

Simple cookie approach: middleware checks `admin_token` cookie value against `ADMIN_SECRET` env var. Login at `/admin/login` sets the httpOnly cookie via `POST /api/admin/login`.

### Payment (LiqPay)

`shared/api/liqpay.ts` — SHA1 signature helpers. Flow:
1. Client POSTs to `/api/checkout` → creates order in Supabase (status `new`) → returns `{data, signature}`
2. Client auto-submits hidden form to LiqPay
3. LiqPay POSTs to `/api/liqpay/callback` → verifies signature → updates order status to `paid`

### Server vs client components

Server components by default. Client components are suffixed `*Client.tsx` and placed alongside their page:
- `app/[locale]/product/[slug]/ProductPageClient.tsx`
- `app/[locale]/cart/CartPageClient.tsx`
- `app/[locale]/checkout/CheckoutPageClient.tsx`
- `app/admin/categories/AdminCategoriesClient.tsx`

### Cart

localStorage-based, no backend. `useCart()` hook lives in `entities/cart/model/cartStore.ts`.

### SEO

Every public page has `generateMetadata()`. Product pages include JSON-LD structured data. `app/sitemap.ts` fetches slugs from Supabase. `app/robots.ts` blocks `/admin`.

### Design tokens

Tailwind custom colors under `brand.*`: `black` (#111111), `white` (#ffffff), `gray` (#f5f5f5), `gray-dark` (#e8e8e8), `muted` (#6b6b6b), `border` (#d4d4d4). Fonts: `font-serif` = Cormorant Garamond, `font-sans` = Inter.

## Environment variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — must start with `https://` (validated at runtime)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `LIQPAY_PUBLIC_KEY`, `LIQPAY_PRIVATE_KEY`
- `ADMIN_SECRET` — admin panel password and cookie value

## Database

Schema in `supabase/migration.sql`. Tables: `categories`, `products`, `orders`. Storage bucket: `product-images` (public). Run migration in Supabase Dashboard → SQL Editor before first use.
