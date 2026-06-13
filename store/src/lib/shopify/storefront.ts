// Storefront reads run server-side only (RSC + the /api/cart proxy), so the
// token is fetched on the server and never shipped to the browser.
import "server-only";
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_QUERY,
} from "./queries";
import type { Cart, CartLine, Product, ProductVariant } from "./types";
import { getStorefrontToken, shopifyDomain, shopifyApiVersion } from "./auth";

function endpoint(): string {
  return `https://${shopifyDomain()}/api/${shopifyApiVersion()}/graphql.json`;
}

type CachePolicy =
  | { cache: "no-store" }
  | { cache: "force-cache"; revalidate: number; tags?: string[] };

// Shared cache tag for all product data. The /api/revalidate webhook calls
// revalidateTag(PRODUCTS_TAG) when Shopify reports a product/inventory change,
// so the listing + detail pages refresh on-demand instead of only on a timer.
export const PRODUCTS_TAG = "shopify-products";

/**
 * Low-level GraphQL fetch against the Storefront API.
 *
 * Caching is explicit per call:
 *  - Product listings/details: cached + revalidated (fast, gentle on Shopify).
 *  - Cart & checkout: ALWAYS { cache: "no-store" } — money must be current,
 *    never stale (Security fix: cart pricing must not be cached).
 */
async function storefrontFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  policy: CachePolicy
): Promise<T> {
  const token = await getStorefrontToken();

  const init: RequestInit & { next?: { revalidate: number; tags?: string[] } } = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  };

  if (policy.cache === "no-store") {
    init.cache = "no-store";
  } else {
    init.cache = "force-cache";
    init.next = { revalidate: policy.revalidate, tags: policy.tags };
  }

  const res = await fetch(endpoint(), init);
  if (!res.ok) {
    throw new Error(`Shopify Storefront error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

// ── Normalisers (flatten Shopify's edges/nodes) ──────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
function normaliseVariant(node: any): ProductVariant {
  return {
    id: node.id,
    title: node.title,
    availableForSale: node.availableForSale,
    quantityAvailable: node.quantityAvailable ?? null,
    selectedOptions: node.selectedOptions ?? [],
    price: node.price,
  };
}

function normaliseProduct(node: any): Product {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description ?? "",
    descriptionHtml: node.descriptionHtml ?? "",
    tags: node.tags ?? [],
    availableForSale: node.availableForSale,
    featuredImage: node.featuredImage ?? null,
    images: (node.images?.edges ?? []).map((e: any) => e.node),
    options: node.options ?? [],
    minPrice: node.priceRange.minVariantPrice,
    variants: (node.variants?.edges ?? []).map((e: any) =>
      normaliseVariant(e.node)
    ),
  };
}

function normaliseCart(node: any): Cart {
  const lines: CartLine[] = (node.lines?.edges ?? []).map((e: any) => {
    const m = e.node.merchandise;
    return {
      id: e.node.id,
      quantity: e.node.quantity,
      variantId: m.id,
      variantTitle: m.title,
      productTitle: m.product?.title ?? "",
      productHandle: m.product?.handle ?? "",
      image: m.product?.featuredImage ?? null,
      price: m.price,
      selectedOptions: m.selectedOptions ?? [],
    };
  });
  return {
    id: node.id,
    checkoutUrl: node.checkoutUrl,
    totalQuantity: node.totalQuantity,
    subtotal: node.cost.subtotalAmount,
    total: node.cost.totalAmount,
    lines,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Public API ───────────────────────────────────────────────────────────────

// Long fallback window (1h). Freshness comes from on-demand revalidation via
// the /api/revalidate webhook; the timer is just a safety net.
const PRODUCT_REVALIDATE = 3600;

/** Product listing — cached, refreshed on-demand by the Shopify webhook. */
export async function getProducts(first = 50): Promise<Product[]> {
  const data = await storefrontFetch<{ products: { edges: { node: unknown }[] } }>(
    PRODUCTS_QUERY,
    { first },
    { cache: "force-cache", revalidate: PRODUCT_REVALIDATE, tags: [PRODUCTS_TAG] }
  );
  return data.products.edges.map((e) => normaliseProduct(e.node));
}

/** Single product — cached, refreshed on-demand by the Shopify webhook. */
export async function getProduct(handle: string): Promise<Product | null> {
  const data = await storefrontFetch<{ product: unknown | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    { cache: "force-cache", revalidate: PRODUCT_REVALIDATE, tags: [PRODUCTS_TAG] }
  );
  return data.product ? normaliseProduct(data.product) : null;
}

/** Create a cart. NO caching — cart data must always be fresh. */
export async function createCart(
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: unknown; userErrors: { message: string }[] };
  }>(CART_CREATE_MUTATION, { lines }, { cache: "no-store" });
  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return normaliseCart(data.cartCreate.cart);
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: unknown; userErrors: { message: string }[] };
  }>(CART_LINES_ADD_MUTATION, { cartId, lines }, { cache: "no-store" });
  if (data.cartLinesAdd.userErrors?.length) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }
  return normaliseCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: unknown; userErrors: { message: string }[] };
  }>(CART_LINES_UPDATE_MUTATION, { cartId, lines }, { cache: "no-store" });
  if (data.cartLinesUpdate.userErrors?.length) {
    throw new Error(data.cartLinesUpdate.userErrors[0].message);
  }
  return normaliseCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: unknown; userErrors: { message: string }[] };
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds }, { cache: "no-store" });
  if (data.cartLinesRemove.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }
  return normaliseCart(data.cartLinesRemove.cart);
}

/**
 * Fetch a cart fresh. NO caching. This is the authoritative source of the
 * cart's current total used by the payment routes (never trust the browser).
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await storefrontFetch<{ cart: unknown | null }>(
    CART_QUERY,
    { cartId },
    { cache: "no-store" }
  );
  return data.cart ? normaliseCart(data.cart) : null;
}
