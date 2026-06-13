import "server-only";
import { getCart } from "@/lib/shopify/storefront";
import { createPaidOrder } from "@/lib/shopify/admin";
import { fetchRazorpayOrder, fetchRazorpayPayment } from "@/lib/razorpay";
import { computeOrderTotals } from "@/lib/totals";
import { toPaise } from "@/lib/money";
import {
  claimPayment,
  getPendingCheckout,
  recordFulfilledOrder,
  getFulfilledOrder,
} from "@/lib/store-kv";

export type FulfillResult =
  | { ok: true; alreadyDone: boolean; order: { id: string; name: string } }
  | { ok: false; status: number; error: string };

/**
 * The ONE place an order gets created. Both the browser-driven verify route and
 * the Razorpay webhook call this, so the security checks can never diverge.
 *
 * Security properties enforced here:
 *  - Payment-to-cart binding: the cartId is read from RAZORPAY (order.notes),
 *    never from the browser.
 *  - Amount binding: the captured payment amount must equal the freshly
 *    recomputed total for that exact cart. A mismatch is rejected.
 *  - Idempotency: claimPayment() ensures a given payment fulfils at most once.
 */
export async function fulfillOrder(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<FulfillResult> {
  // 1. Read the authoritative cart binding from Razorpay itself.
  const rzpOrder = await fetchRazorpayOrder(razorpayOrderId);
  const trustedCartId = rzpOrder.notes?.cartId;
  if (!trustedCartId) {
    return { ok: false, status: 400, error: "Order is not bound to a cart" };
  }

  // 2. Confirm the payment belongs to this order and was actually captured.
  const payment = await fetchRazorpayPayment(razorpayPaymentId);
  if (payment.order_id !== razorpayOrderId) {
    return { ok: false, status: 400, error: "Payment does not match order" };
  }
  if (payment.status !== "captured" && payment.status !== "authorized") {
    return { ok: false, status: 400, error: `Payment not captured (${payment.status})` };
  }

  // 3. Recompute the real total from the CURRENT cart and bind to the amount.
  const cart = await getCart(trustedCartId);
  if (!cart) return { ok: false, status: 400, error: "Cart no longer exists" };

  const pending = await getPendingCheckout(razorpayOrderId);
  const zone = pending?.checkout.zone;

  const subtotalPaise = toPaise(cart.subtotal.amount);
  const totals = computeOrderTotals(subtotalPaise, zone);

  if (payment.amount !== totals.grandTotalPaise) {
    // The captured amount doesn't match what this cart actually costs now.
    return {
      ok: false,
      status: 409,
      error: "Paid amount does not match cart total",
    };
  }

  // 4. Idempotency — only the first claimant creates the order.
  const won = await claimPayment(razorpayPaymentId);
  if (!won) {
    const existing = await getFulfilledOrder(razorpayPaymentId);
    if (existing) return { ok: true, alreadyDone: true, order: existing };
    // Claimed but not yet recorded (race): treat as success-in-progress.
    return { ok: true, alreadyDone: true, order: { id: "", name: "pending" } };
  }

  // 5. We need the shipping address. It only lives in the pending record.
  if (!pending) {
    return {
      ok: false,
      status: 422,
      error: "No checkout details on file for this order",
    };
  }

  // 6. Create the paid Shopify order from server-trusted data.
  const addr = pending.checkout.shippingAddress;
  const order = await createPaidOrder({
    email: pending.checkout.contact.email,
    phone: pending.checkout.contact.phone,
    shippingAddress: {
      firstName: addr.firstName,
      lastName: addr.lastName,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      province: addr.province,
      zip: addr.zip,
      phone: pending.checkout.contact.phone,
      country: "IN",
    },
    lines: cart.lines,
    shippingPaise: totals.shippingPaise,
    shippingLabel: totals.shippingLabel,
    razorpayPaymentId,
    razorpayOrderId,
  });

  await recordFulfilledOrder(razorpayPaymentId, order);
  return { ok: true, alreadyDone: false, order };
}
