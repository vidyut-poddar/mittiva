import { SHIPPING, type ShippingModel } from "@/config/store";

export interface ShippingInput {
  /** Cart subtotal in paise (goods only, before shipping/tax). */
  subtotalPaise: number;
  /** Zone id for "zone" model. Ignored by other models. */
  zone?: string;
}

export interface ShippingResult {
  costPaise: number;
  label: string;
  model: ShippingModel;
}

/**
 * Compute shipping cost server-side. NEVER trust a shipping amount sent from
 * the browser — always recompute here from the authoritative subtotal.
 */
export function computeShipping(input: ShippingInput): ShippingResult {
  const { model } = SHIPPING;

  switch (model) {
    case "free":
      return { costPaise: 0, label: "Free shipping", model };

    case "flat":
      return {
        costPaise: SHIPPING.flatRatePaise,
        label: "Standard shipping",
        model,
      };

    case "free_over_threshold":
      if (input.subtotalPaise >= SHIPPING.freeThresholdPaise) {
        return { costPaise: 0, label: "Free shipping", model };
      }
      return {
        costPaise: SHIPPING.flatRatePaise,
        label: "Standard shipping",
        model,
      };

    case "zone": {
      const zoneId = input.zone ?? "rest_of_india";
      const zone = SHIPPING.zones[zoneId] ?? SHIPPING.zones["rest_of_india"];
      return {
        costPaise: zone.ratePaise,
        label: `Shipping — ${zone.label}`,
        model,
      };
    }

    default:
      // Exhaustiveness guard.
      return { costPaise: 0, label: "Shipping", model };
  }
}

/** The shipping options to surface in the checkout UI (only relevant for "zone"). */
export function shippingOptions() {
  if (SHIPPING.model !== "zone") return [];
  return Object.entries(SHIPPING.zones).map(([id, z]) => ({
    id,
    label: z.label,
    ratePaise: z.ratePaise,
  }));
}
