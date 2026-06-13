"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { formatPaise, toPaise } from "@/lib/money";
import { useCart } from "@/context/CartContext";

/** Find the variant matching a full set of selected options. */
function matchVariant(
  variants: ProductVariant[],
  selected: Record<string, string>
): ProductVariant | null {
  return (
    variants.find((v) =>
      v.selectedOptions.every((o) => selected[o.name] === o.value)
    ) ?? null
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();

  // Default selection: first value of each option.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const opt of product.options) init[opt.name] = opt.values[0];
    return init;
  });
  const [activeImg, setActiveImg] = useState(0);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );

  const currentVariant = useMemo(
    () => matchVariant(product.variants, selected),
    [product.variants, selected]
  );

  // For a given option + candidate value, is there ANY in-stock variant that
  // matches the candidate plus the other currently-selected options?
  function valueAvailable(optionName: string, value: string): boolean {
    const trial = { ...selected, [optionName]: value };
    const v = matchVariant(product.variants, trial);
    return Boolean(v && v.availableForSale);
  }

  const images = product.images.length
    ? product.images
    : product.featuredImage
    ? [product.featuredImage]
    : [];

  const priceVariant = currentVariant ?? product.variants[0];
  const inStock = currentVariant?.availableForSale ?? false;

  async function handleAdd() {
    if (!currentVariant) {
      setMsg({ type: "error", text: "That combination isn't available." });
      return;
    }
    setAdding(true);
    setMsg(null);
    try {
      await addItem(currentVariant.id, 1);
      setMsg({ type: "ok", text: "Added to your cart." });
    } catch {
      setMsg({ type: "error", text: "Couldn't add to cart. Please try again." });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container pdp">
      <div className="gallery">
        <div className="main">
          {images[activeImg] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[activeImg].url}
              alt={images[activeImg].altText ?? product.title}
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((img, i) => (
              <button
                key={img.url}
                className={i === activeImg ? "active" : ""}
                onClick={() => setActiveImg(i)}
                aria-label={`View image ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.altText ?? ""} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="info">
        <h1>{product.title}</h1>
        <p className="price-lg">
          {formatPaise(toPaise(priceVariant?.price.amount ?? product.minPrice.amount))}
        </p>

        {/* One control group per option — size and colour chosen separately. */}
        {product.options.map((opt) => (
          <div key={opt.id} className="option-group">
            <div className="label">{opt.name}</div>
            <div className="swatches">
              {opt.values.map((val) => {
                const isSelected = selected[opt.name] === val;
                const available = valueAvailable(opt.name, val);
                return (
                  <button
                    key={val}
                    className={`swatch${isSelected ? " selected" : ""}${
                      !available ? " disabled" : ""
                    }`}
                    disabled={!available}
                    onClick={() =>
                      setSelected((s) => ({ ...s, [opt.name]: val }))
                    }
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {msg && <div className={`banner ${msg.type}`}>{msg.text}</div>}

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            className="btn"
            onClick={handleAdd}
            disabled={adding || !inStock}
          >
            {adding && <span className="spinner" />}
            {inStock ? "Add to cart" : "Sold out"}
          </button>
          <button className="btn ghost" onClick={() => router.push("/cart")}>
            View cart
          </button>
        </div>

        {product.descriptionHtml ? (
          <div
            className="desc"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <p className="desc">{product.description}</p>
        )}
      </div>
    </div>
  );
}
