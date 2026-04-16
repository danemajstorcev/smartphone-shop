import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="2" width="14" height="20" rx="3" stroke="var(--accent)" strokeWidth="1.8"/>
              <circle cx="12" cy="17.5" r="1.2" fill="var(--accent)"/>
            </svg>
            <span>Nex<strong>Phone</strong></span>
          </div>
          <p className={styles.tagline}>Premium smartphones, delivered worldwide.</p>
          <div className={styles.socials}>
            {['Twitter', 'Instagram', 'YouTube'].map(s => (
              <a key={s} href="#" className={styles.social} aria-label={s}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect width="24" height="24" rx="12" fill="rgba(255,255,255,0.06)"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Shop</h4>
            <Link to="/shop">All Phones</Link>
            <Link to="/compare">Compare</Link>
            <Link to="/shop?type=flagship">Flagship</Link>
            <Link to="/shop?type=mid-range">Mid-Range</Link>
            <Link to="/shop?type=budget">Budget</Link>
          </div>
          <div className={styles.col}>
            <h4>Brands</h4>
            <Link to="/shop?brand=Apple">Apple</Link>
            <Link to="/shop?brand=Samsung">Samsung</Link>
            <Link to="/shop?brand=Google">Google</Link>
            <Link to="/shop?brand=OnePlus">OnePlus</Link>
          </div>
          <div className={styles.col}>
            <h4>Support</h4>
            <a href="#">FAQ</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">Warranty</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <span>© {new Date().getFullYear()} NexPhone. All rights reserved.</span>
          <div className={styles.legal}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
