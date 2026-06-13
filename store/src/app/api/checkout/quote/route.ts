import { NextRequest, NextResponse } from "next/server";
import { getCart } from "@/lib/shopify/storefront";
import { computeOrderTotals } from "@/lib/totals";
import { toPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

/**
 * Returns a server-computed price breakdown for display on the checkout page
 * (subtotal, shipping, tax, total). Display only — the binding total used for
 * payment is recomputed again in payment/create and at verification.
 */
export async function POST(req: NextRequest) {
  let body: { cartId?: string; zone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.cartId) {
    return NextResponse.json({ error: "Missing cartId" }, { status: 400 });
  }
  try {
    const cart = await getCart(body.cartId);
    if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    const totals = computeOrderTotals(toPaise(cart.subtotal.amount), body.zone);
    return NextResponse.json({ totals, currency: cart.subtotal.currencyCode });
  } catch (err) {
    console.error("quote failed:", err);
    return NextResponse.json({ error: "Could not price cart" }, { status: 500 });
  }
}
