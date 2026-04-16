import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { products } from '../../data/products';
import { Product } from '../../types';
import styles from './Header.module.css';

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const { totalItems } = useCart();
  const { favoriteIds } = useFavorites();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const q = query.toLowerCase();
    setResults(
      products
        .filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
        )
        .slice(0, 6)
    );
  }, [query]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  function handleSelect(p: Product) {
    setQuery('');
    setResults([]);
    navigate(`/product/${p.id}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setQuery(''); setResults([]); inputRef.current?.blur(); }
    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/favorites', label: 'Favorites' },
    { to: '/compare', label: 'Compare' },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="12" cy="17.5" r="1.2" fill="currentColor"/>
            </svg>
          </span>
          <span>Nex<strong>Phone</strong></span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`${styles.navLink} ${location.pathname === l.to ? styles.active : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <div className={styles.searchWrap}>
          <div className={`${styles.searchBox} ${focused ? styles.searchFocused : ''}`}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search phones…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              onKeyDown={handleKeyDown}
              className={styles.searchInput}
            />
            {query && (
              <button className={styles.clearBtn} onClick={() => { setQuery(''); setResults([]); }}>
                ×
              </button>
            )}
          </div>

          {focused && results.length > 0 && (
            <div className={styles.dropdown}>
              {results.map(p => (
                <button key={p.id} className={styles.dropItem} onMouseDown={() => handleSelect(p)}>
                  <img src={p.image} alt={p.name} className={styles.dropImg} />
                  <div className={styles.dropInfo}>
                    <span className={styles.dropName}>{p.name}</span>
                    <span className={styles.dropBrand}>{p.brand} · {p.type}</span>
                  </div>
                  <span className={styles.dropPrice}>${p.price}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Link to="/favorites" className={styles.iconBtn} aria-label="Favorites">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={favoriteIds.size > 0 ? 'var(--danger)' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {favoriteIds.size > 0 && <span className={styles.badge}>{favoriteIds.size}</span>}
          </Link>

          <button className={styles.cartBtn} onClick={onCartClick} aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
          </button>

          {/* Mobile menu toggle */}
          <button className={styles.menuBtn} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={styles.mobileLink}>{l.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}
