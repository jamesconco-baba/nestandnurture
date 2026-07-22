'use client';

import { useScoops } from '../../../lib/useScoops';
import { formatNaira } from '../../../lib/format';
import { useCart } from '../../../context/CartContext';
import { useRouter } from 'next/navigation';
import ProductImage from '../../../components/ProductImage';

export default function MysteryScoopPage() {
  const { scoops } = useScoops();
  const { addItem } = useCart();
  const router = useRouter();

  const handleAdd = (scoop) => {
    addItem({
      key: `scoop-${scoop.id}`,
      type: 'mystery-scoop',
      id: scoop.id,
      name: scoop.name,
      price: scoop.price,
      qty: 1,
    });
    router.push('/cart');
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <p className="uppercase tracking-[0.3em] text-xs text-lavender font-body mb-3">
          Signature Service
        </p>
        <h1 className="font-display text-4xl mb-4">Mystery Scoop Tiers</h1>
        <p className="text-charcoal/60 font-body">
          Pre-configured surprise baby and mother-care bundles across three
          budget positions. Every scoop is finished with a gift-wrapped
          presentation and a personalized greeting card at checkout.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        {scoops.map((s) => (
          <div
            key={s.id}
            className={`rounded-2xl p-8 bg-white border flex flex-col ${
              s.featured ? 'border-gold-400 shadow-xl shadow-gold-100 sm:-translate-y-3' : 'border-lavender-100'
            }`}
          >
            {s.featured && (
              <span className="inline-block mb-4 w-fit text-[11px] uppercase tracking-wide bg-gold-100 text-gold-700 rounded-full px-3 py-1">
                Most Popular
              </span>
            )}
            <ProductImage src={s.imageUrl} alt={s.name} className="w-full h-44 mb-5" />
            <h2 className="font-display text-2xl mb-1">{s.name}</h2>
            <p className="text-lavender font-body text-2xl font-semibold mb-4">
              {formatNaira(s.price)}
            </p>
            <p className="text-sm text-charcoal/60 font-body mb-6">{s.tagline}</p>
            <ul className="space-y-2 mb-8 flex-1">
              {s.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm font-body text-charcoal/70">
                  <span className="text-gold-600 mt-0.5">✦</span>
                  {h}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleAdd(s)}
              className={`focus-ring w-full rounded-full py-3 font-body text-sm uppercase tracking-wide transition-colors ${
                s.featured
                  ? 'bg-lavender text-white hover:bg-lavender-600'
                  : 'border border-lavender text-lavender hover:bg-lavender hover:text-white'
              }`}
            >
              Choose {s.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
