"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPaise, toPaise } from "@/lib/money";

export default function CartPage() {
  const router = useRouter();
  const { cart, loading, updateItem, removeItem } = useCart();

  if (!loading && (!cart || cart.lines.length === 0)) {
    return (
      <div className="container empty">
        <h2>Your cart is empty</h2>
        <p>Nothing added yet — let&rsquo;s find something you love.</p>
        <Link href="/shop" className="btn" style={{ marginTop: 16 }}>
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="layout-narrow">
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, marginBottom: 8 }}>
        Your Cart
      </h1>

      {!cart && loading && (
        <div className="empty">
          <span className="spinner" style={{ borderColor: "#ccc", borderTopColor: "var(--accent)" }} />
        </div>
      )}

      {cart?.lines.map((line) => (
        <div key={line.id} className="cart-line">
          <Link href={`/products/${line.productHandle}`} className="thumb">
            {line.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={line.image.url} alt={line.image.altText ?? line.productTitle} />
            )}
          </Link>
          <div className="meta">
            <div className="name">{line.productTitle}</div>
            <div className="opts">
              {line.selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" · ")}
            </div>
            <div className="qty" style={{ marginTop: 10 }}>
              <button
                onClick={() => updateItem(line.id, Math.max(1, line.quantity - 1))}
                disabled={loading}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span>{line.quantity}</span>
              <button
                onClick={() => updateItem(line.id, line.quantity + 1)}
                disabled={loading}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button className="link-remove" onClick={() => removeItem(line.id)}>
              Remove
            </button>
          </div>
          <div style={{ textAlign: "right", fontFamily: "var(--serif)" }}>
            {formatPaise(toPaise(line.price.amount) * line.quantity)}
          </div>
        </div>
      ))}

      {cart && cart.lines.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="summary">
            <div className="row">
              <span>Subtotal</span>
              <span>{formatPaise(toPaise(cart.subtotal.amount))}</span>
            </div>
            <div className="row">
              <span>Shipping &amp; tax</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <button
            className="btn block"
            style={{ marginTop: 18 }}
            onClick={() => router.push("/checkout")}
          >
            Proceed to checkout
          </button>
        </div>
      )}
    </div>
  );
}
