import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { fulfillOrder } from "@/lib/fulfill";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook — the safety net.
 *
 * If the customer closes their browser right after paying, the verify route
 * never runs. This webhook fires anyway and fulfils the order. Because it
 * shares fulfillOrder() (which is idempotent), it can run alongside verify
 * without ever creating a duplicate order.
 *
 * Configured in Razorpay for `payment.captured` (and optionally
 * `payment.failed`). Signature is verified against the RAW request body.
 */
export async function POST(req: NextRequest) {
  // Read the raw body BEFORE parsing — signature is computed over raw bytes.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // We only act on captured payments.
  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true, ignored: event.event });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  try {
    const result = await fulfillOrder(payment.order_id, payment.id);
    if (!result.ok) {
      // Log but still 200 where appropriate so Razorpay doesn't hammer retries
      // for permanent errors. Amount mismatch / missing details are logged.
      console.error("webhook fulfilment issue:", result.error);
      // 409/422 are non-retryable business errors; ack them.
      const ack = result.status === 409 || result.status === 422;
      return NextResponse.json(
        { received: true, error: result.error },
        { status: ack ? 200 : result.status }
      );
    }
    return NextResponse.json({ received: true, order: result.order.name });
  } catch (err) {
    console.error("webhook fulfilment failed:", err);
    // 500 → Razorpay will retry, which is what we want for transient failures.
    return NextResponse.json({ error: "Fulfilment error" }, { status: 500 });
  }
}
