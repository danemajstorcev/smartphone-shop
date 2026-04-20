import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import FilterPanel from "../components/FilterPanel/FilterPanel";
import ProductCard from "../components/ProductCard/ProductCard";
import { products, MIN_PRICE, MAX_PRICE } from "../data/products";
import { FilterState, Brand, PhoneType } from "../types";
import styles from "./Shop.module.css";

interface Props {
  onCartAdd: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  brands: [],
  types: [],
  minPrice: MIN_PRICE,
  maxPrice: MAX_PRICE,
  sortBy: "default",
  searchQuery: "",
};

export default function Shop({ onCartAdd }: Props) {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(() => {
    const init = { ...DEFAULT_FILTERS };
    const brand = searchParams.get("brand");
    const type = searchParams.get("type");
    const sort = searchParams.get("sort");
    if (brand) init.brands = [brand as Brand];
    if (type) init.types = [type as PhoneType];
    if (sort === "rating") init.sortBy = "rating";
    return init;
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = [...products];

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q),
      );
    }

    if (filters.brands.length > 0) {
      list = list.filter((p) => filters.brands.includes(p.brand));
    }

    if (filters.types.length > 0) {
      list = list.filter((p) => filters.types.includes(p.type));
    }

    list = list.filter(
      (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice,
    );

    switch (filters.sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [filters, searchQuery]);

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  }

  const activeCount =
    filters.brands.length +
    filters.types.length +
    (filters.minPrice > MIN_PRICE ? 1 : 0) +
    (filters.maxPrice < MAX_PRICE ? 1 : 0);

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              All <span>Phones</span>
            </h1>
            <p className={styles.pageSubtitle}>
              The latest flagship, mid-range and budget smartphones
            </p>
          </div>

          <div className={styles.searchWrap}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, brand…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <button
          className={styles.mobileFilterToggle}
          onClick={() => setMobileFiltersOpen((o) => !o)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          Filters{" "}
          {activeCount > 0 && (
            <span className={styles.filterCount}>{activeCount}</span>
          )}
          {mobileFiltersOpen ? " ▲" : " ▼"}
        </button>

        <div className={styles.layout}>
          <div
            className={`${styles.filterWrap} ${mobileFiltersOpen ? styles.filterOpen : ""}`}
          >
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
              totalResults={filtered.length}
            />
          </div>

          <div className={styles.productsArea}>
            {activeCount > 0 && (
              <div className={styles.chips}>
                {filters.brands.map((b) => (
                  <span key={b} className={styles.chip}>
                    {b}
                    <button
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          brands: f.brands.filter((x) => x !== b),
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                {filters.types.map((t) => (
                  <span key={t} className={styles.chip}>
                    {t}
                    <button
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          types: f.types.filter((x) => x !== t),
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button className={styles.clearChips} onClick={handleReset}>
                  Clear all
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="empty-state">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No phones found</h3>
                <p>Try adjusting your filters or search query.</p>
                <button className="btn-primary" onClick={handleReset}>
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map((p, i) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    animDelay={Math.min(i, 8) * 50}
                    onAddToCart={onCartAdd}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
