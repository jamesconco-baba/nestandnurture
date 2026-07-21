'use client';

import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { formatNaira } from '../../lib/format';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, hydrated } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Your cart is empty</h1>
        <p className="text-charcoal/60 font-body mb-8">
          Add a unit item, a custom pack, or a Mystery Scoop to get started.
        </p>
        <Link
          href="/mystery-scoop"
          className="focus-ring inline-block rounded-full bg-lavender text-white px-7 py-3 font-body text-sm uppercase tracking-wide hover:bg-lavender-600 transition-colors"
        >
          Explore Mystery Scoops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
      <h1 className="font-display text-4xl mb-10">Your Cart</h1>

      <div className="space-y-4 mb-10">
        {items.map((line) => (
          <div
            key={line.key}
            className="rounded-xl border border-charcoal/10 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
          >
            <div>
              <span className="text-[11px] uppercase tracking-wide text-gold-700 font-body">
                {line.type === 'unit' && 'Unit item'}
                {line.type === 'build-a-gift' && 'Build-a-Gift pack'}
                {line.type === 'mystery-scoop' && 'Mystery Scoop'}
              </span>
              <h3 className="font-display text-lg">{line.name}</h3>
              {line.contents && (
                <p className="text-xs text-charcoal/50 font-body mt-1 max-w-md">
                  {line.contents.join(', ')}
                </p>
              )}
              {line.notes && (
                <p className="text-xs text-charcoal/50 font-body mt-1 italic">
                  Note: {line.notes}
                </p>
              )}
            </div>
            <div className="flex items-center gap-5">
              {line.type === 'unit' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(line.key, line.qty - 1)}
                    className="focus-ring w-7 h-7 rounded-full border border-charcoal/20"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-body text-sm">{line.qty}</span>
                  <button
                    onClick={() => updateQty(line.key, line.qty + 1)}
                    className="focus-ring w-7 h-7 rounded-full border border-charcoal/20"
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="text-sm font-body text-charcoal/50">Qty {line.qty}</span>
              )}
              <span className="font-body font-semibold w-28 text-right">
                {formatNaira(line.price * line.qty)}
              </span>
              <button
                onClick={() => removeItem(line.key)}
                aria-label={`Remove ${line.name}`}
                className="focus-ring text-charcoal/40 hover:text-lavender"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-charcoal/10 pt-6">
        <span className="font-body text-charcoal/60">Subtotal</span>
        <span className="font-display text-2xl">{formatNaira(subtotal)}</span>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
        <Link
          href="/shop"
          className="focus-ring rounded-full border border-charcoal/20 px-7 py-3 font-body text-sm uppercase tracking-wide text-center hover:border-lavender hover:text-lavender transition-colors"
        >
          Continue shopping
        </Link>
        <Link
          href="/checkout"
          className="focus-ring rounded-full bg-lavender text-white px-7 py-3 font-body text-sm uppercase tracking-wide text-center hover:bg-lavender-600 transition-colors"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
