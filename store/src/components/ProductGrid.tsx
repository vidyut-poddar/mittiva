import type { Product } from "@/lib/shopify/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="empty">
        <h2>Nothing here yet</h2>
        <p>New pieces are on the way. Check back soon.</p>
      </div>
    );
  }
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card">
          <div className="skeleton sk-card" />
          <div className="body">
            <div className="skeleton" style={{ height: 16, width: "70%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "40%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
