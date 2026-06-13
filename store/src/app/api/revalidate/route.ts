import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "node:crypto";
import { PRODUCTS_TAG } from "@/lib/shopify/storefront";

export const dynamic = "force-dynamic";

// Shopify signs webhooks with HMAC-SHA256 (base64) of the raw body. App/Admin-
// API-created webhooks use the app's API secret (client secret); webhooks made
// in admin → Notifications use the signing secret shown there. We accept an
// explicit SHOPIFY_WEBHOOK_SECRET and fall back to the client secret.
const WEBHOOK_SECRET =
  process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_CLIENT_SECRET;

function verifyShopifyHmac(rawBody: string, hmacHeader: string): boolean {
  if (!WEBHOOK_SECRET) return false;
  const digest = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(hmacHeader);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * On-demand revalidation. Shopify calls this when a product or its inventory
 * changes (webhook topics: products/update, products/create, products/delete,
 * inventory_levels/update). We verify the signature, then drop the cached
 * product data so the next visitor gets fresh prices/stock — no polling, no
 * regeneration when nothing changed.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get("x-shopify-hmac-sha256");

  if (!hmac || !verifyShopifyHmac(rawBody, hmac)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  revalidateTag(PRODUCTS_TAG);

  const topic = req.headers.get("x-shopify-topic") ?? "unknown";
  return NextResponse.json({ revalidated: true, topic });
}
