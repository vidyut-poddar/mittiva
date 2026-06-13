"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPaise } from "@/lib/money";
import { SHIPPING } from "@/config/store";
import { shippingOptions } from "@/lib/shipping";

/* Minimal typing for the Razorpay Checkout script loaded from their CDN. */
type RazorpayInstance = { open: () => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

interface Totals {
  subtotalPaise: number;
  shippingPaise: number;
  taxPaise: number;
  taxInclusive: boolean;
  grandTotalPaise: number;
  shippingLabel: string;
}

const RZP_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RZP_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const emptyForm = {
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  province: "",
  zip: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refresh } = useCart();

  const [form, setForm] = useState(emptyForm);
  const [zone, setZone] = useState(
    SHIPPING.model === "zone" ? Object.keys(SHIPPING.zones)[0] : ""
  );
  const [totals, setTotals] = useState<Totals | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const zoneList = shippingOptions();

  // Keep the live price quote in sync with cart + chosen zone.
  const quote = useCallback(async () => {
    if (!cart) return;
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id, zone }),
      });
      if (res.ok) {
        const data = (await res.json()) as { totals: Totals };
        setTotals(data.totals);
      }
    } catch {
      /* leave previous totals */
    }
  }, [cart, zone]);

  useEffect(() => {
    quote();
  }, [quote]);

  if (cart && cart.lines.length === 0) {
    return (
      <div className="container empty">
        <h2>Your cart is empty</h2>
        <button className="btn" onClick={() => router.push("/shop")}>
          Browse the collection
        </button>
      </div>
    );
  }

  function set<K extends keyof typeof emptyForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handlePay() {
    if (!cart) return;
    setError(null);

    const payload = {
      cartId: cart.id,
      zone: zone || undefined,
      contact: { email: form.email.trim(), phone: form.phone.trim() },
      shippingAddress: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        address1: form.address1.trim(),
        address2: form.address2.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        zip: form.zip.trim(),
      },
    };

    setSubmitting(true);
    try {
      // 1. Ask our server to create the Razorpay order (it sets the amount).
      const createRes = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await createRes.json();
      if (!createRes.ok) {
        setError(created.error || "Could not start payment.");
        setSubmitting(false);
        return;
      }

      // 2. Load Razorpay and open the payment box.
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        setError("Could not load the payment window. Check your connection.");
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: created.keyId,
        order_id: created.razorpayOrderId,
        amount: created.amount,
        currency: created.currency,
        name: "Boutique",
        description: "Order payment",
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          contact: form.phone,
        },
        notes: { cartId: cart.id },
        theme: { color: "#8a6d4f" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 3. Verify on our server, which finalises the order.
          try {
            const vRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                signature: resp.razorpay_signature,
              }),
            });
            const v = await vRes.json();
            if (!vRes.ok) {
              setError(v.error || "We couldn't confirm your payment. We'll email you.");
              setSubmitting(false);
              return;
            }
            // 4. Success — clear cart and go to confirmation.
            const params = new URLSearchParams({
              order: v.orderName ?? "",
              payment: resp.razorpay_payment_id,
            });
            const { localStorage } = window;
            localStorage.removeItem("boutique_cart_id");
            router.push(`/order/confirmation?${params.toString()}`);
          } catch {
            setError("Payment succeeded but confirmation failed. We'll email you.");
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            refresh();
          },
        },
      });
      rzp.open();
    } catch {
      setError("Something went wrong starting checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="layout-narrow">
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, marginBottom: 20 }}>
        Checkout
      </h1>

      {error && <div className="banner error">{error}</div>}

      <div className="checkout-cols">
        {/* ── Form ── */}
        <div>
          <h3 style={{ fontSize: 18 }}>Contact</h3>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="field">
            <label>Mobile number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="10-digit mobile"
            />
          </div>

          <h3 style={{ fontSize: 18, marginTop: 24 }}>Shipping address</h3>
          <div className="field-row">
            <div className="field">
              <label>First name</label>
              <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
            </div>
            <div className="field">
              <label>Last name</label>
              <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <input value={form.address1} onChange={(e) => set("address1", e.target.value)} />
          </div>
          <div className="field">
            <label>Apartment, suite, etc. (optional)</label>
            <input value={form.address2} onChange={(e) => set("address2", e.target.value)} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>City</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} />
            </div>
            <div className="field">
              <label>State</label>
              <input value={form.province} onChange={(e) => set("province", e.target.value)} />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 220 }}>
            <label>PIN code</label>
            <input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="6 digits" />
          </div>

          {SHIPPING.model === "zone" && (
            <div className="field" style={{ maxWidth: 320 }}>
              <label>Delivery region</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)}>
                {zoneList.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label} — {formatPaise(z.ratePaise)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Summary ── */}
        <div>
          <div className="summary">
            {cart?.lines.map((l) => (
              <div className="row" key={l.id}>
                <span>
                  {l.productTitle} × {l.quantity}
                </span>
              </div>
            ))}
            <div className="row" style={{ borderTop: "1px solid var(--glass-border)", marginTop: 8, paddingTop: 12 }}>
              <span>Subtotal</span>
              <span>{totals ? formatPaise(totals.subtotalPaise) : "…"}</span>
            </div>
            <div className="row">
              <span>{totals?.shippingLabel ?? "Shipping"}</span>
              <span>
                {totals
                  ? totals.shippingPaise === 0
                    ? "Free"
                    : formatPaise(totals.shippingPaise)
                  : "…"}
              </span>
            </div>
            <div className="row">
              <span>GST{totals?.taxInclusive ? " (incl.)" : ""}</span>
              <span>{totals ? formatPaise(totals.taxPaise) : "…"}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>{totals ? formatPaise(totals.grandTotalPaise) : "…"}</span>
            </div>
          </div>

          <button
            className="btn block"
            style={{ marginTop: 18 }}
            onClick={handlePay}
            disabled={submitting || !cart}
          >
            {submitting && <span className="spinner" />}
            Pay {totals ? formatPaise(totals.grandTotalPaise) : ""}
          </button>
          <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 12, textAlign: "center" }}>
            Secure payment via Razorpay. Card details never touch this site.
          </p>
        </div>
      </div>
    </div>
  );
}
