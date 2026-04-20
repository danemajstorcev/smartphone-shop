import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CompareProvider } from "./context/CompareContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header/Header";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import Footer from "./components/Footer/Footer";
import ToastContainer from "./components/Toast/ToastContainer";
import ChatBot from "./components/ChatBot/ChatBot";
import { useToast } from "./hooks/useToast";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Favorites from "./pages/Favorites";
import Checkout from "./pages/Checkout";
import Compare from "./pages/Compare";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

function AppInner() {
  const [cartOpen, setCartOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  const location = useLocation();
  const isCheckout = location.pathname === "/checkout";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  function handleCartAdd() {
    showToast("Added to cart!", "success");
    setCartOpen(true);
  }

  return (
    <>
      <Header onCartClick={() => setCartOpen((o) => !o)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ChatBot />

      <Routes>
        <Route path="/" element={<Home onCartAdd={handleCartAdd} />} />
        <Route path="/shop" element={<Shop onCartAdd={handleCartAdd} />} />
        <Route
          path="/product/:id"
          element={<ProductDetail onCartAdd={handleCartAdd} />}
        />
        <Route
          path="/favorites"
          element={<Favorites onCartAdd={handleCartAdd} />}
        />
        <Route
          path="/compare"
          element={<Compare onCartAdd={handleCartAdd} />}
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="*"
          element={
            <div
              className="page-wrapper"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                textAlign: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "4rem",
                    marginBottom: 12,
                  }}
                >
                  404
                </h2>
                <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
                  Page not found
                </p>
                <a href="/" className="btn-primary">
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>

      {!isCheckout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <CompareProvider>
            <AppInner />
          </CompareProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
