import { TAX } from "@/config/store";

export interface TaxResult {
  /** Tax amount in paise. When prices are GST-inclusive this is the embedded
   *  portion (for display); when exclusive it's the amount we ADD on top. */
  taxPaise: number;
  /** Whether this tax is already inside the price (true) or added on (false). */
  inclusive: boolean;
  ratePercent: number;
}

/**
 * Compute GST. Two modes (set in config/store.ts):
 *  - inclusive: Shopify prices already contain GST. We back out the embedded
 *    portion only for display; it is NOT added to the charged total.
 *  - exclusive: GST is added on top of subtotal + shipping.
 */
export function computeTax(taxableBasePaise: number): TaxResult {
  const rate = TAX.gstRate;
  if (TAX.taxInclusive) {
    // base already includes tax: embedded tax = base - base/(1+rate)
    const embedded = Math.round(
      taxableBasePaise - taxableBasePaise / (1 + rate)
    );
    return { taxPaise: embedded, inclusive: true, ratePercent: rate * 100 };
  }
  return {
    taxPaise: Math.round(taxableBasePaise * rate),
    inclusive: false,
    ratePercent: rate * 100,
  };
}
