/**
 * Store configuration — the single place to tune business rules.
 *
 * Nothing here is secret; secrets live in .env.local. This file holds the
 * *decisions* (shipping model, GST rate, currency) that the client makes.
 * Change the values here and the checkout math updates everywhere.
 */

export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";

/**
 * "Shop by concern" filtering uses Shopify product tags.
 *
 * - Empty string (default): EVERY product tag becomes a filter chip — tag a
 *   product "Dull Skin" in Shopify and it shows up as a filter.
 * - Set a prefix like "concern:" to curate — then only tags such as
 *   "concern:Dull Skin" become filters (the prefix is stripped for display),
 *   keeping internal tags (e.g. "bestseller") out of the filter bar.
 */
export const CONCERN_TAG_PREFIX = "";

/**
 * Razorpay's standard Payment Gateway does NOT calculate shipping — our server
 * does, and folds the result into the order total. (Razorpay Magic Checkout can
 * do shipping, but that's a different integration than this headless flow.)
 *
 * Pick ONE model below by setting `SHIPPING.model`. All four are implemented in
 * src/lib/shipping.ts — switching is a one-line change, no code rewrite.
 */
export type ShippingModel = "free" | "flat" | "free_over_threshold" | "zone";

export const SHIPPING: {
  model: ShippingModel;
  /** Flat fee in paise (₹1 = 100 paise). Used by "flat" and "free_over_threshold". */
  flatRatePaise: number;
  /** Order subtotal (in paise) at or above which shipping becomes free. */
  freeThresholdPaise: number;
  /** Per-zone rates in paise, keyed by zone id. Used by "zone". */
  zones: Record<string, { label: string; ratePaise: number }>;
} = {
  // Default: free shipping once the cart crosses a threshold — the common
  // boutique choice. Change to "free" | "flat" | "zone" as the client decides.
  model: "free_over_threshold",

  flatRatePaise: 9900, // ₹99
  freeThresholdPaise: 200000, // ₹2,000

  zones: {
    kolkata: { label: "Kolkata", ratePaise: 4900 }, // ₹49
    west_bengal: { label: "West Bengal", ratePaise: 7900 }, // ₹79
    rest_of_india: { label: "Rest of India", ratePaise: 12900 }, // ₹129
  },
};

/**
 * GST. Indian apparel is commonly 5% (≤ ₹1,000 per item) or 12% (above).
 * This is a simplifying default — confirm the correct slab with the client's
 * accountant. Set `taxInclusive: true` if Shopify prices already include GST
 * (then we don't add it again, we just display it as "incl.").
 */
export const TAX = {
  taxInclusive: true, // Shopify prices in India are typically GST-inclusive.
  gstRate: 0.05, // 5% — used only when taxInclusive = false, or for display.
};

/** Rate limiting on the payment-creation route. */
export const RATE_LIMIT = {
  maxRequests: 20,
  windowMs: 60_000, // per minute, per IP
};
