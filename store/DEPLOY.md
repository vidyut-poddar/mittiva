# Deploying the store to Vercel (+ KV + Razorpay webhook)

This stands up the production safety net: a public URL for the Razorpay webhook
and a shared KV store so saved-checkout + idempotency survive across serverless
instances. Follow in order. Steps marked **[you]** need your accounts.

The store lives in the `store/` subfolder — that subfolder is the thing we deploy.

---

## 1. Deploy the store to Vercel  **[you]**

Easiest path (no GitHub needed) — the Vercel CLI, run from inside `store/`:

```bash
cd "/Users/vidyutpoddar/Documents/Claude/Projects/Webdeb/mittiva/store"
npx vercel login         # opens browser to sign in / create a free account
npx vercel               # first deploy — accept the defaults; it auto-detects Next.js
```

When it asks "In which directory is your code located?", accept `./` (you're
already inside `store/`). It creates a project and gives you a preview URL.

> Prefer GitHub? You can instead push this repo and "Import Project" in the
> Vercel dashboard — just set **Root Directory = `store`** in project settings.

Don't do a production deploy yet — we add env vars first (next steps), then
redeploy.

---

## 2. Add the KV (Redis) store  **[you]**

In the Vercel dashboard → your project → **Storage** tab → **Create Database** →
choose **Upstash for Redis** (Marketplace) → let Vercel manage the Upstash
account → create a database (any name, pick the region closest to India, e.g.
Mumbai/Singapore) → **Connect** it to this project.

This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to the
project's environment variables. Nothing to copy by hand.

---

## 3. Add the rest of the environment variables  **[you]**

Vercel dashboard → project → **Settings → Environment Variables**. Add each of
these (values are in your local `store/.env.local`). Set them for the
**Production** (and Preview) environment:

| Variable | Value source |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_DOMAIN` | `p9qf1g-1s.myshopify.com` |
| `SHOPIFY_CLIENT_ID` | from `.env.local` |
| `SHOPIFY_CLIENT_SECRET` | from `.env.local` (secret) |
| `SHOPIFY_API_VERSION` | `2025-10` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_…` (live key later) |
| `RAZORPAY_KEY_SECRET` | from `.env.local` (secret) |
| `RAZORPAY_WEBHOOK_SECRET` | from `.env.local` (secret) |
| `NEXT_PUBLIC_SITE_URL` | your Vercel URL, e.g. `https://your-project.vercel.app` |

(`KV_REST_API_URL` / `KV_REST_API_TOKEN` were added for you in step 2.)

> Note: `NEXT_PUBLIC_*` variables are baked in at build time, so they only take
> effect after the **next** deploy — which is why we redeploy below.

---

## 4. Production deploy  **[you]**

```bash
cd "/Users/vidyutpoddar/Documents/Claude/Projects/Webdeb/mittiva/store"
npx vercel --prod
```

Note the final URL (e.g. `https://your-project.vercel.app`). If you hadn't set
`NEXT_PUBLIC_SITE_URL` yet, set it now to this URL and run `npx vercel --prod`
once more.

---

## 5. Point the Razorpay webhook at it  **[you]**

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**:

- **Webhook URL:** `https://your-project.vercel.app/api/shopify/complete-order`
- **Secret:** the `RAZORPAY_WEBHOOK_SECRET` value from `store/.env.local`
  (copy it from the file — it must match exactly).
- **Active events:** tick `payment.captured` (and optionally `payment.failed`).
- Save.

Razorpay sends webhooks in Test Mode too, so you can verify this before going
live.

---

## 6. Verify end to end

1. Open your Vercel URL, add a product, check out, pay with test card
   `4111 1111 1111 1111`.
2. Confirm the order appears in Shopify (or run `node scripts/list-orders.mjs`).
3. Razorpay Dashboard → Webhooks → your webhook → **Recent Deliveries**: the
   `payment.captured` event should show a `200` response.
4. The real test of the safety net: do a purchase and **close the tab the moment
   the Razorpay box succeeds** (before the redirect). The order should still
   appear in Shopify — created by the webhook, not the browser.

---

## Going live later (Phase 5)

- Swap Razorpay **test** keys for **live** keys in Vercel env vars.
- Repoint your real domain (`shop.mittiva.io` or a chosen subdomain) at Vercel,
  and update the webhook URL + `NEXT_PUBLIC_SITE_URL` to the real domain.
- Rotate the Shopify Client Secret (it passed through chat during setup).
- Enable 2FA on Shopify, Razorpay, Vercel.
