import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Auth.module.css";

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
    setGlobalError("");
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await signup(
      form.firstName,
      form.lastName,
      form.email,
      form.password,
    );
    setLoading(false);
    if (!result.ok) setGlobalError(result.error || "Signup failed.");
  }

  const passStrength =
    form.password.length === 0
      ? 0
      : form.password.length < 6
        ? 1
        : form.password.length < 10
          ? 2
          : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = [
    "",
    "var(--danger)",
    "var(--warning)",
    "var(--success)",
  ];

  return (
    <div className={`page-wrapper ${styles.page}`}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect
                x="5"
                y="2"
                width="14"
                height="20"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="17.5" r="1.2" fill="currentColor" />
            </svg>
          </span>
          Nex<strong>Phone</strong>
        </Link>

        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.sub}>Join NexPhone and start shopping smarter</p>
        </div>

        {globalError && (
          <div className={styles.errorBox}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <div
                className={`${styles.inputWrap} ${errors.firstName ? styles.inputErr : ""}`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  value={form.firstName}
                  onChange={(e) => set("firstName", e.target.value)}
                  placeholder="John"
                  autoFocus
                />
              </div>
              {errors.firstName && (
                <span className={styles.fieldErr}>{errors.firstName}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <div
                className={`${styles.inputWrap} ${errors.lastName ? styles.inputErr : ""}`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  value={form.lastName}
                  onChange={(e) => set("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && (
                <span className={styles.fieldErr}>{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email address</label>
            <div
              className={`${styles.inputWrap} ${errors.email ? styles.inputErr : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className={styles.fieldErr}>{errors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div
              className={`${styles.inputWrap} ${errors.password ? styles.inputErr : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((s) => !s)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className={styles.strengthRow}>
                <div className={styles.strengthBars}>
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className={styles.strengthBar}
                      style={{
                        background:
                          passStrength >= n
                            ? strengthColor[passStrength]
                            : "var(--border-light)",
                      }}
                    />
                  ))}
                </div>
                <span
                  className={styles.strengthLabel}
                  style={{ color: strengthColor[passStrength] }}
                >
                  {strengthLabel[passStrength]}
                </span>
              </div>
            )}
            {errors.password && (
              <span className={styles.fieldErr}>{errors.password}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <div
              className={`${styles.inputWrap} ${errors.confirm ? styles.inputErr : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPass ? "text" : "password"}
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && (
              <span className={styles.fieldErr}>{errors.confirm}</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <svg
                className={styles.spinner}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            )}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" state={{ from }} className={styles.switchLink}>
            Sign in →
          </Link>
        </div>

        <Link to="/" className={styles.backLink}>
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
