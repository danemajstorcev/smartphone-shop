import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useCompare } from '../../context/CompareContext';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
  onAddToCart?: () => void;
  animDelay?: number;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? '#ffb300' : 'none'}
          stroke={i <= Math.round(rating) ? '#ffb300' : '#5a5a8a'}
          strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function ProductCard({ product, onAddToCart, animDelay = 0 }: Props) {
  const { addItem, isInCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCompare, isInCompare, isFull } = useCompare();
  const navigate = useNavigate();
  const inCompare = isInCompare(product.id);
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const inCart = isInCart(product.id);
  const fav = isFavorite(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem(product, product.colors[0]);
    onAddToCart?.();
    setTimeout(() => setAdding(false), 900);
  }

  function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  }

  return (
    <div className={styles.card} style={{ animationDelay: `${animDelay}ms` }}>
      <Link to={`/product/${product.id}`} className={styles.imageLink}>
        <div className={styles.imageWrap}>
          {imgError ? (
            <div className={styles.imgFallback}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
                <rect x="5" y="2" width="14" height="20" rx="3"/>
                <circle cx="12" cy="17" r="1"/>
              </svg>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className={styles.image}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          )}

          {/* Badges */}
          <div className={styles.badges}>
            {product.isNew && <span className={`badge badge-new ${styles.badge}`}>New</span>}
            {discount && <span className={`badge badge-sale ${styles.badge}`}>−{discount}%</span>}
          </div>

          {/* Favorite button */}
          <button
            className={`${styles.favBtn} ${fav ? styles.favActive : ''}`}
            onClick={handleFav}
            aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={fav ? 'var(--danger)' : 'none'}
              stroke={fav ? 'var(--danger)' : 'currentColor'}
              strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
      </Link>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.brand}>{product.brand}</span>
          <span className={`badge ${product.type === 'flagship' ? 'badge-flagship' : ''} ${styles.typeBadge}`}>
            {product.type}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        <div className={styles.ratingRow}>
          <Stars rating={product.rating} />
          <span className={styles.ratingVal}>{product.rating.toFixed(1)}</span>
          <span className={styles.reviewCount}>({product.reviewCount.toLocaleString()})</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={styles.oldPrice}>${product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Color swatches */}
        <div className={styles.colors}>
          {product.colors.slice(0, 5).map(c => (
            <span key={c} className={styles.swatch} style={{ background: c }} title={c} />
          ))}
        </div>

        <div className={styles.cardActions}>
        <button
          className={`${styles.addBtn} ${inCart ? styles.addBtnActive : ''} ${adding ? styles.adding : ''}`}
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {!product.inStock ? (
            'Out of Stock'
          ) : adding ? (
            <>
              <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Added!
            </>
          ) : inCart ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              In Cart
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add to Cart
            </>
          )}
        </button>
        <button
          className={`${styles.compareBtn} ${inCompare ? styles.compareBtnActive : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (inCompare) { navigate('/compare'); } else { addToCompare(product); navigate('/compare'); } }}
          disabled={!inCompare && isFull}
          title={inCompare ? 'View comparison' : isFull ? 'Comparison full (max 4)' : 'Add to compare'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="8" height="18" rx="1"/>
            <rect x="14" y="3" width="8" height="18" rx="1"/>
          </svg>
          <span>{inCompare ? 'In Compare' : 'Compare'}</span>
        </button>
        </div>
      </div>
    </div>
  );
}
