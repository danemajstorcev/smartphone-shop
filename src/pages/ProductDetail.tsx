import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard/ProductCard";
import styles from "./ProductDetail.module.css";

interface Props {
  onCartAdd: () => void;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#ffb300" : "none"}
          stroke={i <= Math.round(rating) ? "#ffb300" : "#5a5a8a"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductDetail({ onCartAdd }: Props) {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCompare, isInCompare } = useCompare();
  const inCompare = product ? isInCompare(product.id) : false;

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? "");
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [adding, setAdding] = useState(false);

  if (!product) {
    return (
      <div className={`page-wrapper ${styles.notFound}`}>
        <div className="container">
          <h2>Product not found</h2>
          <button className="btn-primary" onClick={() => navigate("/shop")}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const inCart = isInCart(product.id);
  const fav = isFavorite(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const related = products
    .filter((p) => p.brand === product.brand && p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    setAdding(true);
    addItem(product!, selectedColor);
    onCartAdd();
    setTimeout(() => setAdding(false), 900);
  }

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <Link to={`/shop?brand=${product.brand}`}>{product.brand}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className={styles.layout}>
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              <img
                src={product.images[activeImg] ?? product.image}
                alt={product.name}
              />
              {product.isNew && (
                <span className={`badge badge-new ${styles.galleryBadge}`}>
                  New
                </span>
              )}
              {discount && (
                <span className={`badge badge-sale ${styles.galleryBadgeSale}`}>
                  −{discount}%
                </span>
              )}
            </div>
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles.infoTop}>
              <Link
                to={`/shop?brand=${product.brand}`}
                className={styles.brand}
              >
                {product.brand}
              </Link>
              <span
                className={`badge ${product.type === "flagship" ? "badge-flagship" : ""}`}
                style={
                  product.type !== "flagship"
                    ? {
                        background: "var(--surface)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }
                    : {}
                }
              >
                {product.type}
              </span>
            </div>

            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.desc}>{product.shortDescription}</p>

            <div className={styles.ratingRow}>
              <Stars rating={product.rating} />
              <span className={styles.ratingNum}>
                {product.rating.toFixed(1)}
              </span>
              <span className={styles.reviewCount}>
                ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className={styles.originalPrice}>
                    ${product.originalPrice.toLocaleString()}
                  </span>
                  <span className={`badge badge-sale`}>
                    Save $
                    {(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <div className={styles.colorPicker}>
              <p className={styles.pickerLabel}>
                Color:{" "}
                <span style={{ color: selectedColor }}>{selectedColor}</span>
              </p>
              <div className={styles.colorSwatches}>
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`${styles.colorBtn} ${c === selectedColor ? styles.colorBtnActive : ""}`}
                    style={{ background: c }}
                    onClick={() => setSelectedColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className={styles.availability}>
              {product.inStock ? (
                <span className={styles.inStock}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  In Stock — Ships in 1-2 business days
                </span>
              ) : (
                <span className={styles.outStock}>Out of Stock</span>
              )}
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.addBtn} ${inCart ? styles.addBtnCart : ""} ${adding ? styles.addBtnAdding : ""}`}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {adding ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added to Cart!
                  </>
                ) : inCart ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    In Cart — Add Again
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>

              <button
                className={`${styles.favBtn} ${fav ? styles.favBtnActive : ""}`}
                onClick={() => toggleFavorite(product.id)}
                aria-label={fav ? "Remove from favorites" : "Save to favorites"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={fav ? "var(--danger)" : "none"}
                  stroke={fav ? "var(--danger)" : "currentColor"}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              <Link
                to="/compare"
                className={`${styles.compareBtn} ${inCompare ? styles.compareBtnActive : ""}`}
                onClick={() => {
                  if (!inCompare) addToCompare(product!);
                }}
                title="Compare phones"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="8" height="18" rx="1" />
                  <rect x="14" y="3" width="8" height="18" rx="1" />
                </svg>
                {inCompare ? "In Compare →" : "Compare"}
              </Link>
            </div>

            <div className={styles.deliveryBadges}>
              {["🚚 Free Shipping", "🔒 Secure Pay", "↩️ 30-Day Return"].map(
                (b) => (
                  <span key={b} className={styles.deliveryBadge}>
                    {b}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <div className={styles.tabBtns}>
            {(["specs", "reviews"] as const).map((t) => (
              <button
                key={t}
                className={`${styles.tabBtn} ${activeTab === t ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(t)}
              >
                {t === "specs" ? "Specifications" : "Reviews"}
              </button>
            ))}
          </div>

          {activeTab === "specs" && (
            <div className={styles.specGrid}>
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className={styles.specRow}>
                  <span className={styles.specKey}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className={styles.specVal}>{val}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className={styles.reviewsPanel}>
              <div className={styles.reviewSummary}>
                <div className={styles.reviewScore}>
                  <span className={styles.bigScore}>
                    {product.rating.toFixed(1)}
                  </span>
                  <Stars rating={product.rating} />
                  <span className={styles.reviewTotal}>
                    {product.reviewCount.toLocaleString()} reviews
                  </span>
                </div>
                <div className={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((n) => {
                    const pct =
                      n === 5
                        ? 68
                        : n === 4
                          ? 20
                          : n === 3
                            ? 7
                            : n === 2
                              ? 3
                              : 2;
                    return (
                      <div key={n} className={styles.ratingBarRow}>
                        <span className={styles.ratingBarNum}>{n}</span>
                        <div className={styles.ratingBarTrack}>
                          <div
                            className={styles.ratingBarFill}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={styles.ratingBarPct}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {[
                {
                  name: "Alex M.",
                  score: 5,
                  date: "3 days ago",
                  text: "Absolutely stunning device. The camera blows everything else out of the water. Battery easily lasts a full day. Worth every penny.",
                },
                {
                  name: "Sarah K.",
                  score: 4,
                  date: "1 week ago",
                  text: "Premium build quality and blazing fast performance. Runs everything I throw at it without breaking a sweat. Minor complaint: charging brick not included.",
                },
                {
                  name: "James T.",
                  score: 5,
                  date: "2 weeks ago",
                  text: "Best phone I've ever owned. Display is incredible, speakers are loud, and the AI features are actually useful in everyday life.",
                },
              ].map((r, i) => (
                <div key={i} className={styles.reviewCard}>
                  <div className={styles.reviewHead}>
                    <div className={styles.reviewAvatar}>{r.name[0]}</div>
                    <div>
                      <span className={styles.reviewName}>{r.name}</span>
                      <span className={styles.reviewDate}>{r.date}</span>
                    </div>
                    <div className={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <svg
                          key={n}
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill={n <= r.score ? "#ffb300" : "none"}
                          stroke={n <= r.score ? "#ffb300" : "#5a5a8a"}
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <div className="section-header">
              <h2 className="section-title">
                More from <span>{product.brand}</span>
              </h2>
              <Link
                to={`/shop?brand=${product.brand}`}
                className="section-link"
              >
                All {product.brand} →
              </Link>
            </div>
            <div className="products-grid">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  animDelay={i * 60}
                  onAddToCart={onCartAdd}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
