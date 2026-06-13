import Link from "next/link";
import { getProducts } from "@/lib/shopify/storefront";
import type { Product } from "@/lib/shopify/types";
import ProductGrid from "@/components/ProductGrid";
import StoreNotice from "@/components/StoreNotice";

const HERO_WORDS = ["Untamed", "Purity,", "Ancient", "Ayurvedic", "Secrets"];

const USP = [
  "Foraged Botanical Extracts",
  "Cruelty-Free & Wildcrafted",
  "100% Chemical & Toxin Free",
  "Hand-blended in Small Batches",
  "Supporting Tribal Communities",
];

export default async function HomePage() {
  let products: Product[] = [];
  let configured = true;
  try {
    products = await getProducts(8);
  } catch {
    configured = false;
  }

  return (
    <>
      <section className="hero" id="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-tag">Untamed &amp; Organic</span>
            <h1 className="hero-title">
              {HERO_WORDS.map((w, i) => (
                <span key={i} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                  {w}{" "}
                </span>
              ))}
            </h1>
            <p className="hero-description">
              Step into the wild. Handcrafted from raw botanical extracts forged
              in the pesticide-free canopies of the Godavari Belt — preserving
              the earth&rsquo;s untamable healing energy.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn accent">
                Explore the Forest
              </Link>
              <Link href="/about" className="btn ghost">
                Discover Sourcing
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-bg-glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/hero_banner.png"
              alt="Ayurvedic oil resting on a forest root"
              className="hero-image"
              width={500}
              height={500}
            />
          </div>
        </div>
      </section>

      <div className="usp-ribbon">
        <div className="usp-track">
          {[...USP, ...USP].map((item, i) => (
            <div className="usp-item" key={i}>
              <span className="usp-icon">🍃</span> {item}
            </div>
          ))}
        </div>
      </div>

      <section className="section container scroll-fade-in">
        <div className="section-head inline">
          <div>
            <span className="eyebrow">Botanical Alchemy</span>
            <h2>Wild Blends</h2>
          </div>
          <Link href="/shop" style={{ color: "var(--accent-dark)" }}>
            View all →
          </Link>
        </div>
        {configured ? <ProductGrid products={products} /> : <StoreNotice />}
      </section>

      <section className="cta-banner scroll-fade-in">
        <div className="cta-container">
          <h2>Hear the Call of the Wild</h2>
          <p>
            Pure, foraged, hand-blended Ayurvedic care — delivered across India.
          </p>
          <Link href="/shop" className="btn accent">
            Shop Wild Blends
          </Link>
        </div>
      </section>
    </>
  );
}
