import { ProductGridSkeleton } from "@/components/ProductGrid";

export default function ShopLoading() {
  return (
    <section className="container" style={{ padding: "48px 24px 80px" }}>
      <div className="section-head">
        <h2>The Collection</h2>
      </div>
      <ProductGridSkeleton n={8} />
    </section>
  );
}
