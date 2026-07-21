'use client';

import { useMemo, useState } from 'react';
import { CATEGORIES } from '../../../lib/products';
import { useProducts } from '../../../lib/useProducts';
import { formatNaira } from '../../../lib/format';
import { BUILD_A_GIFT_MIN_BUDGET } from '../../../lib/scoops';
import { useCart } from '../../../context/CartContext';
import { useRouter } from 'next/navigation';
import ProductImage from '../../../components/ProductImage';

export default function BuildAGiftPage() {
  const { products } = useProducts();
  const [category, setCategory] = useState('All');
  const [selection, setSelection] = useState({}); // id -> qty
  const [budget, setBudget] = useState(BUILD_A_GIFT_MIN_BUDGET);
  const [notes, setNotes] = useState('');
  const { addItem } = useCart();
  const router = useRouter();

  const filtered = useMemo(
    () => (category === 'All' ? products : products.filter((p) => p.category === category)),
    [products, category]
  );

  const selectedLines = useMemo(
    () =>
      Object.entries(selection)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
        .filter((l) => l.product),
    [selection, products]
  );

  const total = selectedLines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const remaining = budget - total;

  const setQty = (id, qty) =>
    setSelection((prev) => ({ ...prev, [id]: Math.max(0, qty) }));

  const handleAddPack = () => {
    if (selectedLines.length === 0) return;
    addItem({
      key: `pack-${Date.now()}`,
      type: 'build-a-gift',
      id: `pack-${Date.now()}`,
      name: `Custom Build-a-Gift Pack (${selectedLines.length} items)`,
      price: total,
      qty: 1,
      contents: selectedLines.map((l) => `${l.qty}× ${l.product.name}`),
      notes,
    });
    router.push('/cart');
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <header className="mb-10">
        <p className="uppercase tracking-[0.3em] text-xs text-lavender font-body mb-3">
          Custom Curation
        </p>
        <h1 className="font-display text-4xl mb-3">Build-a-Gift Pack</h1>
        <p className="text-charcoal/60 font-body max-w-xl">
          Set a baseline budget starting at {formatNaira(BUILD_A_GIFT_MIN_BUDGET)}
          {' '}and hand-pick the items that matter — we'll box, wrap and deliver
          your exact arrangement.
        </p>
      </header>

      <div className="grid lg:grid-cols-[1fr_340px] gap-10">
        {/* Item picker */}
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
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

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((p) => {
              const qty = selection[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-charcoal/10 bg-white p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ProductImage src={p.imageUrl} alt={p.name} className="w-12 h-12 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-display text-base leading-snug truncate">{p.name}</p>
                      <p className="text-sm text-charcoal/50 font-body">{formatNaira(p.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setQty(p.id, qty - 1)}
                      disabled={qty === 0}
                      aria-label={`Remove one ${p.name}`}
                      className="focus-ring w-7 h-7 rounded-full border border-charcoal/20 disabled:opacity-30 flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-5 text-center font-body text-sm">{qty}</span>
                    <button
                      onClick={() => setQty(p.id, qty + 1)}
                      aria-label={`Add one ${p.name}`}
                      className="focus-ring w-7 h-7 rounded-full border border-charcoal/20 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-28 h-fit rounded-2xl border border-lavender-100 bg-white p-6">
          <h2 className="font-display text-xl mb-4">Your pack</h2>

          <label className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-2">
            Target budget
          </label>
          <input
            type="number"
            min={BUILD_A_GIFT_MIN_BUDGET}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || BUILD_A_GIFT_MIN_BUDGET)}
            className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 font-body text-sm mb-6"
          />

          {selectedLines.length === 0 ? (
            <p className="text-sm text-charcoal/50 font-body mb-6">
              No items selected yet — add some from the catalog.
            </p>
          ) : (
            <ul className="space-y-2 mb-6 max-h-48 overflow-auto pr-1">
              {selectedLines.map((l) => (
                <li key={l.product.id} className="flex justify-between text-sm font-body">
                  <span className="text-charcoal/70">
                    {l.qty}× {l.product.name}
                  </span>
                  <span>{formatNaira(l.product.price * l.qty)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-charcoal/10 pt-4 mb-4 space-y-1 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal/60">Pack total</span>
              <span className="font-semibold">{formatNaira(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal/60">
                {remaining >= 0 ? 'Remaining on budget' : 'Over budget by'}
              </span>
              <span className={remaining < 0 ? 'text-lavender font-semibold' : ''}>
                {formatNaira(Math.abs(remaining))}
              </span>
            </div>
          </div>

          <label className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-2">
            Personal needs / requests
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. mum has sensitive skin, prefers fragrance-free items…"
            className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 font-body text-sm mb-6"
          />

          <button
            onClick={handleAddPack}
            disabled={selectedLines.length === 0}
            className="focus-ring w-full rounded-full bg-lavender text-white py-3 font-body text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-lavender-600 transition-colors"
          >
            Add pack to cart
          </button>
        </aside>
      </div>
    </div>
  );
}
