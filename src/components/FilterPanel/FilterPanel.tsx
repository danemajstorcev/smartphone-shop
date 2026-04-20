import { BRANDS, MIN_PRICE, MAX_PRICE } from "../../data/products";
import { FilterState, Brand, PhoneType, SortOption } from "../../types";
import styles from "./FilterPanel.module.css";

const TYPES: PhoneType[] = ["flagship", "mid-range", "budget"];
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
];

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export default function FilterPanel({
  filters,
  onChange,
  onReset,
  totalResults,
}: Props) {
  function toggleBrand(b: Brand) {
    const next = filters.brands.includes(b)
      ? filters.brands.filter((x) => x !== b)
      : [...filters.brands, b];
    onChange({ ...filters, brands: next });
  }

  function toggleType(t: PhoneType) {
    const next = filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t];
    onChange({ ...filters, types: next });
  }

  const hasActive =
    filters.brands.length > 0 ||
    filters.types.length > 0 ||
    filters.minPrice > MIN_PRICE ||
    filters.maxPrice < MAX_PRICE;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>Filters</span>
        {hasActive && (
          <button className={styles.resetBtn} onClick={onReset}>
            Clear all
          </button>
        )}
      </div>

      <div className={styles.results}>
        <span>
          {totalResults} product{totalResults !== 1 ? "s" : ""}
        </span>
      </div>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Sort By</h4>
        <select
          className={styles.select}
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as SortOption })
          }
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Brand</h4>
        <div className={styles.checkList}>
          {BRANDS.map((b) => (
            <label key={b} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={filters.brands.includes(b as Brand)}
                onChange={() => toggleBrand(b as Brand)}
                className={styles.checkbox}
              />
              <span className={styles.checkLabel}>{b}</span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Category</h4>
        <div className={styles.checkList}>
          {TYPES.map((t) => (
            <label key={t} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={filters.types.includes(t)}
                onChange={() => toggleType(t)}
                className={styles.checkbox}
              />
              <span
                className={styles.checkLabel}
                style={{ textTransform: "capitalize" }}
              >
                {t}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>
          Price Range
          <span className={styles.priceDisplay}>
            ${filters.minPrice} – $
            {filters.maxPrice === MAX_PRICE
              ? `${MAX_PRICE}+`
              : filters.maxPrice}
          </span>
        </h4>
        <div className={styles.rangeWrap}>
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            value={filters.minPrice}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v < filters.maxPrice) onChange({ ...filters, minPrice: v });
            }}
            className={styles.range}
          />
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            value={filters.maxPrice}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v > filters.minPrice) onChange({ ...filters, maxPrice: v });
            }}
            className={styles.range}
          />
        </div>
        <div className={styles.priceInputs}>
          <input
            type="number"
            value={filters.minPrice}
            min={MIN_PRICE}
            max={filters.maxPrice - 1}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: Math.max(MIN_PRICE, Number(e.target.value)),
              })
            }
            className={styles.priceInput}
          />
          <span className={styles.priceSep}>–</span>
          <input
            type="number"
            value={filters.maxPrice}
            min={filters.minPrice + 1}
            max={MAX_PRICE}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: Math.min(MAX_PRICE, Number(e.target.value)),
              })
            }
            className={styles.priceInput}
          />
        </div>
      </section>
    </aside>
  );
}
