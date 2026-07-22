'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { formatNaira } from '../../../lib/format';

const IN_PROGRESS_STATUSES = ['waiting_to_ship', 'shipped', 'delivered'];

const STATUS_LABELS = {
  waiting_to_ship: 'Waiting to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('waiting_to_ship');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setError(d.message || 'Could not load your orders.');
          return;
        }
        setOrders(d.orders);
      })
      .catch(() => setError('Could not load your orders.'));
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="max-w-md mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Sign in to see your orders</h1>
        <p className="text-charcoal/60 font-body mb-8">
          Log in to track anything you&apos;ve ordered from Nest &amp; Nurture.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login?redirect=/orders"
            className="focus-ring rounded-full border border-charcoal/20 px-7 py-3 font-body text-sm uppercase tracking-wide hover:border-lavender hover:text-lavender transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup?redirect=/orders"
            className="focus-ring rounded-full bg-lavender text-white px-7 py-3 font-body text-sm uppercase tracking-wide hover:bg-lavender-600 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const waitingToShip = orders?.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)) || [];
  const completed = orders?.filter((o) => o.status === 'completed') || [];
  const visible = tab === 'waiting_to_ship' ? waitingToShip : completed;

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14">
      <header className="mb-8">
        <h1 className="font-display text-4xl mb-2">Your Orders</h1>
        <p className="text-charcoal/60 font-body">Track everything you&apos;ve ordered from us.</p>
      </header>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setTab('waiting_to_ship')}
          className={`focus-ring rounded-full px-5 py-2.5 text-xs uppercase tracking-wide font-body border transition-colors ${
            tab === 'waiting_to_ship'
              ? 'bg-lavender text-white border-lavender'
              : 'border-charcoal/15 text-charcoal/70 hover:border-lavender'
          }`}
        >
          Waiting to Ship {orders && `(${waitingToShip.length})`}
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`focus-ring rounded-full px-5 py-2.5 text-xs uppercase tracking-wide font-body border transition-colors ${
            tab === 'completed'
              ? 'bg-lavender text-white border-lavender'
              : 'border-charcoal/15 text-charcoal/70 hover:border-lavender'
          }`}
        >
          Completed {orders && `(${completed.length})`}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-lavender-600 font-body bg-lavender-50 border border-lavender-200 rounded-lg p-3">
          {error}
        </p>
      )}

      {!orders ? (
        <p className="text-sm text-charcoal/40 font-body py-16 text-center">Loading your orders…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-charcoal/40 font-body py-16 text-center">
          {tab === 'waiting_to_ship'
            ? 'Nothing waiting to ship right now.'
            : 'No completed orders yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => {
            const isOpen = expandedId === o.id;
            return (
              <div key={o.id} className="rounded-xl border border-lavender-100 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : o.id)}
                  className="focus-ring w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <div>
                    <p className="font-display text-lg">
                      Order placed {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-charcoal/50 font-body">
                      {(o.items || []).length} item{(o.items || []).length === 1 ? '' : 's'} &middot;{' '}
                      <span className="text-lavender">{STATUS_LABELS[o.status]}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-body font-semibold">{formatNaira(o.amount)}</span>
                    <span className="text-charcoal/30 text-sm">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-charcoal/5 px-5 py-4 bg-lavender-50/40 text-sm font-body space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gold-700 mb-1">Items</p>
                      <ul className="space-y-1">
                        {(o.items || []).map((it, idx) => (
                          <li key={idx} className="flex justify-between text-charcoal/70">
                            <span>{it.qty}× {it.name}</span>
                            <span>{formatNaira((it.price || 0) * (it.qty || 1))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gold-700 mb-1">Delivering to</p>
                      <p className="text-charcoal/70">{o.recipient?.name}</p>
                      <p className="text-charcoal/70">{o.recipient?.address}</p>
                    </div>
                    <p className="text-xs text-charcoal/40 pt-2 border-t border-charcoal/5">
                      Payment ref: {o.paymentReference}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
