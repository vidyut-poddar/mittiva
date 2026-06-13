import type { Metadata } from "next";

export const metadata: Metadata = { title: "Forest Secrets" };

export default function AboutPage() {
  return (
    <div className="layout-narrow">
      <span className="eyebrow" style={{ color: "var(--accent-dark)", letterSpacing: 3, textTransform: "uppercase", fontSize: "0.82rem", fontWeight: 700 }}>
        Deep Forest Foraging
      </span>
      <h1 style={{ fontSize: "3rem", fontStyle: "italic", margin: "0.6rem 0 1.4rem" }}>
        Secrets of the Godavari Wilderness
      </h1>
      <p style={{ color: "var(--text-light)", fontSize: "1.15rem" }}>
        Our botanical actives are harvested directly from the unpolluted, dense
        canopies of the Godavari Belt. Collaborating with local Girijan tribal
        corporations, we responsibly forage herbs at their seasonal peaks, when
        nature&rsquo;s healing elements are most potent.
      </p>
      <p style={{ color: "var(--text-light)", marginTop: "1rem" }}>
        We respect the ancient patterns of the forest — formulating in precise
        ratios passed down through generations to create products that are wild
        by nature, yet gentle on modern skin.
      </p>
    </div>
  );
}
