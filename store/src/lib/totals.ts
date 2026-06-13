import { computeShipping } from "@/lib/shipping";
import { computeTax } from "@/lib/tax";

export interface OrderTotals {
  subtotalPaise: number;
  shippingPaise: number;
  taxPaise: number;
  taxInclusive: boolean;
  /** The amount actually charged to the customer (paise). */
  grandTotalPaise: number;
  shippingLabel: string;
}

/**
 * THE single source of truth for what a customer is charged.
 *
 * Used both when creating the Razorpay order AND when verifying the payment,
 * so the "amount paid == amount owed" check compares like with like. Always
 * call this on the SERVER with a subtotal freshly fetched from Shopify.
 */
export function computeOrderTotals(
  subtotalPaise: number,
  zone?: string
): OrderTotals {
  const shipping = computeShipping({ subtotalPaise, zone });
  // Tax base = goods + shipping (GST applies to shipping in India too).
  const taxableBase = subtotalPaise + shipping.costPaise;
  const tax = computeTax(taxableBase);

  // If tax is inclusive, it's already inside subtotal — don't add it again.
  const grandTotal = tax.inclusive
    ? subtotalPaise + shipping.costPaise
    : subtotalPaise + shipping.costPaise + tax.taxPaise;

  return {
    subtotalPaise,
    shippingPaise: shipping.costPaise,
    taxPaise: tax.taxPaise,
    taxInclusive: tax.inclusive,
    grandTotalPaise: grandTotal,
    shippingLabel: shipping.label,
  };
}
