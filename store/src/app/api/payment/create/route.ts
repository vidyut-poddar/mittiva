import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { getCart } from "@/lib/shopify/storefront";
import { computeOrderTotals } from "@/lib/totals";
import { toPaise } from "@/lib/money";
import { createRazorpayOrder } from "@/lib/razorpay";
import { savePendingCheckout } from "@/lib/store-kv";

// Always run dynamically; never cache a payment route.
export const dynamic = "force-dynamic";

/**
 * Create a Razorpay order for the customer's cart.
 *
 * The browser sends the cartId and shipping details, but it does NOT get to
 * decide the amount — we re-fetch the cart from Shopify and compute the total
 * server-side. The cartId is also written into the Razorpay order's `notes`,
 * which becomes the trusted binding used at verification.
 */
export async function POST(req: NextRequest) {
  // 1. Rate limit per IP.
  const rl = rateLimit(`pay-create:${clientIp(req)}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  // 2. Validate the body server-side.
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  try {
    // 3. Fetch the cart FRESH from Shopify (no cache) — authoritative prices.
    const cart = await getCart(input.cartId);
    if (!cart || cart.lines.length === 0) {
      return NextResponse.json({ error: "Cart is empty or not found" }, { status: 400 });
    }

    // 4. Compute the real total on the server.
    const subtotalPaise = toPaise(cart.subtotal.amount);
    const totals = computeOrderTotals(subtotalPaise, input.zone);
    if (totals.grandTotalPaise < 100) {
      return NextResponse.json({ error: "Order total too low" }, { status: 400 });
    }

    // 5. Create the Razorpay order, binding the cart via notes.cartId.
    const receipt = `cart_${cart.id.slice(-12)}_${Date.now().toString(36)}`;
    const rzpOrder = await createRazorpayOrder({
      amountPaise: totals.grandTotalPaise,
      receipt,
      notes: { cartId: cart.id, zone: input.zone ?? "" },
    });

    // 6. Persist checkout details so the webhook safety-net has what it needs.
    await savePendingCheckout(rzpOrder.id, {
      checkout: input,
      cartId: cart.id,
      expectedAmountPaise: totals.grandTotalPaise,
      shippingPaise: totals.shippingPaise,
      shippingLabel: totals.shippingLabel,
      createdAt: Date.now(),
    });

    // 7. Return only what the browser needs to open the Razorpay widget.
    return NextResponse.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      breakdown: {
        subtotalPaise: totals.subtotalPaise,
        shippingPaise: totals.shippingPaise,
        taxPaise: totals.taxPaise,
        taxInclusive: totals.taxInclusive,
        grandTotalPaise: totals.grandTotalPaise,
        shippingLabel: totals.shippingLabel,
      },
    });
  } catch (err) {
    console.error("payment/create failed:", err);
    return NextResponse.json({ error: "Could not start payment" }, { status: 500 });
  }
}
