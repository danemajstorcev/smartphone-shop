import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import styles from "./Checkout.module.css";

type PayMethod = "card" | "address";
type Step = "info" | "payment" | "review" | "success";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  payMethod: PayMethod;
  saveInfo: boolean;
}

const EMPTY: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  country: "US",
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvv: "",
  payMethod: "card",
  saveInfo: false,
};

function formatCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function formatExpiry(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 4);
  return n.length > 2 ? n.slice(0, 2) + "/" + n.slice(2) : n;
}

const STEPS: Step[] = ["info", "payment", "review", "success"];
const STEP_LABELS: Record<Step, string> = {
  info: "Shipping",
  payment: "Payment",
  review: "Review",
  success: "Done",
};

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [placing, setPlacing] = useState(false);

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validateStep(s: Step): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (s === "info") {
      if (!form.firstName) e.firstName = "Required";
      if (!form.lastName) e.lastName = "Required";
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
        e.email = "Valid email required";
      if (!form.address) e.address = "Required";
      if (!form.city) e.city = "Required";
      if (!form.zip) e.zip = "Required";
    }
    if (s === "payment" && form.payMethod === "card") {
      if (!form.cardNumber || form.cardNumber.replace(/\s/g, "").length < 16)
        e.cardNumber = "Valid card number required";
      if (!form.cardName) e.cardName = "Required";
      if (!form.expiry || form.expiry.length < 5) e.expiry = "MM/YY required";
      if (!form.cvv || form.cvv.length < 3) e.cvv = "Required";
    }
    setErrors(e as Partial<FormData>);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    const idx = STEPS.indexOf(step);
    setStep(STEPS[idx + 1]);
  }

  function placeOrder() {
    setPlacing(true);
    setTimeout(() => {
      clearCart();
      setStep("success");
      setPlacing(false);
    }, 1800);
  }

  const stepIdx = STEPS.indexOf(step);

  if (items.length === 0 && step !== "success") {
    return (
      <div className={`page-wrapper ${styles.emptyPage}`}>
        <div className="container">
          <h2>Your cart is empty</h2>
          <Link to="/shop" className="btn-primary">
            Shop Phones
          </Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className={`page-wrapper ${styles.successPage}`}>
        <div className={styles.successBox}>
          <div className={styles.successIcon}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className={styles.successTitle}>Order Placed!</h2>
          <p className={styles.successSub}>
            Thank you, {form.firstName}! Your order will ship to{" "}
            <strong>
              {form.address}, {form.city}
            </strong>
            . You'll receive a confirmation at <strong>{form.email}</strong>.
          </p>
          <div className={styles.successActions}>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
            <Link to="/shop" className="btn-ghost">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className="container">
        <Link to="/shop" className={styles.backLink}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to shop
        </Link>

        <h1 className={styles.pageTitle}>Checkout</h1>

        {/* Progress */}
        <div className={styles.progress}>
          {STEPS.filter((s) => s !== "success").map((s, i) => (
            <div key={s} className={styles.progressStep}>
              <div
                className={`${styles.progressDot} ${stepIdx >= i ? styles.progressDotActive : ""} ${stepIdx > i ? styles.progressDotDone : ""}`}
              >
                {stepIdx > i ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={`${styles.progressLabel} ${stepIdx >= i ? styles.progressLabelActive : ""}`}
              >
                {STEP_LABELS[s]}
              </span>
              {i < 2 && (
                <div
                  className={`${styles.progressLine} ${stepIdx > i ? styles.progressLineDone : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Form area */}
          <div className={styles.formArea}>
            {/* STEP: Shipping Info */}
            {step === "info" && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Shipping Address
                </h2>
                <div className={styles.formGrid}>
                  <Field label="First Name" error={errors.firstName} required>
                    <input
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      placeholder="John"
                    />
                  </Field>
                  <Field label="Last Name" error={errors.lastName} required>
                    <input
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      placeholder="Doe"
                    />
                  </Field>
                  <Field
                    label="Email"
                    error={errors.email}
                    required
                    className={styles.colFull}
                  >
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </Field>
                  <Field label="Phone" className={styles.colFull}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </Field>
                  <Field
                    label="Street Address"
                    error={errors.address}
                    required
                    className={styles.colFull}
                  >
                    <input
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="123 Main St"
                    />
                  </Field>
                  <Field label="City" error={errors.city} required>
                    <input
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="New York"
                    />
                  </Field>
                  <Field label="ZIP / Postal Code" error={errors.zip} required>
                    <input
                      value={form.zip}
                      onChange={(e) => set("zip", e.target.value)}
                      placeholder="10001"
                    />
                  </Field>
                  <Field label="Country" className={styles.colFull}>
                    <select
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                    >
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="MK">North Macedonia</option>
                    </select>
                  </Field>
                </div>
                <div className={styles.saveRow}>
                  <label className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={form.saveInfo}
                      onChange={(e) => set("saveInfo", e.target.checked)}
                    />
                    Save this info for future orders
                  </label>
                </div>
              </div>
            )}

            {/* STEP: Payment */}
            {step === "payment" && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Payment Method
                </h2>

                <div className={styles.payMethods}>
                  {(["card", "address"] as PayMethod[]).map((m) => (
                    <button
                      key={m}
                      className={`${styles.payMethodBtn} ${form.payMethod === m ? styles.payMethodActive : ""}`}
                      onClick={() => set("payMethod", m)}
                    >
                      {m === "card" ? (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="1" y="4" width="22" height="16" rx="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                          Pay by Card
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          Pay on Delivery
                        </>
                      )}
                    </button>
                  ))}
                </div>

                {form.payMethod === "card" && (
                  <div className={styles.formGrid}>
                    <Field
                      label="Card Number"
                      error={errors.cardNumber}
                      required
                      className={styles.colFull}
                    >
                      <input
                        value={form.cardNumber}
                        onChange={(e) =>
                          set("cardNumber", formatCard(e.target.value))
                        }
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                      />
                    </Field>
                    <Field
                      label="Cardholder Name"
                      error={errors.cardName}
                      required
                      className={styles.colFull}
                    >
                      <input
                        value={form.cardName}
                        onChange={(e) =>
                          set("cardName", e.target.value.toUpperCase())
                        }
                        placeholder="JOHN DOE"
                      />
                    </Field>
                    <Field label="Expiry" error={errors.expiry} required>
                      <input
                        value={form.expiry}
                        onChange={(e) =>
                          set("expiry", formatExpiry(e.target.value))
                        }
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </Field>
                    <Field label="CVV" error={errors.cvv} required>
                      <input
                        type="password"
                        value={form.cvv}
                        onChange={(e) =>
                          set(
                            "cvv",
                            e.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        placeholder="•••"
                        maxLength={4}
                      />
                    </Field>
                    <div className={`${styles.secureNote} ${styles.colFull}`}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Your payment information is encrypted and secure.
                    </div>
                  </div>
                )}

                {form.payMethod === "address" && (
                  <div className={styles.codNote}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>
                        Pay when your order arrives. No card required.
                        Additional fee may apply.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP: Review */}
            {step === "review" && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Review Your Order
                </h2>

                <div className={styles.reviewItems}>
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}`}
                      className={styles.reviewItem}
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className={styles.reviewItemImg}
                      />
                      <div className={styles.reviewItemInfo}>
                        <span className={styles.reviewItemName}>
                          {item.product.name}
                        </span>
                        <span className={styles.reviewItemColor}>
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              background: item.selectedColor,
                              display: "inline-block",
                              border: "1px solid rgba(255,255,255,0.2)",
                            }}
                          />
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <span className={styles.reviewItemPrice}>
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.reviewMeta}>
                  <div className={styles.reviewMetaRow}>
                    <span>Ship to</span>
                    <span>
                      {form.address}, {form.city} {form.zip}
                    </span>
                  </div>
                  <div className={styles.reviewMetaRow}>
                    <span>Payment</span>
                    <span>
                      {form.payMethod === "card"
                        ? `Card ending ${form.cardNumber.slice(-4)}`
                        : "Cash on Delivery"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={styles.navBtns}>
              {stepIdx > 0 && (
                <button
                  className="btn-ghost"
                  onClick={() => setStep(STEPS[stepIdx - 1])}
                >
                  ← Back
                </button>
              )}
              {step !== "review" ? (
                <button className="btn-primary" onClick={next}>
                  Continue →
                </button>
              ) : (
                <button
                  className={`btn-primary ${styles.placeBtn}`}
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? (
                    <svg
                      className={styles.spinner}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  ) : null}
                  {placing
                    ? "Placing Order…"
                    : `Place Order · $${totalPrice.toLocaleString()}`}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}`}
                  className={styles.summaryItem}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className={styles.summaryItemImg}
                  />
                  <div className={styles.summaryItemInfo}>
                    <span>{item.product.name}</span>
                    <span className={styles.summaryQty}>
                      Qty {item.quantity}
                    </span>
                  </div>
                  <span className={styles.summaryItemPrice}>
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={styles.free}>FREE</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span className={styles.totalAmt}>
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* Helper: form field wrapper */
function Field({
  label,
  error,
  required,
  children,
  className,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      <label className={styles.label}>
        {label} {required && <span className={styles.req}>*</span>}
      </label>
      <div className={`${styles.inputWrap} ${error ? styles.inputError : ""}`}>
        {children}
      </div>
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
