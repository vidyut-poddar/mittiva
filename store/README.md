# Boutique Store — Headless Storefront

A custom Next.js storefront for a Kolkata boutique. Products and orders live in
**Shopify**; payments run through **Razorpay**. The site itself stores almost
nothing — it's a window into those two systems. This is the code that
implements the plan in the project's `ARCHITECTURE.md` / `SECURITY.md` /
`ROADMAP.md`.

> Built standalone in this `/store` subfolder so it's separate from the existing
> Mittiva site/app. Deploy this folder to Vercel as its own project.

---

## Quick start

```bash
cd store
npm install
cp .env.local.example .env.local   # then fill in the values (see below)
npm run dev                          # http://localhost:3000
```

Without credentials the site still runs — product pages show a friendly
"store not connected" notice instead of crashing.

```bash
npm run build       # production build (verified passing)
npm run typecheck   # tsc --noEmit
```

---

## Environment variables — what plugs in where

Copy `.env.local.example` → `.env.local` and fill these in. Every value maps to
a step in the plans' `SETUP.md`.

| Variable | What it is | From |
|---|---|---|
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | `your-store.myshopify.com` | Store admin |
| `SHOPIFY_CLIENT_ID` | Developer Dashboard app Client ID | App → Settings → Credentials |
| `SHOPIFY_CLIENT_SECRET` | App Client Secret — **secret, server-only** | App → Settings → Credentials |
| `SHOPIFY_STOREFRONT_TOKEN` | Optional override; else derived server-side | App config (if exposed) |
| `SHOPIFY_API_VERSION` | e.g. `2025-10` | — |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_…` then `rzp_live_…` at launch | SETUP Step 4 |
| `RAZORPAY_KEY_SECRET` | **Secret, server-only** | SETUP Step 4 |
| `RAZORPAY_WEBHOOK_SECRET` | The long random string you set in Razorpay | SETUP Step 5 |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Persistence (Vercel KV / Upstash). Optional in dev. | Phase 2 |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (for metadata) | — |

`.env.local` is git-ignored. Never commit it. In Vercel, set the same values
under **Project Settings → Environment Variables**.

### Shopify authentication (2026 model)

Shopify deprecated static Admin tokens from the store admin on 1 Jan 2026. This
app uses the **client credentials grant** instead (`src/lib/shopify/auth.ts`):
the server exchanges the app's Client ID + Secret for a 24-hour Admin API token
(auto-refreshed) and derives the Storefront token from it. Both tokens stay
server-side — nothing Shopify-related is exposed to the browser.

Prerequisites for it to work:

1. Create the app in the **Shopify Developer Dashboard** (you've done this).
2. Configure these **scopes** on the app: `read_products`, `read_orders`,
   `write_orders`, and the `unauthenticated_*` storefront scopes
   (`read_product_listings`, `read_product_inventory`, `write_checkouts`,
   `read_checkouts`).
3. **Install the app on the store** (client credentials only works for apps
   installed on a store you own).
4. Put the Client ID + Secret in `.env.local`.

---

## Choosing the shipping model — one line

Razorpay's standard gateway does **not** compute shipping; this server does, in
`src/lib/shipping.ts`, and folds it into the amount Razorpay charges. Pick a
model in **`src/config/store.ts`**:

```ts
export const SHIPPING = {
  model: "free_over_threshold", // "free" | "flat" | "free_over_threshold" | "zone"
  flatRatePaise: 9900,          // ₹99
  freeThresholdPaise: 200000,   // ₹2,000
  zones: { kolkata: …, west_bengal: …, rest_of_india: … },
};
```

All four are implemented — switching is just changing `model`. GST handling and
currency also live in that one config file. (If you ever want Razorpay to manage
shipping/serviceability itself, that's a different product — **Magic Checkout** —
and a separate integration; this build deliberately uses the custom flow your
plans describe.)

---

## How the security fixes from ROADMAP Phase 2 are implemented

| ROADMAP item | Where | How |
|---|---|---|
| **Critical: bind payment to cart** | `lib/fulfill.ts`, `lib/razorpay.ts` | The cartId is written into the Razorpay order's `notes` at creation and read back **from Razorpay** at verification — never trusted from the browser. The captured amount must equal the freshly recomputed cart total or the order is rejected (HTTP 409). |
| **Persistence layer** | `lib/store-kv.ts` | Checkout details are saved server-side keyed by Razorpay order id when payment starts, so the webhook has everything it needs. Uses Vercel KV/Upstash if configured, in-memory otherwise. |
| **Idempotent order creation** | `lib/store-kv.ts` `claimPayment()` | A payment id is atomically claimed once; a second attempt (e.g. webhook + browser both firing) returns the existing order instead of duplicating. |
| **Cart never cached** | `lib/shopify/storefront.ts` | Cart/checkout calls use `cache: "no-store"`; only product listings are cached/revalidated. Payment routes set `dynamic = "force-dynamic"`. |
| **Server-side input validation** | `lib/validation.ts` | Zod schemas validate email, Indian mobile, PIN code, and address on every payment route before anything else. |
| **Rate limiting** | `lib/rate-limit.ts` | Per-IP fixed window (20/min) on the payment-create route. |
| **`server-only` guard** | `lib/shopify/admin.ts`, `lib/razorpay.ts` | Importing these into client code fails the build, so the Admin token / Razorpay secret can't leak to the browser. |
| **Razorpay auto-capture** | `lib/razorpay.ts` | Orders are created with `payment_capture: 1`; also confirm auto-capture in the dashboard (ROADMAP Phase 2). |

The amount the customer is charged is computed in exactly one place,
`lib/totals.ts`, and that same function is used both when creating the Razorpay
order and when verifying payment — so the "amount owed == amount paid" check
always compares like with like.

---

## Project structure

```
store/
├── src/
│   ├── config/store.ts            Business rules: shipping model, GST, currency
│   ├── lib/
│   │   ├── shopify/
│   │   │   ├── storefront.ts       Read products + cart (cache-aware)
│   │   │   ├── admin.ts            Create paid orders (server-only)
│   │   │   ├── queries.ts          GraphQL documents
│   │   │   └── types.ts            Normalised types
│   │   ├── razorpay.ts             Create order, fetch order/payment, verify signatures
│   │   ├── totals.ts               Single source of truth for the charged amount
│   │   ├── shipping.ts / tax.ts    Config-driven shipping + GST
│   │   ├── validation.ts           Zod schemas (server-side)
│   │   ├── rate-limit.ts           Per-IP limiter
│   │   ├── store-kv.ts             Persistence + idempotency (KV or in-memory)
│   │   ├── fulfill.ts              The one place an order is created (verify + webhook share it)
│   │   └── money.ts                Paise helpers
│   ├── app/
│   │   ├── page.tsx                Home / hero + featured
│   │   ├── shop/                   Product grid (+ loading skeleton)
│   │   ├── products/[handle]/      Product detail
│   │   ├── cart/                   Cart
│   │   ├── checkout/               Checkout + Razorpay widget
│   │   ├── order/confirmation/     Thank-you page
│   │   └── api/
│   │       ├── cart/               Cart proxy (server-side, uncached)
│   │       ├── checkout/quote/     Live price breakdown for the UI
│   │       ├── payment/create/     Creates Razorpay order (server sets amount)
│   │       ├── payment/verify/     Verifies signature → fulfils order
│   │       └── shopify/complete-order/  Razorpay webhook (safety net)
│   ├── components/                 Header, ProductCard/Grid, ProductDetail (variant selector)
│   └── context/CartContext.tsx     Client cart state (cart id in localStorage)
```

---

## What still needs you (from the plans)

This is the **code**. These remain manual, per `ROADMAP.md`:

- **Phase 1:** create the Shopify + Razorpay accounts (client-owned), complete
  Razorpay KYC, add ≥3 products, set the webhook to
  `https://YOUR-DOMAIN/api/shopify/complete-order`, and fill `.env.local`.
- **Phase 4 (polish):** real branding/fonts/logo, product photography, richer
  homepage, `next/image`, analytics, favicon. The current styling is a clean,
  tasteful base — not the final boutique identity.
- **Phase 5 (pre-launch):** swap test keys for live keys, connect the real
  domain, enable 2FA everywhere, run the ₹1 real-money test, browser-test.

Test card for Razorpay test mode: `4111 1111 1111 1111`, any future expiry, any CVV.
