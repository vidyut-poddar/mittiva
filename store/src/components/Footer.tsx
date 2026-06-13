import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="Jeevi Herbals" />
          <p>
            Uncompromising organic purity — sustainably forged in unison with
            native forest gatherers of the Godavari Belt, bringing the untamed
            wisdom of Ayurveda to your daily ritual.
          </p>
        </div>
        <div className="footer-col">
          <h4>Jungle Path</h4>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop the Wild</Link>
          <Link href="/about">Forest Secrets</Link>
          <Link href="/cart">Cart</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>Jeeviherbalproducts@gmail.com</p>
          <p>+91 7358561166</p>
          <p>Anna Nagar, Chennai 600040</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Jeevi Herbals. All rights reserved.</span>
        <span>Designed with untamed care · Shipped across India</span>
      </div>
    </footer>
  );
}
