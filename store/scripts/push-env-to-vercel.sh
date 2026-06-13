#!/usr/bin/env bash
#
# Push the credentials from store/.env.local into your linked Vercel project.
# Run from the store folder AFTER `npx vercel` has linked the project:
#
#   cd "/Users/vidyutpoddar/Documents/Claude/Projects/Webdeb/mittiva/store"
#   bash scripts/push-env-to-vercel.sh
#
# It sets each variable for Production, Preview, and Development. It SKIPS:
#   - KV_REST_API_* / UPSTASH_*  → these are added automatically when you
#     connect the Upstash (KV) store in the Vercel dashboard.
#   - NEXT_PUBLIC_SITE_URL       → set this to your real Vercel URL afterward.
#
set -uo pipefail

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env.local not found at $ENV_FILE"
  exit 1
fi

# Variables to push (only those with a non-empty value are sent).
VARS=(
  NEXT_PUBLIC_SHOPIFY_DOMAIN
  SHOPIFY_CLIENT_ID
  SHOPIFY_CLIENT_SECRET
  SHOPIFY_STOREFRONT_TOKEN
  SHOPIFY_API_VERSION
  SHOPIFY_WEBHOOK_SECRET
  NEXT_PUBLIC_RAZORPAY_KEY_ID
  RAZORPAY_KEY_SECRET
  RAZORPAY_WEBHOOK_SECRET
)
ENVIRONMENTS=(production preview development)

get_val() {
  # Return everything after the first '=' for the matching line.
  grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-
}

echo "Pushing env vars from $ENV_FILE to Vercel..."
for name in "${VARS[@]}"; do
  val="$(get_val "$name")"
  if [ -z "$val" ]; then
    echo "  - skip $name (empty)"
    continue
  fi
  for env in "${ENVIRONMENTS[@]}"; do
    # Remove any existing value first so re-runs are clean (ignore errors).
    npx vercel env rm "$name" "$env" -y >/dev/null 2>&1
    if printf '%s' "$val" | npx vercel env add "$name" "$env" >/dev/null 2>&1; then
      echo "  ✓ $name [$env]"
    else
      echo "  ✗ $name [$env]  (failed — is the project linked? run 'npx vercel link')"
    fi
  done
done

echo ""
echo "Done. Next:"
echo "  1. In the Vercel dashboard, connect the Upstash (KV) store (Storage tab)."
echo "  2. Set NEXT_PUBLIC_SITE_URL to your Vercel URL:"
echo "       npx vercel env add NEXT_PUBLIC_SITE_URL production   (paste https://<your-project>.vercel.app)"
echo "  3. Redeploy:  npx vercel --prod"
