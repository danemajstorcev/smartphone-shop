import { useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import styles from "./CartDrawer.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } =
    useCart();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  function handleCheckout() {
    onClose();
    navigate("/checkout");
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      <aside className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
        <div className={styles.head}>
          <div className={styles.headTitle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Cart</span>
            {totalItems > 0 && (
              <span className={styles.countBadge}>{totalItems}</span>
            )}
          </div>
          <div className={styles.headActions}>
            {items.length > 0 && (
              <button className={styles.clearAllBtn} onClick={clearCart}>
                Clear all
              </button>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close cart"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <h3>Your cart is empty</h3>
              <p>Add some phones to get started.</p>
              <button className="btn-primary" onClick={onClose}>
                Browse Shop
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item) => {
                const discount = item.product.originalPrice
                  ? Math.round(
                      (1 - item.product.price / item.product.originalPrice) *
                        100,
                    )
                  : null;
                return (
                  <li
                    key={`${item.product.id}-${item.selectedColor}`}
                    className={styles.item}
                  >
                    <div className={styles.itemImg}>
                      <img src={item.product.image} alt={item.product.name} />
                    </div>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemBrand}>
                        {item.product.brand}
                      </span>
                      <span className={styles.itemName}>
                        {item.product.name}
                      </span>
                      <div className={styles.itemColor}>
                        <span
                          className={styles.colorDot}
                          style={{ background: item.selectedColor }}
                        />
                        <span className={styles.colorHex}>
                          {item.selectedColor}
                        </span>
                      </div>
                      <div className={styles.itemBottom}>
                        <div className={styles.qtyRow}>
                          <button
                            className={styles.qtyBtn}
                            onClick={() =>
                              updateQty(item.product.id, item.selectedColor, -1)
                            }
                          >
                            −
                          </button>
                          <span className={styles.qty}>{item.quantity}</span>
                          <button
                            className={styles.qtyBtn}
                            onClick={() =>
                              updateQty(item.product.id, item.selectedColor, 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className={styles.itemPriceCol}>
                          <span className={styles.itemTotal}>
                            $
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString()}
                          </span>
                          {discount && (
                            <span className={styles.savedTag}>
                              −{discount}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() =>
                        removeItem(item.product.id, item.selectedColor)
                      }
                      aria-label="Remove"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>
                Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
              </span>
              <span className={styles.subtotalVal}>
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span className={styles.freeShip}>FREE</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span className={styles.totalVal}>
                ${totalPrice.toLocaleString()}
              </span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
