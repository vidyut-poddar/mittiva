import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.gohighlevel.com https://*.leadconnectorhq.com https://gohighlevel.com https://leadconnectorhq.com https://app.gohighlevel.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
