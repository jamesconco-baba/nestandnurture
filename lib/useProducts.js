'use client';

import { useEffect, useState } from 'react';
import { PRODUCTS as DEFAULT_PRODUCTS } from './products';

export function useProducts() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/products', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.products) && d.products.length > 0) {
          setProducts(d.products);
        }
      })
      .catch(() => {
        // Keep the static fallback if the API call fails for any reason.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}
