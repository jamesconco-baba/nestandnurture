'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'nn_cart_v1';

const emptyPersonalization = {
  gender: '',
  greetingId: '',
  greetingText: '',
  assemblyNotes: '',
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [personalization, setPersonalization] = useState(emptyPersonalization);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(parsed.items || []);
        setPersonalization(parsed.personalization || emptyPersonalization);
      }
    } catch (e) {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, personalization })
      );
    } catch (e) {
      // storage full or unavailable — non-fatal
    }
  }, [items, personalization, hydrated]);

  const addItem = (line) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.key === line.key);
      if (existing) {
        return prev.map((p) =>
          p.key === line.key ? { ...p, qty: p.qty + line.qty } : p
        );
      }
      return [...prev, line];
    });
  };

  const updateQty = (key, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((p) => p.key !== key)
        : prev.map((p) => (p.key === key ? { ...p, qty } : p))
    );
  };

  const removeItem = (key) => setItems((prev) => prev.filter((p) => p.key !== key));

  const clearCart = () => {
    setItems([]);
    setPersonalization(emptyPersonalization);
  };

  const updatePersonalization = (patch) =>
    setPersonalization((prev) => ({ ...prev, ...patch }));

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.qty, 0), [items]);

  // Mirror the cart to the server for logged-in customers, debounced, so the admin
  // "Waiting in Carts" tab can see what people have added without checking out yet.
  useEffect(() => {
    if (!hydrated || !user) return;
    const timeout = setTimeout(() => {
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, personalization, subtotal }),
      }).catch(() => {
        // Best-effort — a failed sync shouldn't interrupt shopping.
      });
    }, 800);
    return () => clearTimeout(timeout);
  }, [items, personalization, subtotal, user, hydrated]);

  const value = {
    items,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    personalization,
    updatePersonalization,
    hydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
