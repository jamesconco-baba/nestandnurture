'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../context/CartContext';
import PersonalizationForm from '../../../components/PersonalizationForm';
import { formatNaira, generateReference } from '../../../lib/format';
import { usePaystackScript } from '../../../lib/usePaystackScript';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export default function CheckoutPage() {
  const { items, subtotal, personalization, updatePersonalization, clearCart, hydrated } = useCart();
  const router = useRouter();
  const paystackReady = usePaystackScript();

  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const personalizationComplete =
    personalization.gender &&
    personalization.greetingId &&
    (personalization.greetingText || '').trim().length > 0;

  const shippingComplete =
    shipping.name.trim() && shipping.email.trim() && shipping.phone.trim() && shipping.address.trim();

  const canPay = personalizationComplete && shippingComplete && items.length > 0 && !submitting;

  const orderMetadata = useMemo(
    () => ({
      custom_fields: [
        { display_name: 'Gender Theme', variable_name: 'gender', value: personalization.gender },
        { display_name: 'Greeting Message', variable_name: 'greeting', value: personalization.greetingText },
        {
          display_name: 'Assembly / Delivery Notes',
          variable_name: 'assembly_notes',
          value: personalization.assemblyNotes || 'None provided',
        },
        {
          display_name: 'Shipping Address',
          variable_name: 'address',
          value: shipping.address,
        },
      ],
      cart: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    }),
    [items, personalization, shipping.address]
  );

  const handlePay = () => {
    setError('');

    if (!PUBLIC_KEY || PUBLIC_KEY.includes('xxxx')) {
      setError(
        'Payment isn\u2019t configured yet — add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY and PAYSTACK_SECRET_KEY to your environment variables (see README).'
      );
      return;
    }
    if (!paystackReady || !window.PaystackPop) {
      setError('Payment provider is still loading — try again in a moment.');
      return;
    }

    setSubmitting(true);
    const reference = generateReference();

    const handler = window.PaystackPop.setup({
      key: PUBLIC_KEY,
      email: shipping.email,
      amount: Math.round(subtotal * 100), // kobo
      currency: 'NGN',
      ref: reference,
      channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      metadata: orderMetadata,
      callback: (response) => {
        fetch(`/api/paystack/verify?reference=${encodeURIComponent(response.reference)}`)
          .then((r) => r.json())
          .then((data) => {
            setSubmitting(false);
            if (data.status) {
              clearCart();
              router.push(`/order-success?ref=${encodeURIComponent(response.reference)}`);
            } else {
              setError('We could not confirm this payment. Please contact support with your reference: ' + response.reference);
            }
          })
          .catch(() => {
            setSubmitting(false);
            setError('Payment verification failed. Please contact support with your reference: ' + response.reference);
          });
      },
      onClose: () => setSubmitting(false),
    });
    handler.openIframe();
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Nothing to check out yet</h1>
        <p className="text-charcoal/60 font-body mb-8">Your cart is empty.</p>
        <Link
          href="/shop"
          className="focus-ring inline-block rounded-full bg-lavender text-white px-7 py-3 font-body text-sm uppercase tracking-wide hover:bg-lavender-600 transition-colors"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
      <h1 className="font-display text-4xl mb-10">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-8">
          {/* Shipping */}
          <div className="rounded-2xl border border-lavender-100 bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl mb-1">Recipient &amp; delivery</h2>
            <p className="text-sm text-charcoal/50 font-body mb-6">
              Who should we send this to, and where.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name *">
                <input
                  className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
                  value={shipping.name}
                  onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                />
              </Field>
              <Field label="Email *">
                <input
                  type="email"
                  className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
                  value={shipping.email}
                  onChange={(e) => setShipping((s) => ({ ...s, email: e.target.value }))}
                />
              </Field>
              <Field label="Phone *">
                <input
                  className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
                  value={shipping.phone}
                  onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                />
              </Field>
              <Field label="Delivery address *">
                <input
                  className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
                  value={shipping.address}
                  onChange={(e) => setShipping((s) => ({ ...s, address: e.target.value }))}
                />
              </Field>
            </div>
          </div>

          {/* Personalization (mandatory survey) */}
          <PersonalizationForm value={personalization} onChange={updatePersonalization} />
        </div>

        {/* Order summary + pay */}
        <aside className="lg:sticky lg:top-28 h-fit rounded-2xl border border-lavender-100 bg-white p-6">
          <h2 className="font-display text-xl mb-4">Order summary</h2>
          <ul className="space-y-2 mb-4 font-body text-sm">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between">
                <span className="text-charcoal/70">{i.qty}× {i.name}</span>
                <span>{formatNaira(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-charcoal/10 pt-4 flex justify-between font-body mb-6">
            <span className="text-charcoal/60">Total</span>
            <span className="font-display text-xl">{formatNaira(subtotal)}</span>
          </div>

          {error && (
            <p className="text-xs text-lavender-600 font-body mb-4 bg-lavender-50 border border-lavender-200 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={!canPay}
            className="focus-ring w-full rounded-full bg-lavender text-white py-3 font-body text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-lavender-600 transition-colors mb-3"
          >
            {submitting ? 'Processing…' : `Pay ${formatNaira(subtotal)}`}
          </button>
          <p className="text-[11px] text-charcoal/40 font-body text-center">
            Secure payment via Paystack — Card, Bank Transfer &amp; USSD accepted.
          </p>
          {!personalizationComplete && (
            <p className="text-[11px] text-gold-700 font-body text-center mt-2">
              Complete the personalization survey above to enable payment.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
