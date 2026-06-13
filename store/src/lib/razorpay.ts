import "server-only";
import crypto from "node:crypto";

const KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  notes: Record<string, string>;
}

/**
 * Create a Razorpay order for an EXACT server-computed amount.
 *
 * We stash the Shopify `cartId` in `notes`. This is the linchpin of the
 * payment-to-cart binding: at verification time the server reads the cartId
 * back FROM RAZORPAY (authoritative) rather than trusting the browser.
 *
 * `payment_capture: 1` requests auto-capture so authorised payments are
 * actually settled. (Also confirm auto-capture is enabled in the dashboard.)
 */
export async function createRazorpayOrder(params: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!KEY_ID || !KEY_SECRET) {
    throw new Error("Razorpay keys are not configured");
  }
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      payment_capture: 1,
      notes: params.notes,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Razorpay order create failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/** Fetch an order back from Razorpay — used to read trusted `notes.cartId`. */
export async function fetchRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay keys are not configured");
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Razorpay order fetch failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as RazorpayOrder;
}

/** Fetch a payment to confirm its captured amount/status independently. */
export async function fetchRazorpayPayment(paymentId: string): Promise<{
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
}> {
  if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay keys are not configured");
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Razorpay payment fetch failed ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

/**
 * Verify the signature returned by Razorpay Checkout to the browser.
 * signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 * Uses a timing-safe comparison.
 */
export function verifyCheckoutSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  if (!KEY_SECRET) throw new Error("RAZORPAY_KEY_SECRET is not set");
  const expected = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, params.signature);
}

/**
 * Verify the signature on an incoming webhook.
 * signature = HMAC_SHA256(rawBody, webhook_secret)
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
