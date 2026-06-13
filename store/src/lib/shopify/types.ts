/** Normalised shapes the rest of the app uses (flattened from Shopify edges). */

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ProductOption {
  id: string;
  name: string; // e.g. "Size", "Colour"
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  selectedOptions: SelectedOption[];
  price: Money;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  images: ProductImage[];
  options: ProductOption[];
  minPrice: Money;
  variants: ProductVariant[];
}

export interface CartLine {
  id: string;
  quantity: number;
  variantId: string;
  variantTitle: string;
  productTitle: string;
  productHandle: string;
  image: ProductImage | null;
  price: Money;
  selectedOptions: SelectedOption[];
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: Money;
  total: Money;
  lines: CartLine[];
}
