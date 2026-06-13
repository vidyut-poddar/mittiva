import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/storefront";
import type { Product } from "@/lib/shopify/types";
import ShopByConcern from "@/components/ShopByConcern";
import StoreNotice from "@/components/StoreNotice";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  let products: Product[] = [];
  let configured = true;
  try {
    products = await getProducts(50);
  } catch {
    configured = false;
  }

  return (
    <section className="container" style={{ padding: "11rem 0 6rem" }}>
      <div className="section-head">
        <span className="eyebrow">Botanical Alchemy</span>
        <h2>Shop the Wild</h2>
        <p>
          Raw ingredients, packed with ancient vitality — sustainably harvested
          from the wild floor of the forest.
        </p>
      </div>
      {configured ? <ShopByConcern products={products} /> : <StoreNotice />}
    </section>
  );
}
