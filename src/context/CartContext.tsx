import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; product: Product; color: string }
  | { type: "REMOVE"; productId: string; color: string }
  | { type: "UPDATE_QTY"; productId: string; color: string; delta: number }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        (i) =>
          i.product.id === action.product.id &&
          i.selectedColor === action.color,
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id &&
            i.selectedColor === action.color
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return {
        items: [
          ...state.items,
          { product: action.product, quantity: 1, selectedColor: action.color },
        ],
      };
    }
    case "REMOVE":
      return {
        items: state.items.filter(
          (i) =>
            !(
              i.product.id === action.productId &&
              i.selectedColor === action.color
            ),
        ),
      };
    case "UPDATE_QTY": {
      return {
        items: state.items
          .map((i) =>
            i.product.id === action.productId &&
            i.selectedColor === action.color
              ? { ...i, quantity: Math.max(0, i.quantity + action.delta) }
              : i,
          )
          .filter((i) => i.quantity > 0),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, color: string) => void;
  removeItem: (productId: string, color: string) => void;
  updateQty: (productId: string, color: string, delta: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = useCallback((product: Product, color: string) => {
    dispatch({ type: "ADD", product, color });
  }, []);

  const removeItem = useCallback((productId: string, color: string) => {
    dispatch({ type: "REMOVE", productId, color });
  }, []);

  const updateQty = useCallback(
    (productId: string, color: string, delta: number) => {
      dispatch({ type: "UPDATE_QTY", productId, color, delta });
    },
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const isInCart = useCallback(
    (productId: string) => state.items.some((i) => i.product.id === productId),
    [state.items],
  );

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
