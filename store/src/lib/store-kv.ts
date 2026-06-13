import "server-only";
import type { CheckoutInput } from "./validation";

/**
 * Tiny persistence layer (Security fix: "add a small persistence layer").
 *
 * Two jobs:
 *  1. Stash the customer's checkout details when payment STARTS, keyed by the
 *     Razorpay order id, so the webhook safety-net has everything it needs to
 *     create the order even if the browser never comes back.
 *  2. Record which Razorpay payment ids have already been fulfilled, so we
 *     never create a duplicate Shopify order (idempotency).
 *
 * Backend: if KV_REST_API_URL/TOKEN are set (Vercel KV / Upstash Redis REST),
 * we use that — durable across serverless invocations. Otherwise we fall back
 * to an in-memory Map, which is fine for local dev but resets on restart.
 */

// Accept either the Vercel KV naming or the Upstash Marketplace naming, since
// the managed-Redis integration may inject the credentials under either.
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const usingKv = Boolean(KV_URL && KV_TOKEN);

const TTL_SECONDS = 60 * 60 * 24; // keep checkout context for 24h

export interface PendingCheckout {
  checkout: CheckoutInput;
  cartId: string;
  expectedAmountPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  createdAt: number;
}

// ── In-memory fallback ───────────────────────────────────────────────────────
// Stored on globalThis so it's a single process-wide instance. Without this,
// Next.js compiles each API route into its own module bundle, giving each route
// its OWN Map — so a value written by /api/payment/create would be invisible to
// /api/payment/verify. globalThis also survives dev hot-reloads.
// NOTE: this only shares within ONE process. Multi-instance/serverless
// deployments still require a real KV store (set KV_REST_API_URL/TOKEN).
const globalForKv = globalThis as unknown as {
  __storeMemory?: Map<string, { value: string; expiresAt: number }>;
};
const memory =
  globalForKv.__storeMemory ??
  (globalForKv.__storeMemory = new Map<string, { value: string; expiresAt: number }>());

function memGet(key: string): string | null {
  const e = memory.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    memory.delete(key);
    return null;
  }
  return e.value;
}
function memSet(key: string, value: string, ttlSec: number) {
  memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

// ── KV (Upstash REST) helpers ────────────────────────────────────────────────
async function kvCommand(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV error ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { result: unknown };
  return json.result;
}

async function kvGet(key: string): Promise<string | null> {
  const r = await kvCommand(["GET", key]);
  return (r as string | null) ?? null;
}
async function kvSet(key: string, value: string, ttlSec: number) {
  await kvCommand(["SET", key, value, "EX", ttlSec]);
}
async function kvSetNx(key: string, value: string, ttlSec: number): Promise<boolean> {
  // SET key value NX EX ttl -> "OK" if set, null if it already existed.
  const r = await kvCommand(["SET", key, value, "NX", "EX", ttlSec]);
  return r === "OK";
}

// ── Public API ───────────────────────────────────────────────────────────────

const pendingKey = (razorpayOrderId: string) => `pending:${razorpayOrderId}`;
const processedKey = (paymentId: string) => `processed:${paymentId}`;

export async function savePendingCheckout(
  razorpayOrderId: string,
  data: PendingCheckout
): Promise<void> {
  const payload = JSON.stringify(data);
  if (usingKv) await kvSet(pendingKey(razorpayOrderId), payload, TTL_SECONDS);
  else memSet(pendingKey(razorpayOrderId), payload, TTL_SECONDS);
}

export async function getPendingCheckout(
  razorpayOrderId: string
): Promise<PendingCheckout | null> {
  const raw = usingKv
    ? await kvGet(pendingKey(razorpayOrderId))
    : memGet(pendingKey(razorpayOrderId));
  return raw ? (JSON.parse(raw) as PendingCheckout) : null;
}

/**
 * Atomically claim a payment id for processing. Returns true if THIS caller
 * won the claim (proceed to create the order), false if it was already
 * claimed/processed (skip — idempotent).
 */
export async function claimPayment(paymentId: string): Promise<boolean> {
  if (usingKv) {
    return kvSetNx(processedKey(paymentId), String(Date.now()), TTL_SECONDS * 7);
  }
  // In-memory: emulate SET NX.
  if (memGet(processedKey(paymentId)) !== null) return false;
  memSet(processedKey(paymentId), String(Date.now()), TTL_SECONDS * 7);
  return true;
}

/** Record the resulting Shopify order against the payment (for confirmation lookup). */
export async function recordFulfilledOrder(
  paymentId: string,
  shopifyOrder: { id: string; name: string }
): Promise<void> {
  const payload = JSON.stringify(shopifyOrder);
  const key = `order:${paymentId}`;
  if (usingKv) await kvSet(key, payload, TTL_SECONDS * 7);
  else memSet(key, payload, TTL_SECONDS * 7);
}

export async function getFulfilledOrder(
  paymentId: string
): Promise<{ id: string; name: string } | null> {
  const key = `order:${paymentId}`;
  const raw = usingKv ? await kvGet(key) : memGet(key);
  return raw ? (JSON.parse(raw) as { id: string; name: string }) : null;
}

export const persistenceMode = usingKv ? "kv" : "memory";
