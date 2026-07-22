'use client';

import { useScoops } from '../lib/useScoops';
import { formatNaira } from '../lib/format';
import ProductImage from './ProductImage';

export default function ScoopsTeaser() {
  const { scoops } = useScoops();

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {scoops.map((s) => (
        <div
          key={s.id}
          className={`rounded-2xl p-7 bg-white border ${
            s.featured ? 'border-gold-400 shadow-lg shadow-gold-100' : 'border-lavender-100'
          }`}
        >
          {s.featured && (
            <span className="inline-block mb-3 text-[11px] uppercase tracking-wide bg-gold-100 text-gold-700 rounded-full px-3 py-1">
              Most Popular
            </span>
          )}
          <ProductImage src={s.imageUrl} alt={s.name} className="w-full h-36 mb-4" />
          <h3 className="font-display text-2xl mb-1">{s.name}</h3>
          <p className="text-lavender font-body font-semibold mb-3">
            {formatNaira(s.price)}
          </p>
          <p className="text-sm text-charcoal/60 font-body">{s.tagline}</p>
        </div>
      ))}
    </div>
  );
}
