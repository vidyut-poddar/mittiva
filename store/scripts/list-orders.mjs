/**
 * List recent Shopify orders — run locally to confirm orders are landing.
 *
 *   cd store
 *   node scripts/list-orders.mjs
 *
 * Reads store/.env.local, gets an Admin token via the client-credentials grant,
 * and prints the 5 most recent orders with their payment status, total, line
 * items, and the Razorpay reference our server attaches. If your test order
 * shows up here marked PAID with a "Razorpay payment …" note, the full chain
 * (Razorpay → our server → Shopify) worked.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const env = {};
for (const line of fs.readFileSync(path.join(here, "..", ".env.local"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const DOMAIN = env.NEXT_PUBLIC_SHOPIFY_DOMAIN;
const VER = env.SHOPIFY_API_VERSION || "2025-10";

async function main() {
  // Admin token via client credentials
  const tokRes = await fetch(`https://${DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!tokRes.ok) {
    console.error("Token grant failed:", tokRes.status, await tokRes.text());
    process.exit(1);
  }
  const { access_token: ADMIN } = await tokRes.json();

  const query = `{
    orders(first: 5, sortKey: CREATED_AT, reverse: true) {
      edges { node {
        name
        createdAt
        displayFinancialStatus
        note
        tags
        totalPriceSet { shopMoney { amount currencyCode } }
        lineItems(first: 10) { edges { node { title quantity } } }
      } }
    }
  }`;

  const res = await fetch(`https://${DOMAIN}/admin/api/${VER}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": ADMIN },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error("Order query errors:", JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }

  const orders = json.data.orders.edges;
  if (!orders.length) {
    console.log("No orders found in this store yet.");
    return;
  }

  console.log(`Most recent ${orders.length} order(s) on ${DOMAIN}:\n`);
  for (const { node: o } of orders) {
    const items = o.lineItems.edges.map((e) => `${e.node.title} ×${e.node.quantity}`).join(", ");
    console.log(`• ${o.name}  [${o.displayFinancialStatus}]  ${o.totalPriceSet.shopMoney.amount} ${o.totalPriceSet.shopMoney.currencyCode}`);
    console.log(`    created: ${o.createdAt}`);
    console.log(`    items:   ${items}`);
    if (o.tags?.length) console.log(`    tags:    ${o.tags.join(", ")}`);
    if (o.note) console.log(`    note:    ${o.note}`);
    console.log("");
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
