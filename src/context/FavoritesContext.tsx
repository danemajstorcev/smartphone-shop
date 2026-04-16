import React, { createContext, useContext, useState, useCallback } from 'react';
import { Product } from '../types';
import { products } from '../data/products';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  favoriteProducts: Product[];
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  const favoriteProducts = products.filter(p => favoriteIds.has(p.id));

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite, favoriteProducts }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
