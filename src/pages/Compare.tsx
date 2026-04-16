import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import { Product } from '../types';
import styles from './Compare.module.css';

interface Props {
  onCartAdd: () => void;
}

/* ─── Spec row definitions ──────────────────────────────────────── */
type SpecRow = {
  label: string;
  key: keyof Product['specs'];
  category: string;
  higherIsBetter?: boolean;
  unit?: string;
};

const SPEC_ROWS: SpecRow[] = [
  { label: 'Display',    key: 'display',   category: 'Display' },
  { label: 'Processor',  key: 'processor', category: 'Performance' },
  { label: 'RAM',        key: 'ram',       category: 'Performance', higherIsBetter: true },
  { label: 'Storage',    key: 'storage',   category: 'Performance', higherIsBetter: true },
  { label: 'Camera',     key: 'camera',    category: 'Camera' },
  { label: 'Battery',    key: 'battery',   category: 'Battery', higherIsBetter: true },
  { label: 'OS',         key: 'os',        category: 'Software' },
];

/* ─── Extra product-level fields to compare ───────────────────── */
type ExtraRow = {
  label: string;
  category: string;
  render: (p: Product) => React.ReactNode;
  rawValue?: (p: Product) => number;
};

const EXTRA_ROWS: ExtraRow[] = [
  {
    label: 'Price',
    category: 'Price',
    render: (p) => (
      <span className={styles.priceCell}>
        <span className={styles.priceBig}>${p.price.toLocaleString()}</span>
        {p.originalPrice && (
          <span className={styles.priceOld}>${p.originalPrice.toLocaleString()}</span>
        )}
      </span>
    ),
    rawValue: (p) => p.price,
  },
  {
    label: 'Rating',
    category: 'Score',
    render: (p) => (
      <span className={styles.ratingCell}>
        <span className={styles.ratingStars}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="12" height="12" viewBox="0 0 24 24"
              fill={i <= Math.round(p.rating) ? '#ffb300' : 'none'}
              stroke={i <= Math.round(p.rating) ? '#ffb300' : '#5a5a8a'} strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
        </span>
        <span className={styles.ratingNum}>{p.rating.toFixed(1)}</span>
        <span className={styles.ratingCount}>({p.reviewCount.toLocaleString()})</span>
      </span>
    ),
    rawValue: (p) => p.rating,
  },
  {
    label: 'Brand',
    category: 'Overview',
    render: (p) => <span className={styles.brandCell}>{p.brand}</span>,
  },
  {
    label: 'Category',
    category: 'Overview',
    render: (p) => (
      <span className={`${styles.typeChip} ${p.type === 'flagship' ? styles.flagship : p.type === 'mid-range' ? styles.midrange : styles.budget}`}>
        {p.type}
      </span>
    ),
  },
  {
    label: 'In Stock',
    category: 'Overview',
    render: (p) => (
      <span className={p.inStock ? styles.inStock : styles.outStock}>
        {p.inStock ? '✓ Available' : '✗ Out of Stock'}
      </span>
    ),
    rawValue: (p) => p.inStock ? 1 : 0,
  },
];

const ALL_CATEGORIES = ['Overview', 'Price', 'Score', 'Display', 'Performance', 'Camera', 'Battery', 'Software'];

/* ─── Parse numeric value from RAM/Battery for winner detection ── */
function parseNumeric(val: string): number {
  const m = val.match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function winnerForSpec(key: SpecRow['key'], products: Product[], higherIsBetter?: boolean): Set<string> {
  if (!higherIsBetter || products.length < 2) return new Set();
  const values = products.map(p => parseNumeric(p.specs[key]));
  const best = Math.max(...values);
  if (values.filter(v => v === best).length === products.length) return new Set();
  return new Set(products.filter(p => parseNumeric(p.specs[key]) === best).map(p => p.id));
}

function winnerForExtra(row: ExtraRow, prods: Product[], lowerIsBetter = false): Set<string> {
  if (!row.rawValue || prods.length < 2) return new Set();
  const values = prods.map(p => row.rawValue!(p));
  const best = lowerIsBetter ? Math.min(...values) : Math.max(...values);
  if (values.filter(v => v === best).length === prods.length) return new Set();
  return new Set(prods.filter(p => row.rawValue!(p) === best).map(p => p.id));
}

/* ─── Slot empty state ───────────────────────────────────────────── */
function EmptySlot({ onSelect }: { onSelect: (p: Product) => void }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (search.trim().length < 1) return products.slice(0, 8);
    const q = search.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  return (
    <div className={styles.emptySlot}>
      <div className={styles.emptySlotInner}>
        <div className={styles.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="2" width="14" height="20" rx="3"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <p className={styles.emptySlotLabel}>Add a phone</p>
        <div className={styles.slotSearchWrap}>
          <input
            type="text"
            placeholder="Search phones…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 180)}
            className={styles.slotSearch}
          />
          {open && (
            <div className={styles.slotDropdown}>
              {results.map(p => (
                <button
                  key={p.id}
                  className={styles.slotDropItem}
                  onMouseDown={() => { onSelect(p); setSearch(''); }}
                >
                  <img src={p.image} alt={p.name} className={styles.slotDropImg} />
                  <div className={styles.slotDropInfo}>
                    <span className={styles.slotDropName}>{p.name}</span>
                    <span className={styles.slotDropSub}>{p.brand} · ${p.price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Phone header card ──────────────────────────────────────────── */
function PhoneHeader({ product, onRemove, onCartAdd, isWinner }: {
  product: Product;
  onRemove: () => void;
  onCartAdd: () => void;
  isWinner: boolean;
}) {
  const { addItem } = useCart();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className={`${styles.phoneHeader} ${isWinner ? styles.phoneHeaderWinner : ''}`}>
      {isWinner && (
        <div className={styles.winnerBanner}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Best Value
        </div>
      )}
      <button className={styles.removeBtn} onClick={onRemove} title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <Link to={`/product/${product.id}`} className={styles.phoneHeaderImg}>
        <img src={product.image} alt={product.name} />
      </Link>
      <Link to={`/product/${product.id}`} className={styles.phoneHeaderName}>
        <span className={styles.phoneHeaderBrand}>{product.brand}</span>
        {product.name}
      </Link>
      <div className={styles.phoneHeaderPrice}>
        <span className={styles.headerPrice}>${product.price.toLocaleString()}</span>
        {discount && <span className={styles.headerDiscount}>−{discount}%</span>}
      </div>
      <button
        className={styles.headerCartBtn}
        onClick={() => { addItem(product, product.colors[0]); onCartAdd(); }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        Add to Cart
      </button>
    </div>
  );
}

/* ─── Main Compare page ──────────────────────────────────────────── */
export default function Compare({ onCartAdd }: Props) {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useCompare();
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(ALL_CATEGORIES));
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  const slots = [...compareList, ...Array(Math.max(0, 2 - compareList.length)).fill(null)].slice(0, 4);
  const filledProducts = compareList;

  /* Best value: highest rating / price ratio */
  const bestValueId = useMemo(() => {
    if (filledProducts.length < 2) return null;
    const scored = filledProducts.map(p => ({ id: p.id, score: p.rating / (p.price / 1000) }));
    return scored.sort((a, b) => b.score - a.score)[0].id;
  }, [filledProducts]);

  function toggleCategory(cat: string) {
    setActiveCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  /* Check if a spec row has all same values (to filter for diff mode) */
  function allSame(values: string[]): boolean {
    return values.length > 1 && values.every(v => v === values[0]);
  }

  const colCount = Math.max(2, compareList.length);

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">

        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Compare <span>Phones</span></h1>
            <p className={styles.pageSub}>Side-by-side spec comparison of up to 4 smartphones</p>
          </div>
          {compareList.length > 0 && (
            <div className={styles.headerActions}>
              <label className={styles.diffToggle}>
                <input
                  type="checkbox"
                  checked={showOnlyDiff}
                  onChange={e => setShowOnlyDiff(e.target.checked)}
                />
                <span className={styles.diffToggleSwitch} />
                Show differences only
              </label>
              <button className={styles.clearBtn} onClick={clearCompare}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Quick-add bar (if less than 4) */}
        {compareList.length < 4 && compareList.length > 0 && (
          <div className={styles.quickAddBar}>
            <span className={styles.quickAddLabel}>Quick add:</span>
            <div className={styles.quickAddChips}>
              {products
                .filter(p => !compareList.find(c => c.id === p.id))
                .slice(0, 8)
                .map(p => (
                  <button
                    key={p.id}
                    className={styles.quickAddChip}
                    onClick={() => addToCompare(p)}
                  >
                    + {p.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Category filter pills */}
        {compareList.length > 0 && (
          <div className={styles.catFilters}>
            <button
              className={`${styles.catAll} ${activeCategories.size === ALL_CATEGORIES.length ? styles.catAllActive : ''}`}
              onClick={() => setActiveCategories(new Set(ALL_CATEGORIES))}
            >All</button>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.catPill} ${activeCategories.has(cat) ? styles.catPillActive : ''}`}
                onClick={() => toggleCategory(cat)}
              >{cat}</button>
            ))}
          </div>
        )}

        {/* Main comparison table */}
        <div className={styles.tableWrap}>
          <table className={styles.table} style={{ '--col-count': colCount } as React.CSSProperties}>
            <colgroup>
              <col className={styles.labelCol} />
              {slots.map((_, i) => <col key={i} className={styles.dataCol} />)}
            </colgroup>

            {/* Phone headers */}
            <thead>
              <tr>
                <th className={styles.cornerCell}>
                  <div className={styles.cornerInner}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
                      <rect x="5" y="2" width="14" height="20" rx="3"/>
                      <line x1="9" y1="7" x2="15" y2="7"/>
                      <line x1="9" y1="11" x2="15" y2="11"/>
                      <line x1="9" y1="15" x2="13" y2="15"/>
                    </svg>
                    <span>Spec</span>
                  </div>
                </th>
                {slots.map((product, i) =>
                  product ? (
                    <th key={product.id} className={styles.phoneHeaderCell}>
                      <PhoneHeader
                        product={product}
                        onRemove={() => removeFromCompare(product.id)}
                        onCartAdd={onCartAdd}
                        isWinner={product.id === bestValueId}
                      />
                    </th>
                  ) : (
                    <th key={`empty-${i}`} className={styles.emptySlotCell}>
                      <EmptySlot onSelect={addToCompare} />
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {ALL_CATEGORIES.map(category => {
                if (!activeCategories.has(category)) return null;

                /* Gather rows for this category */
                const extraInCat = EXTRA_ROWS.filter(r => r.category === category);
                const specInCat = SPEC_ROWS.filter(r => r.category === category);
                const allRows = [...extraInCat.map(r => ({ type: 'extra' as const, row: r })),
                                 ...specInCat.map(r => ({ type: 'spec' as const, row: r }))];

                if (allRows.length === 0) return null;

                return (
                  <React.Fragment key={category}>
                    {/* Category header row */}
                    <tr className={styles.catHeaderRow}>
                      <td colSpan={slots.length + 1} className={styles.catHeaderCell}>
                        <span className={styles.catHeaderLabel}>{category}</span>
                      </td>
                    </tr>

                    {allRows.map(({ type, row }) => {
                      /* Determine winners / highlights */
                      let winnerIds = new Set<string>();
                      let loserIds = new Set<string>();

                      if (type === 'spec') {
                        const sr = row as SpecRow;
                        winnerIds = winnerForSpec(sr.key, filledProducts, sr.higherIsBetter);
                      } else {
                        const er = row as ExtraRow;
                        if (er.label === 'Price') {
                          loserIds = winnerForExtra(er, filledProducts, false); // higher price = "worse"
                          winnerIds = winnerForExtra(er, filledProducts, true); // lower price = winner
                        } else if (er.label === 'Rating' || er.label === 'In Stock') {
                          winnerIds = winnerForExtra(er, filledProducts, false);
                        }
                      }

                      /* Check if all filled products have same value for diff mode */
                      const values = type === 'spec'
                        ? filledProducts.map(p => p.specs[(row as SpecRow).key])
                        : [];
                      if (showOnlyDiff && type === 'spec' && allSame(values)) return null;

                      return (
                        <tr key={row.label} className={styles.specRow}>
                          <td className={styles.specLabel}>{row.label}</td>
                          {slots.map((product, i) => {
                            if (!product) {
                              return <td key={`empty-${i}`} className={styles.emptyCell}>—</td>;
                            }
                            const isWinner = winnerIds.has(product.id);
                            const isLoser = loserIds.has(product.id);

                            return (
                              <td
                                key={product.id}
                                className={`${styles.specValue} ${isWinner ? styles.specWinner : ''} ${isLoser ? styles.specLoser : ''}`}
                              >
                                {isWinner && (
                                  <span className={styles.winnerDot} title="Best" />
                                )}
                                {type === 'spec'
                                  ? (product as Product).specs[(row as SpecRow).key]
                                  : (row as ExtraRow).render(product as Product)
                                }
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Score summary row */}
              {filledProducts.length > 1 && (
                <>
                  <tr className={styles.catHeaderRow}>
                    <td colSpan={slots.length + 1} className={styles.catHeaderCell}>
                      <span className={styles.catHeaderLabel}>Verdict</span>
                    </td>
                  </tr>
                  <tr className={styles.verdictRow}>
                    <td className={styles.specLabel}>Overall Score</td>
                    {slots.map((product, i) => {
                      if (!product) return <td key={i} className={styles.emptyCell}>—</td>;
                      const score = Math.round(
                        (product.rating / 5) * 40 +
                        (product.reviewCount / 10000) * 20 +
                        (product.price < 500 ? 20 : product.price < 900 ? 15 : 10) +
                        (product.isNew ? 10 : 5) +
                        (product.inStock ? 10 : 0)
                      );
                      const isTop = product.id === bestValueId;
                      return (
                        <td key={product.id} className={`${styles.scoreCell} ${isTop ? styles.scoreCellTop : ''}`}>
                          <div className={styles.scoreBar}>
                            <div className={styles.scoreBarFill} style={{ width: `${Math.min(100, score)}%`, background: isTop ? 'var(--accent)' : 'var(--border-light)' }} />
                          </div>
                          <span className={`${styles.scoreNum} ${isTop ? styles.scoreNumTop : ''}`}>{score}/100</span>
                          {isTop && <span className={styles.topPick}>Top Pick</span>}
                        </td>
                      );
                    })}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {compareList.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="3" width="8" height="18" rx="2"/>
                <rect x="14" y="3" width="8" height="18" rx="2"/>
                <line x1="10" y1="12" x2="14" y2="12" strokeDasharray="2 2"/>
              </svg>
            </div>
            <h3>Nothing to compare yet</h3>
            <p>Add phones using the search boxes above, or browse the shop and click Compare.</p>
            <div className={styles.emptySlots}>
              <EmptySlot onSelect={addToCompare} />
              <EmptySlot onSelect={addToCompare} />
            </div>
            <Link to="/shop" className="btn-ghost" style={{ marginTop: 16 }}>
              Browse all phones →
            </Link>
          </div>
        )}

        {/* Popular comparisons */}
        <section className={styles.popular}>
          <h2 className={styles.popularTitle}>Popular Comparisons</h2>
          <div className={styles.popularGrid}>
            {[
              { a: 'iphone-16-pro-max', b: 'galaxy-s25-ultra' },
              { a: 'pixel-9-pro', b: 'iphone-16-pro' },
              { a: 'oneplus-13', b: 'galaxy-s25' },
              { a: 'xiaomi-14-ultra', b: 'sony-xperia-1-vi' },
            ].map(({ a, b }) => {
              const pa = products.find(p => p.id === a);
              const pb = products.find(p => p.id === b);
              if (!pa || !pb) return null;
              return (
                <button
                  key={`${a}-${b}`}
                  className={styles.popularCard}
                  onClick={() => { clearCompare(); addToCompare(pa); addToCompare(pb); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div className={styles.popularPhones}>
                    <img src={pa.image} alt={pa.name} className={styles.popularImg} />
                    <span className={styles.vsTag}>VS</span>
                    <img src={pb.image} alt={pb.name} className={styles.popularImg} />
                  </div>
                  <div className={styles.popularNames}>
                    <span>{pa.name}</span>
                    <span className={styles.vsSmall}>vs</span>
                    <span>{pb.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
