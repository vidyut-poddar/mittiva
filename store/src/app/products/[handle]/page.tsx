import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/shopify/storefront";
import ProductDetail from "@/components/ProductDetail";
import StoreNotice from "@/components/StoreNotice";

type Params = { handle: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  try {
    const product = await getProduct(handle);
    if (!product) return { title: "Not found" };
    return {
      title: product.title,
      description: product.description?.slice(0, 160),
      openGraph: {
        title: product.title,
        images: product.featuredImage ? [product.featuredImage.url] : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { handle } = await params;

  let product;
  try {
    product = await getProduct(handle);
  } catch {
    return <StoreNotice />;
  }

  if (!product) notFound();
  return <ProductDetail product={product} />;
}
