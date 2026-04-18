import { Link } from "react-router-dom";
import Carousel from "../components/Carousel/Carousel";
import ProductCard from "../components/ProductCard/ProductCard";
import { products, saleProducts, newProducts } from "../data/products";
import styles from "./Home.module.css";

interface Props {
  onCartAdd: () => void;
}

const BRAND_LOGOS: { name: string; color: string }[] = [
  { name: "Apple", color: "#aaa" },
  { name: "Samsung", color: "#1428A0" },
  { name: "Google", color: "#4285F4" },
  { name: "OnePlus", color: "#F5010C" },
  { name: "Xiaomi", color: "#FF6900" },
  { name: "Sony", color: "#003087" },
  { name: "Nothing", color: "#eee" },
  { name: "Motorola", color: "#5C6BC0" },
];

export default function Home({ onCartAdd }: Props) {
  const topRated = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4);

  return (
    <main style={{ paddingTop: "var(--header-h)" }}>
      {/* Carousel hero */}
      <Carousel />

      {/* Brand strip */}
      <section className={styles.brandStrip}>
        <div className="container">
          <p className={styles.brandLabel}>Authorized reseller of</p>
          <div className={styles.brandScroll}>
            {BRAND_LOGOS.map((b) => (
              <Link
                key={b.name}
                to={`/shop?brand=${b.name}`}
                className={styles.brandChip}
              >
                <span
                  className={styles.brandDot}
                  style={{ background: b.color }}
                />
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              New <span>Arrivals</span>
            </h2>
            <Link to="/shop?new=true" className="section-link">
              View all →
            </Link>
          </div>
          <div className="products-grid">
            {newProducts.slice(0, 4).map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                animDelay={i * 60}
                onAddToCart={onCartAdd}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature banners */}
      <section className={styles.banners}>
        <div className="container">
          <div className={styles.bannerGrid}>
            <div
              className={`${styles.banner} ${styles.bannerLarge}`}
              style={{
                background: "linear-gradient(135deg, #0d1b3e, #0d2b3e)",
              }}
            >
              <div className={styles.bannerContent}>
                <span className="badge badge-sale">UP TO 20% OFF</span>
                <h3>Galaxy S25 Series</h3>
                <p>Snapdragon 8 Elite · Galaxy AI</p>
                <Link to="/shop?brand=Samsung" className="btn-primary">
                  Shop Samsung →
                </Link>
              </div>
              <div
                className={styles.bannerGlow}
                style={{
                  background:
                    "radial-gradient(ellipse, #00d8ff22, transparent 70%)",
                }}
              />
            </div>

            <div
              className={`${styles.banner} ${styles.bannerSmall}`}
              style={{
                background: "linear-gradient(135deg, #1a0a0a, #2a1218)",
              }}
            >
              <div className={styles.bannerContent}>
                <span className="badge badge-new">NEW</span>
                <h3>Pixel 9 Pro</h3>
                <p>Gemini AI inside</p>
                <Link to="/product/pixel-9-pro" className="btn-ghost">
                  Explore →
                </Link>
              </div>
              <div
                className={styles.bannerGlow}
                style={{
                  background:
                    "radial-gradient(ellipse, #00e69922, transparent 70%)",
                }}
              />
            </div>

            <div
              className={`${styles.banner} ${styles.bannerSmall}`}
              style={{
                background: "linear-gradient(135deg, #0a0a1a, #1a1228)",
              }}
            >
              <div className={styles.bannerContent}>
                <span className="badge badge-flagship">FLAGSHIP</span>
                <h3>iPhone 16 Pro Max</h3>
                <p>Titanium · A18 Pro</p>
                <Link to="/product/iphone-16-pro-max" className="btn-ghost">
                  Explore →
                </Link>
              </div>
              <div
                className={styles.bannerGlow}
                style={{
                  background:
                    "radial-gradient(ellipse, #f5c84222, transparent 70%)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Top rated */}
      <section className={styles.section}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Top <span>Rated</span>
            </h2>
            <Link to="/shop?sort=rating" className="section-link">
              See all →
            </Link>
          </div>
          <div className="products-grid">
            {topRated.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                animDelay={i * 60}
                onAddToCart={onCartAdd}
              />
            ))}
          </div>
        </div>
      </section>

      {/* On Sale */}
      {saleProducts.length > 0 && (
        <section className={`${styles.section} ${styles.saleSection}`}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                🔥 On <span>Sale</span>
              </h2>
              <Link to="/shop?sale=true" className="section-link">
                All deals →
              </Link>
            </div>
            <div className="products-grid">
              {saleProducts.slice(0, 4).map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  animDelay={i * 60}
                  onAddToCart={onCartAdd}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust badges */}
      <section className={styles.trust}>
        <div className="container">
          <div className={styles.trustGrid}>
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                sub: "On all orders worldwide",
              },
              {
                icon: "🔒",
                title: "Secure Payment",
                sub: "SSL encrypted checkout",
              },
              {
                icon: "↩️",
                title: "30-Day Returns",
                sub: "Hassle-free returns",
              },
              {
                icon: "✅",
                title: "2-Year Warranty",
                sub: "Full manufacturer warranty",
              },
            ].map((t) => (
              <div key={t.title} className={styles.trustItem}>
                <span className={styles.trustIcon}>{t.icon}</span>
                <div>
                  <h4 className={styles.trustTitle}>{t.title}</h4>
                  <p className={styles.trustSub}>{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
