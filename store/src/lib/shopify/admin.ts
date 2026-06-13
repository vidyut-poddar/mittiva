// `server-only` makes the build FAIL if this file is ever imported into
// client-side code — a guardrail so the Admin token can never leak to browsers.
import "server-only";

import type { CartLine } from "./types";
import { getAdminToken, shopifyDomain, shopifyApiVersion } from "./auth";

function adminEndpoint(): string {
  return `https://${shopifyDomain()}/admin/api/${shopifyApiVersion()}/graphql.json`;
}

async function adminFetch<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const adminToken = await getAdminToken();
  const res = await fetch(adminEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Shopify Admin error ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`Shopify Admin GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

export interface ShippingAddressInput {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  phone: string;
  country?: string;
}

export interface CreateOrderInput {
  email: string;
  phone: string;
  shippingAddress: ShippingAddressInput;
  lines: CartLine[];
  shippingPaise: number;
  shippingLabel: string;
  /** Razorpay identifiers, stored on the order for reconciliation. */
  razorpayPaymentId: string;
  razorpayOrderId: string;
}

const ORDER_CREATE_MUTATION = /* GraphQL */ `
  mutation OrderCreate(
    $order: OrderCreateOrderInput!
    $options: OrderCreateOptionsInput
  ) {
    orderCreate(order: $order, options: $options) {
      order {
        id
        name
        displayFinancialStatus
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a PAID order in Shopify after a payment is verified.
 *
 * The amount is built from server-trusted line prices + computed shipping.
 * We mark it paid via a manual transaction referencing the Razorpay payment.
 */
export async function createPaidOrder(input: CreateOrderInput): Promise<{
  id: string;
  name: string;
}> {
  const lineItems = input.lines.map((l) => ({
    variantId: l.variantId,
    quantity: l.quantity,
  }));

  const order = {
    email: input.email,
    phone: input.phone,
    shippingAddress: {
      firstName: input.shippingAddress.firstName,
      lastName: input.shippingAddress.lastName,
      address1: input.shippingAddress.address1,
      address2: input.shippingAddress.address2 ?? "",
      city: input.shippingAddress.city,
      province: input.shippingAddress.province ?? "",
      zip: input.shippingAddress.zip,
      phone: input.shippingAddress.phone,
      countryCode: input.shippingAddress.country ?? "IN",
    },
    lineItems,
    shippingLines: [
      {
        title: input.shippingLabel,
        priceSet: {
          shopMoney: {
            amount: (input.shippingPaise / 100).toFixed(2),
            currencyCode: "INR",
          },
        },
      },
    ],
    financialStatus: "PAID",
    note: `Razorpay payment ${input.razorpayPaymentId} (order ${input.razorpayOrderId})`,
    tags: ["headless-storefront", "razorpay"],
  };

  // inventoryBehaviour: DECREMENT_OBEYING_POLICY reduces stock for each line
  // item while respecting each product's "continue selling when out of stock"
  // setting (so tracked items go down and can't oversell). sendReceipt asks
  // Shopify to email the customer their order confirmation.
  const options = {
    inventoryBehaviour: "DECREMENT_OBEYING_POLICY",
    sendReceipt: true,
  };

  const data = await adminFetch<{
    orderCreate: {
      order: { id: string; name: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(ORDER_CREATE_MUTATION, { order, options });

  if (data.orderCreate.userErrors?.length) {
    throw new Error(
      `Shopify orderCreate failed: ${data.orderCreate.userErrors
        .map((e) => e.message)
        .join("; ")}`
    );
  }
  const created = data.orderCreate.order;
  if (!created) throw new Error("Shopify orderCreate returned no order");
  return created;
}
