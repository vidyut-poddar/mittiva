import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Ambient, { ScrollReveal } from "@/components/Ambient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jeevi Herbals — Untamed Purity & Wild Ayurvedic Care",
    template: "%s · Jeevi Herbals",
  },
  description:
    "Enter the wilderness of natural beauty. Handcrafted hair care, skincare, and bath products from pure botanical extracts, forged from the Godavari Belt forests.",
  openGraph: {
    title: "Jeevi Herbals — Untamed Purity & Wild Ayurvedic Care",
    description:
      "Handcrafted, wildcrafted Ayurvedic care from the Godavari Belt forests. Shipped across India.",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Ambient />
        <ScrollReveal />
        <CartProvider>
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
