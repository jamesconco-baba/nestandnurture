'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES } from '../../../lib/products';
import { useProducts } from '../../../lib/useProducts';
import ProductCard from '../../../components/ProductCard';

export default function ShopPage() {
  const { products } = useProducts();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, category, query]);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <header className="mb-10">
        <p className="uppercase tracking-[0.3em] text-xs text-lavender font-body mb-3">
          Precise Selection
        </p>
        <h1 className="font-display text-4xl mb-3">Unit Price Shop</h1>
        <p className="text-charcoal/60 font-body max-w-xl">
          Browse the full catalog of premium baby &amp; new-mum items and buy
          exactly what you need, at retail price, one item at a time.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder="Search items…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="focus-ring flex-1 rounded-full border border-charcoal/15 px-5 py-2.5 font-body text-sm bg-white"
        />
        <div className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`focus-ring rounded-full px-4 py-2 text-xs uppercase tracking-wide font-body border transition-colors ${
                category === c
                  ? 'bg-lavender text-white border-lavender'
                  : 'border-charcoal/15 text-charcoal/70 hover:border-lavender'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="font-body text-charcoal/50 py-16 text-center">
          No items match “{query}”. Try another search or category.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
