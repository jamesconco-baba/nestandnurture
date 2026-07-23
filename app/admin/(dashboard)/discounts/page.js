'use client';

import { useEffect, useState } from 'react';
import { formatNaira } from '../../../../lib/format';

const emptyForm = {
  code: '',
  type: 'percentage',
  value: '',
  description: '',
  maxUses: '',
  minOrderAmount: '',
  expiresAt: '',
};

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/admin/discounts')
      .then((r) => r.json())
      .then((d) => {
        setDiscounts(d.discounts || []);
        setKvConfigured(Boolean(d.kvConfigured));
      })
      .catch(() => setError('Could not load discounts.'));
  };

  useEffect(load, []);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Could not create discount');
        return;
      }
      setDiscounts(data.discounts);
      setForm(emptyForm);
      flash('Discount code created');
    } catch (err) {
      setError('Could not reach the server — try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (discount) => {
    setError('');
    const res = await fetch('/api/admin/discounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: discount.id, active: !discount.active }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message || 'Could not update discount');
      return;
    }
    setDiscounts(data.discounts);
    flash(discount.active ? 'Discount deactivated' : 'Discount activated');
  };

  const removeDiscount = async (id) => {
    if (!confirm('Delete this discount code? This can\u2019t be undone.')) return;
    setError('');
    const res = await fetch(`/api/admin/discounts?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message || 'Could not delete discount');
      return;
    }
    setDiscounts(data.discounts);
    flash('Discount deleted');
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl mb-1">Discount Codes</h1>
        <p className="text-sm text-charcoal/50 font-body">
          Create codes for different purposes — a site-wide percentage off, a one-time new-customer
          incentive, a fixed-amount promo — and customers apply them at checkout.
        </p>
      </header>

      {!kvConfigured && (
        <div className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Changes won&apos;t be saved yet.</p>
          <p>Connect a Redis database (Storage tab → Upstash Redis) and redeploy.</p>
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

      {/* Create form */}
      <form onSubmit={handleCreate} className="mb-8 rounded-2xl border border-lavender-100 bg-white p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Code
            </span>
            <div className="flex gap-2">
              <input
                value={form.code}
                onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
                placeholder="WELCOME10"
                className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body uppercase"
              />
              <button
                type="button"
                onClick={() => setForm((s) => ({ ...s, code: randomCode() }))}
                className="focus-ring shrink-0 rounded-lg border border-charcoal/15 px-3 text-xs text-charcoal/60 hover:border-lavender hover:text-lavender"
                title="Generate a random code"
              >
                Generate
              </button>
            </div>
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Type
            </span>
            <select
              value={form.type}
              onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body bg-white"
            >
              <option value="percentage">Percentage off</option>
              <option value="fixed">Fixed amount off (₦)</option>
            </select>
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              {form.type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
            </span>
            <input
              type="number"
              min="0"
              max={form.type === 'percentage' ? 100 : undefined}
              value={form.value}
              onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            />
          </label>

          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Purpose / label
            </span>
            <input
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="New user discount"
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Max uses (optional)
            </span>
            <input
              type="number"
              min="1"
              value={form.maxUses}
              onChange={(e) => setForm((s) => ({ ...s, maxUses: e.target.value }))}
              placeholder="Unlimited"
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Minimum order (₦, optional)
            </span>
            <input
              type="number"
              min="0"
              value={form.minOrderAmount}
              onChange={(e) => setForm((s) => ({ ...s, minOrderAmount: e.target.value }))}
              placeholder="None"
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            />
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Expires (optional)
            </span>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((s) => ({ ...s, expiresAt: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving || !kvConfigured || !form.code.trim() || !form.value}
          className="focus-ring rounded-full bg-lavender text-white px-6 py-2.5 font-body text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-lavender-600 transition-colors"
        >
          {saving ? 'Creating…' : 'Create discount code'}
        </button>
      </form>

      {/* Existing discounts */}
      {!discounts ? (
        <p className="text-sm text-charcoal/40 font-body py-10 text-center">Loading discounts…</p>
      ) : discounts.length === 0 ? (
        <p className="text-sm text-charcoal/40 font-body py-10 text-center">No discount codes yet.</p>
      ) : (
        <div className="rounded-2xl border border-lavender-100 bg-white overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-gold-700">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Purpose</th>
                <th className="px-5 py-3">Uses</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id} className="border-t border-charcoal/5">
                  <td className="px-5 py-3 font-semibold">{d.code}</td>
                  <td className="px-5 py-3">
                    {d.type === 'percentage' ? `${d.value}%` : formatNaira(d.value)}
                    {d.minOrderAmount > 0 && (
                      <span className="block text-xs text-charcoal/40">
                        min. {formatNaira(d.minOrderAmount)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">{d.description || '—'}</td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {d.usedCount}{d.maxUses ? ` / ${d.maxUses}` : ''}
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-[11px] uppercase tracking-wide rounded-full px-2.5 py-1 ${
                        d.active ? 'bg-lavender-50 text-lavender' : 'bg-charcoal/5 text-charcoal/40'
                      }`}
                    >
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(d)}
                      disabled={!kvConfigured}
                      className="focus-ring text-lavender hover:underline mr-4 disabled:opacity-30 disabled:no-underline"
                    >
                      {d.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => removeDiscount(d.id)}
                      disabled={!kvConfigured}
                      className="focus-ring text-charcoal/40 hover:text-lavender-600 hover:underline disabled:opacity-30 disabled:no-underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
