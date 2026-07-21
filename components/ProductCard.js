'use client';

import { useState } from 'react';
import { formatNaira } from '../lib/format';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      key: `unit-${product.id}`,
      type: 'unit',
      id: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="rounded-xl border border-charcoal/10 bg-white p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-gold-700 font-body mb-1">
          {product.category}
        </p>
        <h3 className="font-display text-lg leading-snug mb-2">{product.name}</h3>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-body text-charcoal font-semibold">
          {formatNaira(product.price)}
        </span>
        <button
          onClick={handleAdd}
          className="focus-ring rounded-full border border-lavender text-lavender text-xs uppercase tracking-wide px-4 py-2 hover:bg-lavender hover:text-white transition-colors"
        >
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
