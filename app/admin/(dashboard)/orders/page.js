'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatNaira } from '../../../../lib/format';

const STATUS_TABS = [
  { id: 'waiting_to_ship', label: 'Waiting to Ship' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'completed', label: 'Completed' },
  { id: 'carts', label: 'Waiting in Carts' },
];

const STATUS_OPTIONS = ['waiting_to_ship', 'shipped', 'delivered', 'completed'];
const STATUS_LABELS = {
  waiting_to_ship: 'Waiting to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
};

export default function AdminOrdersPage() {
  const [tab, setTab] = useState('waiting_to_ship');
  const [orders, setOrders] = useState(null);
  const [carts, setCarts] = useState(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = () => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setKvConfigured(Boolean(d.kvConfigured));
      })
      .catch(() => setError('Could not load orders.'));
  };

  const loadCarts = () => {
    fetch('/api/admin/carts')
      .then((r) => r.json())
      .then((d) => setCarts(d.carts || []))
      .catch(() => setError('Could not load carts.'));
  };

  useEffect(() => {
    loadOrders();
    loadCarts();
  }, []);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2500);
  };

  const filteredOrders = useMemo(() => {
    if (!orders || tab === 'carts') return [];
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  const changeStatus = async (order, status) => {
    setError('');
    setUpdatingId(order.id);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Could not update order');
        return;
      }
      setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
      flash(`Moved to ${STATUS_LABELS[status]}`);
    } catch (err) {
      setError('Could not update order — check your connection.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl mb-1">Orders</h1>
        <p className="text-sm text-charcoal/50 font-body">
          Track every paid order through fulfillment, and see what customers have waiting in
          their carts.
        </p>
      </header>

      {!kvConfigured && (
        <div className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Order storage isn&apos;t connected yet.</p>
          <p>Connect Redis (Storage tab → Upstash Redis) and redeploy to start seeing orders here.</p>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-lavender-600 font-body bg-lavender-50 border border-lavender-200 rounded-lg p-3">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 text-sm text-gold-700 font-body bg-gold-50 border border-gold-200 rounded-lg p-3">
          {notice}
        </p>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((t) => {
          const count =
            t.id === 'carts'
              ? carts?.length
              : orders?.filter((o) => o.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`focus-ring rounded-full px-4 py-2 text-xs uppercase tracking-wide font-body border transition-colors ${
                tab === t.id
                  ? 'bg-lavender text-white border-lavender'
                  : 'border-charcoal/15 text-charcoal/70 hover:border-lavender'
              }`}
            >
              {t.label}
              {typeof count === 'number' && (
                <span className="ml-1.5 opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'carts' ? (
        <CartsList carts={carts} />
      ) : (
        <OrdersList
          orders={filteredOrders}
          loaded={Boolean(orders)}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          updatingId={updatingId}
          onChangeStatus={changeStatus}
        />
      )}
    </div>
  );
}

function OrdersList({ orders, loaded, expandedId, setExpandedId, updatingId, onChangeStatus }) {
  if (!loaded) {
    return <p className="text-sm text-charcoal/40 font-body py-10 text-center">Loading orders…</p>;
  }
  if (orders.length === 0) {
    return (
      <p className="text-sm text-charcoal/40 font-body py-10 text-center">
        No orders in this stage yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const isOpen = expandedId === o.id;
        return (
          <div key={o.id} className="rounded-xl border border-lavender-100 bg-white overflow-hidden">
            <button
              onClick={() => setExpandedId(isOpen ? null : o.id)}
              className="focus-ring w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div>
                <p className="font-display text-lg">
                  {o.recipient?.name || o.accountName || 'Unnamed order'}
                </p>
                <p className="text-xs text-charcoal/50 font-body">
                  {o.accountEmail || o.recipient?.email} &middot;{' '}
                  {new Date(o.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-body font-semibold">{formatNaira(o.amount)}</span>
                <span className="text-charcoal/30 text-sm">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-charcoal/5 px-5 py-4 bg-lavender-50/40 text-sm font-body space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gold-700 mb-1">Recipient</p>
                    <p>{o.recipient?.name || '—'}</p>
                    <p className="text-charcoal/60">{o.recipient?.phone}</p>
                    <p className="text-charcoal/60">{o.recipient?.address}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gold-700 mb-1">Account holder</p>
                    <p>{o.accountName || 'Guest / unlinked'}</p>
                    <p className="text-charcoal/60">{o.accountEmail}</p>
                  </div>
                </div>

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

                {(o.personalization?.greetingText || o.personalization?.assemblyNotes) && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gold-700 mb-1">Personalization</p>
                    {o.personalization?.gender && (
                      <p className="text-charcoal/70">Theme: {o.personalization.gender}</p>
                    )}
                    {o.personalization?.greetingText && (
                      <p className="text-charcoal/70">
                        Greeting: &ldquo;{o.personalization.greetingText}&rdquo;
                      </p>
                    )}
                    {o.personalization?.assemblyNotes && (
                      <p className="text-charcoal/70">Notes: {o.personalization.assemblyNotes}</p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-charcoal/5">
                  <label className="text-xs uppercase tracking-wide text-gold-700">Status</label>
                  <select
                    value={o.status}
                    disabled={updatingId === o.id}
                    onChange={(e) => onChangeStatus(o, e.target.value)}
                    className="focus-ring rounded-lg border border-charcoal/15 px-3 py-1.5 text-sm font-body bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <span className="text-xs text-charcoal/40 ml-auto">Ref: {o.paymentReference}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CartsList({ carts }) {
  if (!carts) {
    return <p className="text-sm text-charcoal/40 font-body py-10 text-center">Loading carts…</p>;
  }
  if (carts.length === 0) {
    return (
      <p className="text-sm text-charcoal/40 font-body py-10 text-center">
        No signed-in customers currently have items waiting in their cart.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-charcoal/40 font-body mb-4">
        Only carts from signed-in customers appear here — guest browsing isn&apos;t tracked.
      </p>
      <div className="space-y-3">
        {carts.map((c) => (
          <div key={c.userId} className="rounded-xl border border-lavender-100 bg-white px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-display text-lg">{c.customerName}</p>
                <p className="text-xs text-charcoal/50 font-body">
                  {c.customerEmail} &middot; updated {new Date(c.updatedAt).toLocaleString()}
                </p>
              </div>
              <span className="font-body font-semibold">{formatNaira(c.subtotal)}</span>
            </div>
            <ul className="text-sm font-body text-charcoal/60 space-y-1">
              {(c.items || []).map((it) => (
                <li key={it.key} className="flex justify-between">
                  <span>{it.qty}× {it.name}</span>
                  <span>{formatNaira(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
