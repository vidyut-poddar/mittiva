/**
 * Shopify connection test — run locally (this needs internet; your dev machine
 * has it, the build sandbox does not).
 *
 *   cd store
 *   node scripts/test-connection.mjs
 *
 * Reads store/.env.local and checks the full chain:
 *   1. client-credentials grant   -> Admin API token (+ shows granted scopes)
 *   2. Admin API shop query        -> confirms admin access works
 *   3. Storefront token (list/create via Admin REST)
 *   4. Storefront products query   -> confirms products are published & readable
 *
 * Secrets are masked in the output, so it's safe to copy/paste the result.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(here, "..", ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("Could not find store/.env.local — create it first.");
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const DOMAIN = env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const VER = env.SHOPIFY_API_VERSION || "2025-10";
const mask = (s) => (s ? `${s.slice(0, 8)}…${s.slice(-4)}` : "(none)");
const ok = (b) => (b ? "✓" : "✗");

function requireEnv() {
  const missing = ["NEXT_PUBLIC_SHOPIFY_DOMAIN", "SHOPIFY_CLIENT_ID", "SHOPIFY_CLIENT_SECRET"]
    .filter((k) => !env[k]);
  if (missing.length) {
    console.error("Missing in .env.local:", missing.join(", "));
    process.exit(1);
  }
}

async function main() {
  requireEnv();
  console.log(`Store: ${DOMAIN}  |  API version: ${VER}\n`);

  // 1. client credentials grant -> admin token
  console.log("[1] Client-credentials grant…");
  const tokRes = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  const tokText = await tokRes.text();
  console.log(`    ${ok(tokRes.ok)} status ${tokRes.status}`);
  if (!tokRes.ok) {
    console.log("    body:", tokText.slice(0, 500));
    console.log("\n→ Check: is the app INSTALLED on the store, and the secret correct?");
    process.exit(1);
  }
  const tok = JSON.parse(tokText);
  const ADMIN = tok.access_token;
  console.log(`    admin token: ${mask(ADMIN)}  expires_in: ${tok.expires_in}s`);
  console.log(`    scopes: ${tok.scope || "(none reported)"}`);

  // 2. admin shop query
  console.log("\n[2] Admin API shop query…");
  const shopRes = await fetch(`https://${DOMAIN}/admin/api/${VER}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN },
    body: JSON.stringify({ query: "{ shop { name currencyCode } }" }),
  });
  const shopJson = await shopRes.json();
  console.log(`    ${ok(shopRes.ok && !shopJson.errors)} status ${shopRes.status}`);
  console.log("   ", JSON.stringify(shopJson.data || shopJson.errors).slice(0, 400));

  // 3. storefront token
  console.log("\n[3] Storefront token (list/create via Admin REST)…");
  const base = `https://${DOMAIN}/admin/api/${VER}/storefront_access_tokens.json`;
  let SF = env.SHOPIFY_STOREFRONT_TOKEN || null;
  if (SF) {
    console.log("    using SHOPIFY_STOREFRONT_TOKEN override:", mask(SF));
  } else {
    const listRes = await fetch(base, { headers: { "X-Shopify-Access-Token": ADMIN } });
    if (listRes.ok) {
      const list = await listRes.json();
      const ex = (list.storefront_access_tokens || []).find((t) => t.title === "Headless Storefront");
      if (ex) {
        SF = ex.access_token;
        console.log("    reused existing:", mask(SF));
      }
    } else {
      console.log(`    list ✗ status ${listRes.status}:`, (await listRes.text()).slice(0, 300));
    }
    if (!SF) {
      const cRes = await fetch(base, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN },
        body: JSON.stringify({ storefront_access_token: { title: "Headless Storefront" } }),
      });
      const ct = await cRes.text();
      console.log(`    create ${ok(cRes.ok)} status ${cRes.status}`);
      if (cRes.ok) {
        SF = JSON.parse(ct).storefront_access_token.access_token;
        console.log("    created:", mask(SF));
      } else {
        console.log("    body:", ct.slice(0, 300));
      }
    }
  }

  // 4. storefront products query
  if (SF) {
    console.log("\n[4] Storefront API products query…");
    const sfRes = await fetch(`https://${DOMAIN}/api/${VER}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": SF },
      body: JSON.stringify({
        query:
          "{ products(first:5){edges{node{title handle availableForSale priceRange{minVariantPrice{amount currencyCode}}}}} }",
      }),
    });
    const sfJson = await sfRes.json();
    console.log(`    ${ok(sfRes.ok && !sfJson.errors)} status ${sfRes.status}`);
    const edges = sfJson.data?.products?.edges || [];
    if (edges.length) {
      for (const e of edges) {
        const p = e.node;
        console.log(
          `      • ${p.title} — ${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode} (available: ${p.availableForSale})`
        );
      }
    } else {
      console.log("      (no products returned — add a product and publish it to the app's sales channel)");
      if (sfJson.errors) console.log("      errors:", JSON.stringify(sfJson.errors).slice(0, 300));
    }
  }

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("\nERROR:", e.message);
  process.exit(1);
});
