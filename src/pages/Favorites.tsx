import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";
import ProductCard from "../components/ProductCard/ProductCard";
import styles from "./Favorites.module.css";

interface Props {
  onCartAdd: () => void;
}

export default function Favorites({ onCartAdd }: Props) {
  const { favoriteProducts } = useFavorites();

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Your <span>Favorites</span>
            </h1>
            <p className={styles.sub}>
              {favoriteProducts.length} saved phone
              {favoriteProducts.length !== 1 ? "s" : ""}
            </p>
          </div>
          {favoriteProducts.length > 0 && (
            <Link to="/shop" className="btn-ghost">
              Browse more →
            </Link>
          )}
        </div>

        {favoriteProducts.length === 0 ? (
          <div className={styles.empty}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3>No favorites yet</h3>
            <p>Tap the heart icon on any phone to save it here.</p>
            <Link to="/shop" className="btn-primary">
              Explore Phones
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {favoriteProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                animDelay={i * 60}
                onAddToCart={onCartAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
