"use client";

import { useMemo, useState } from "react";
import ProductGrid from "./ProductGrid";
import type { Product } from "@/lib/shopify/types";
import { CONCERN_TAG_PREFIX } from "@/config/store";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const prefix = CONCERN_TAG_PREFIX.toLowerCase();

/** A tag counts as a concern if it matches the configured prefix (or always,
 *  when the prefix is empty). Returns the display label, or null if excluded. */
function concernLabel(tag: string): string | null {
  if (!prefix) return tag.trim() || null;
  if (!tag.toLowerCase().startsWith(prefix)) return null;
  const label = tag.slice(CONCERN_TAG_PREFIX.length).trim();
  return label || null;
}

export default function ShopByConcern({ products }: { products: Product[] }) {
  // Build the unique set of concerns from all product tags.
  const concerns = useMemo(() => {
    const map = new Map<string, string>(); // slug -> label
    for (const p of products) {
      for (const tag of p.tags) {
        const label = concernLabel(tag);
        if (label) map.set(slugify(label), label);
      }
    }
    return Array.from(map, ([slug, label]) => ({ slug, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [products]);

  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return products;
    return products.filter((p) =>
      p.tags.some((tag) => {
        const label = concernLabel(tag);
        return label !== null && slugify(label) === active;
      })
    );
  }, [active, products]);

  // No tags anywhere → just show the grid, no filter bar.
  if (concerns.length === 0) return <ProductGrid products={products} />;

  return (
    <>
      <div className="concern-filters">
        <button
          className={`filter-btn${active === null ? " active" : ""}`}
          onClick={() => setActive(null)}
        >
          All
        </button>
        {concerns.map((c) => (
          <button
            key={c.slug}
            className={`filter-btn${active === c.slug ? " active" : ""}`}
            onClick={() => setActive(c.slug)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} />
      ) : (
        <div className="empty">
          <h2>Nothing here yet</h2>
          <p>No products match this concern right now.</p>
        </div>
      )}
    </>
  );
}
