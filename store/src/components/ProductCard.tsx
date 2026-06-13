import Link from "next/link";
import type { Product } from "@/lib/shopify/types";
import { formatPaise, toPaise } from "@/lib/money";

export default function ProductCard({ product }: { product: Product }) {
  const img = product.featuredImage;
  return (
    <Link href={`/products/${product.handle}`} className="card">
      <div className="imgwrap">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={img.altText ?? product.title} loading="lazy" />
        ) : null}
      </div>
      <div className="body">
        <h3 className="title">{product.title}</h3>
        <div className="price">{formatPaise(toPaise(product.minPrice.amount))}</div>
        {!product.availableForSale && <div className="soldout">Sold out</div>}
      </div>
    </Link>
  );
}
