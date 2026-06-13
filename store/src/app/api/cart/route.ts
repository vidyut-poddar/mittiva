import { NextRequest, NextResponse } from "next/server";
import {
  createCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  getCart,
} from "@/lib/shopify/storefront";

export const dynamic = "force-dynamic";

/**
 * Thin cart proxy so all Shopify cart traffic stays server-side and uncached.
 * The client CartContext POSTs { action, ... } here.
 */
export async function POST(req: NextRequest) {
  let body: {
    action?: string;
    cartId?: string;
    variantId?: string;
    quantity?: number;
    lineId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    switch (body.action) {
      case "create": {
        const lines = body.variantId
          ? [{ merchandiseId: body.variantId, quantity: body.quantity ?? 1 }]
          : [];
        const cart = await createCart(lines);
        return NextResponse.json({ cart });
      }
      case "add": {
        if (!body.cartId || !body.variantId)
          return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        const cart = await addCartLines(body.cartId, [
          { merchandiseId: body.variantId, quantity: body.quantity ?? 1 },
        ]);
        return NextResponse.json({ cart });
      }
      case "update": {
        if (!body.cartId || !body.lineId)
          return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        const cart = await updateCartLines(body.cartId, [
          { id: body.lineId, quantity: body.quantity ?? 1 },
        ]);
        return NextResponse.json({ cart });
      }
      case "remove": {
        if (!body.cartId || !body.lineId)
          return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        const cart = await removeCartLines(body.cartId, [body.lineId]);
        return NextResponse.json({ cart });
      }
      case "get": {
        if (!body.cartId) return NextResponse.json({ cart: null });
        const cart = await getCart(body.cartId);
        return NextResponse.json({ cart });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err) {
    console.error("cart action failed:", err);
    return NextResponse.json({ error: "Cart operation failed" }, { status: 500 });
  }
}
