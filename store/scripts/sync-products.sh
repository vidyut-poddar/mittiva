#!/usr/bin/env bash
#
# Manually force the storefront to re-pull products from Shopify.
#
# It hits the same /api/revalidate endpoint the Shopify webhooks use, signed
# with your webhook secret — so it drops the cached product data and the next
# visitor sees fresh prices/stock. Useful when you want an instant refresh
# without editing a product in Shopify.
#
#   cd store
#   bash scripts/sync-products.sh                          # default prod URL
#   bash scripts/sync-products.sh https://your-url.app     # custom URL
#
set -uo pipefail

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env.local"
getv() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }

BASE_URL="${1:-https://test-store-ochre.vercel.app}"
URL="$BASE_URL/api/revalidate"
BODY='{"manual":"sync"}'

# Try a given secret; succeed on HTTP 200.
try() {
  local secret="$1" label="$2" hmac code
  [ -z "$secret" ] && return 1
  hmac="$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$secret" -binary | base64)"
  code="$(curl -sS -o /tmp/revalidate_resp.txt -w '%{http_code}' -X POST "$URL" \
    -H 'Content-Type: application/json' \
    -H 'X-Shopify-Topic: manual/sync' \
    -H "X-Shopify-Hmac-Sha256: $hmac" \
    --data "$BODY")"
  echo "  [$label] HTTP $code — $(cat /tmp/revalidate_resp.txt)"
  [ "$code" = "200" ]
}

echo "Revalidating product cache at $URL ..."
# The deployed route verifies with SHOPIFY_WEBHOOK_SECRET, or falls back to
# SHOPIFY_CLIENT_SECRET — so we try the webhook secret first, then the client
# secret. Whichever the live deploy uses will match.
if try "$(getv SHOPIFY_WEBHOOK_SECRET)" "webhook secret"; then
  echo "✓ Storefront product cache refreshed."
elif try "$(getv SHOPIFY_CLIENT_SECRET)" "client secret"; then
  echo "✓ Storefront product cache refreshed (verified via client secret)."
else
  echo "✗ Failed. Confirm the URL is right and the deploy has SHOPIFY_WEBHOOK_SECRET set."
  exit 1
fi
