"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cart } from "@/lib/shopify/types";

const CART_ID_KEY = "boutique_cart_id";

interface CartContextValue {
  cart: Cart | null;
  loading: boolean;
  count: number;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearLocal: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

async function cartAction(payload: Record<string, unknown>): Promise<Cart | null> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Cart error");
  const data = (await res.json()) as { cart: Cart | null };
  return data.cart;
}

function readCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_ID_KEY);
}
function writeCartId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) window.localStorage.setItem(CART_ID_KEY, id);
  else window.localStorage.removeItem(CART_ID_KEY);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, rehydrate the cart from its stored id.
  useEffect(() => {
    let active = true;
    (async () => {
      const id = readCartId();
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const c = await cartAction({ action: "get", cartId: id });
        if (active) {
          if (c) setCart(c);
          else writeCartId(null); // stale/expired cart
        }
      } catch {
        /* ignore — start fresh */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    setLoading(true);
    try {
      const id = readCartId();
      let c: Cart | null;
      if (id) {
        c = await cartAction({ action: "add", cartId: id, variantId, quantity });
      } else {
        c = await cartAction({ action: "create", variantId, quantity });
        if (c) writeCartId(c.id);
      }
      setCart(c);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    const id = readCartId();
    if (!id) return;
    setLoading(true);
    try {
      const c = await cartAction({ action: "update", cartId: id, lineId, quantity });
      setCart(c);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    const id = readCartId();
    if (!id) return;
    setLoading(true);
    try {
      const c = await cartAction({ action: "remove", cartId: id, lineId });
      setCart(c);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const id = readCartId();
    if (!id) return;
    const c = await cartAction({ action: "get", cartId: id });
    if (c) setCart(c);
    else {
      writeCartId(null);
      setCart(null);
    }
  }, []);

  const clearLocal = useCallback(() => {
    writeCartId(null);
    setCart(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      count: cart?.totalQuantity ?? 0,
      addItem,
      updateItem,
      removeItem,
      refresh,
      clearLocal,
    }),
    [cart, loading, addItem, updateItem, removeItem, refresh, clearLocal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
