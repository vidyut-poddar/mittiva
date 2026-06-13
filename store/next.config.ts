import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Shopify serves product images from its CDN.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
