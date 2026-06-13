"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="site-header">
      <div className="bar">
        <Link href="/" className="brand" aria-label="Jeevi Herbals home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Jeevi Herbals" />
        </Link>
        <nav className="nav-links">
          <Link href="/shop">Shop the Wild</Link>
          <Link href="/about" className="hide-sm">
            Forest Secrets
          </Link>
          <Link href="/cart" className="cart-pill">
            Cart
            {count > 0 && <span className="count">{count}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
