import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { products } from '../../data/products';
import styles from './Carousel.module.css';

const SLIDES = [
  {
    product: products.find(p => p.id === 'galaxy-s25-ultra')!,
    headline: 'Reign Supreme',
    sub: '200MP · S Pen · Snapdragon 8 Elite',
    gradient: 'linear-gradient(135deg, #0d1b3e 0%, #1a1a3a 50%, #0d2b3e 100%)',
    accent: '#00d8ff',
    tag: 'NEW',
  },
  {
    product: products.find(p => p.id === 'iphone-16-pro-max')!,
    headline: 'Beyond Pro',
    sub: 'A18 Pro · 5× Telephoto · Camera Control',
    gradient: 'linear-gradient(135deg, #1a1206 0%, #2a1f08 50%, #0d1a0d 100%)',
    accent: '#f5c842',
    tag: 'SAVE $100',
  },
  {
    product: products.find(p => p.id === 'pixel-9-pro')!,
    headline: 'AI. Redefined.',
    sub: 'Gemini Built-In · Tensor G4 · Night Sight Pro',
    gradient: 'linear-gradient(135deg, #0a1a0a 0%, #1a2e1a 50%, #0a1428 100%)',
    accent: '#00e699',
    tag: 'SAVE $100',
  },
  {
    product: products.find(p => p.id === 'samsung-galaxy-fold-6')!,
    headline: 'Unfold Everything',
    sub: '7.6" Inner Display · Galaxy AI · One UI 6',
    gradient: 'linear-gradient(135deg, #1a0d2e 0%, #2a1a3e 50%, #0d1428 100%)',
    accent: '#c77dff',
    tag: 'SAVE $200',
  },
].filter(s => s.product);

const INTERVAL = 5200;

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const { addItem } = useCart();

  const go = useCallback((idx: number, dir: 'next' | 'prev' = 'next') => {
    setAnimDir(dir);
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go((current + 1) % SLIDES.length, 'next'), INTERVAL);
    return () => clearInterval(t);
  }, [current, paused, go]);

  const slide = SLIDES[current];
  if (!slide) return null;

  const discount = slide.product.originalPrice
    ? Math.round((1 - slide.product.price / slide.product.originalPrice) * 100)
    : null;

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        className={`${styles.bg} ${animDir === 'next' ? styles.slideNext : styles.slidePrev}`}
        key={current}
        style={{ background: slide.gradient }}
      />

      {/* Grid overlay */}
      <div className={styles.gridOverlay} />

      {/* Glow */}
      <div className={styles.glow} style={{ background: `radial-gradient(ellipse at 70% 50%, ${slide.accent}22 0%, transparent 65%)` }} />

      <div className={`container ${styles.content}`}>
        <div className={styles.text} key={`text-${current}`}>
          <div className={styles.tag} style={{ color: slide.accent, borderColor: slide.accent + '44', background: slide.accent + '18' }}>
            {slide.tag}
          </div>
          <h1 className={styles.headline}>{slide.headline}</h1>
          <p className={styles.sub}>{slide.sub}</p>

          <div className={styles.priceRow}>
            <span className={styles.price} style={{ color: slide.accent }}>
              ${slide.product.price.toLocaleString()}
            </span>
            {slide.product.originalPrice && (
              <>
                <span className={styles.originalPrice}>${slide.product.originalPrice.toLocaleString()}</span>
                <span className={styles.discBadge}>−{discount}%</span>
              </>
            )}
          </div>

          <div className={styles.ctas}>
            <button
              className={styles.ctaPrimary}
              style={{ background: slide.accent, color: slide.accent === '#f5c842' || slide.accent === '#c77dff' ? '#000' : '#000' }}
              onClick={() => addItem(slide.product, slide.product.colors[0])}
            >
              Add to Cart
            </button>
            <Link to={`/product/${slide.product.id}`} className={styles.ctaGhost}>
              Learn More →
            </Link>
          </div>
        </div>

        <div className={styles.imageWrap} key={`img-${current}`}>
          <div className={styles.imageBg} style={{ background: slide.accent + '12' }} />
          <img
            src={slide.product.image}
            alt={slide.product.name}
            className={styles.image}
          />
          <div className={styles.imageGlow} style={{ background: `radial-gradient(ellipse, ${slide.accent}30 0%, transparent 70%)` }} />
        </div>
      </div>

      {/* Controls */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => go(current - 1, 'prev')} aria-label="Previous">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => go(current + 1, 'next')} aria-label="Next">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            style={i === current ? { background: slide.accent } : {}}
            onClick={() => go(i, i > current ? 'next' : 'prev')}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className={styles.progress} key={`prog-${current}`}>
          <div className={styles.progressBar} style={{ '--duration': `${INTERVAL}ms`, '--color': slide.accent } as React.CSSProperties} />
        </div>
      )}
    </section>
  );
}
