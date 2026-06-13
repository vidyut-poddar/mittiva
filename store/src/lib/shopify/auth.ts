import "server-only";

/**
 * Shopify authentication via the CLIENT CREDENTIALS grant.
 *
 * As of 1 Jan 2026, Shopify no longer issues static Admin API tokens from the
 * store admin. For an app you build in your own org and install on your own
 * store, the client credentials grant is the right flow: the server exchanges
 * the app's Client ID + Secret for a short-lived (24h) Admin API access token,
 * with no OAuth redirect or embedded-app UI.
 *
 * This module:
 *  1. Gets + caches the Admin API token, refreshing it before it expires.
 *  2. Derives a Storefront API token (for product/cart reads) server-side via
 *     the Admin API, reusing an existing one or creating it once.
 *
 * Both tokens stay on the server. Nothing here is exposed to the browser.
 */

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = process.env.SHOPIFY_API_VERSION || "2025-10";
const STOREFRONT_TOKEN_TITLE = "Headless Storefront";

function requireConfig() {
  if (!DOMAIN) throw new Error("NEXT_PUBLIC_SHOPIFY_DOMAIN is not set");
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET are not set");
  }
}

// ── Admin token (client credentials) ─────────────────────────────────────────
let adminTokenCache: { token: string; expiresAt: number } | null = null;

export async function getAdminToken(): Promise<string> {
  requireConfig();
  const now = Date.now();
  // Reuse while still valid (refresh 60s early).
  if (adminTokenCache && now < adminTokenCache.expiresAt - 60_000) {
    return adminTokenCache.token;
  }

  const res = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `Shopify client-credentials grant failed ${res.status}: ${await res.text()}`
    );
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  adminTokenCache = {
    token: data.access_token,
    expiresAt: now + (data.expires_in ?? 86400) * 1000,
  };
  return adminTokenCache.token;
}

// ── Storefront token (derived via Admin API) ─────────────────────────────────
let storefrontTokenCache: string | null = null;

export async function getStorefrontToken(): Promise<string> {
  // Allow an explicit override if the app config exposes a Storefront token.
  if (process.env.SHOPIFY_STOREFRONT_TOKEN) {
    return process.env.SHOPIFY_STOREFRONT_TOKEN;
  }
  if (storefrontTokenCache) return storefrontTokenCache;

  const adminToken = await getAdminToken();
  const base = `https://${DOMAIN}/admin/api/${API_VERSION}/storefront_access_tokens.json`;
  const headers = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": adminToken,
  };

  // Reuse an existing token created by this app, if present.
  const listRes = await fetch(base, { headers, cache: "no-store" });
  if (listRes.ok) {
    const list = (await listRes.json()) as {
      storefront_access_tokens: { access_token: string; title: string }[];
    };
    const existing = list.storefront_access_tokens?.find(
      (t) => t.title === STOREFRONT_TOKEN_TITLE
    );
    if (existing) {
      storefrontTokenCache = existing.access_token;
      return storefrontTokenCache;
    }
  }

  // Otherwise create one (requires the app's unauthenticated_* storefront scopes).
  const createRes = await fetch(base, {
    method: "POST",
    headers,
    body: JSON.stringify({
      storefront_access_token: { title: STOREFRONT_TOKEN_TITLE },
    }),
    cache: "no-store",
  });
  if (!createRes.ok) {
    throw new Error(
      `Could not create Storefront token ${createRes.status}: ${await createRes.text()}`
    );
  }
  const created = (await createRes.json()) as {
    storefront_access_token: { access_token: string };
  };
  storefrontTokenCache = created.storefront_access_token.access_token;
  return storefrontTokenCache;
}

export function shopifyDomain(): string {
  if (!DOMAIN) throw new Error("NEXT_PUBLIC_SHOPIFY_DOMAIN is not set");
  return DOMAIN;
}

export function shopifyApiVersion(): string {
  return API_VERSION;
}
