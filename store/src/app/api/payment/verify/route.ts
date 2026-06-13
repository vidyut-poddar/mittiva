import { NextRequest, NextResponse } from "next/server";
import { verifySchema } from "@/lib/validation";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { fulfillOrder } from "@/lib/fulfill";

export const dynamic = "force-dynamic";

/**
 * Called by the browser after Razorpay Checkout reports success.
 *
 * Step 1 proves the success message genuinely came from Razorpay (signature).
 * Everything after that (cart binding, amount check, idempotent order creation)
 * happens in fulfillOrder() — the same code path the webhook uses.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }
  const { razorpayOrderId, razorpayPaymentId, signature } = parsed.data;

  // 1. Verify the checkout signature (tamper-proof seal from Razorpay).
  const valid = verifyCheckoutSignature({
    razorpayOrderId,
    razorpayPaymentId,
    signature,
  });
  if (!valid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // 2. Bind to cart, check amount, create order idempotently.
  try {
    const result = await fulfillOrder(razorpayOrderId, razorpayPaymentId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      orderName: result.order.name,
      paymentId: razorpayPaymentId,
    });
  } catch (err) {
    console.error("payment/verify failed:", err);
    return NextResponse.json({ error: "Could not finalise order" }, { status: 500 });
  }
}
