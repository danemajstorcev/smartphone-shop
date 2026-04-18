import React, { createContext, useContext, useState, useCallback } from "react";
import { Product } from "../types";

const MAX_COMPARE = 4;

interface CompareContextValue {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);

  const addToCompare = useCallback((product: Product) => {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const isInCompare = useCallback(
    (productId: string) => compareList.some((p) => p.id === productId),
    [compareList],
  );

  const clearCompare = useCallback(() => setCompareList([]), []);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
        isFull: compareList.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}
