"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Confirmation() {
  const params = useSearchParams();
  const orderName = params.get("order");
  const paymentId = params.get("payment");

  return (
    <div className="container confirm">
      <div className="check">✓</div>
      <h1>Thank you for your order</h1>
      <p style={{ color: "var(--text-light)", maxWidth: 480, margin: "0 auto" }}>
        Your payment was received and your order is confirmed. A receipt is on
        its way to your email.
      </p>

      {orderName && orderName !== "pending" && (
        <div className="order-no">Order {orderName}</div>
      )}
      {paymentId && (
        <p style={{ fontSize: 13, color: "var(--text-light)" }}>
          Payment reference: {paymentId}
        </p>
      )}

      <div style={{ marginTop: 28 }}>
        <Link href="/shop" className="btn">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="container confirm">
          <span className="spinner" style={{ borderColor: "#ccc", borderTopColor: "var(--accent)" }} />
        </div>
      }
    >
      <Confirmation />
    </Suspense>
  );
}
