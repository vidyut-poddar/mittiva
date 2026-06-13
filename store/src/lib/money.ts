import { CURRENCY_SYMBOL } from "@/config/store";

/**
 * Money is always handled in the smallest unit (paise) as an integer to avoid
 * floating-point rounding bugs. Razorpay also expects paise. Shopify returns
 * decimal strings (e.g. "1499.00"), which we convert to paise on the way in.
 */

/** Convert a Shopify decimal amount string ("1499.00") to integer paise. */
export function toPaise(amount: string | number): number {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) throw new Error(`Invalid money amount: ${amount}`);
  return Math.round(n * 100);
}

/** Format integer paise as a display string, e.g. 149900 -> "₹1,499.00". */
export function formatPaise(paise: number): string {
  const rupees = paise / 100;
  return `${CURRENCY_SYMBOL}${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
