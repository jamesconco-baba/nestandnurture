'use client';

import { useEffect, useState } from 'react';
import { CATEGORIES } from '../../../../lib/products';
import { formatNaira } from '../../../../lib/format';

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [newItem, setNewItem] = useState({ name: '', category: CATEGORIES[0], price: '' });
  const [savingNew, setSavingNew] = useState(false);

  const load = () => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products || []);
        setKvConfigured(Boolean(d.kvConfigured));
      })
      .catch(() => setError('Could not load products.'));
  };

  useEffect(load, []);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2500);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setDraft({ name: p.name, category: p.category, price: p.price });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async (id) => {
    setError('');
    const res = await fetch('/api/admin/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...draft }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message || 'Update failed');
      return;
    }
    setProducts(data.products);
    cancelEdit();
    flash('Item updated');
  };

  const deleteItem = async (id) => {
    if (!confirm('Remove this item from the catalog?')) return;
    setError('');
    const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message || 'Delete failed');
      return;
    }
    setProducts(data.products);
    flash('Item removed');
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    setSavingNew(true);
    setError('');
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newItem, price: Number(newItem.price) || 0 }),
    });
    const data = await res.json();
    setSavingNew(false);
    if (!res.ok || !data.ok) {
      setError(data.message || 'Could not add item');
      return;
    }
    setProducts(data.products);
    setNewItem({ name: '', category: CATEGORIES[0], price: '' });
    flash('Item added');
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl mb-1">Products</h1>
        <p className="text-sm text-charcoal/50 font-body">
          Add, edit, or remove items from the Unit Shop &amp; Build-a-Gift catalog.
        </p>
      </header>

      {!kvConfigured && (
        <div className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Changes won&apos;t be saved yet.</p>
          <p>
            Connect a Redis database from the Vercel Marketplace (Storage tab → Upstash Redis)
            and redeploy. Until then this page shows the built-in catalog, read-only.
          </p>
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

      {/* Add new item */}
      <form
        onSubmit={addItem}
        className="mb-8 rounded-2xl border border-lavender-100 bg-white p-6 grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 items-end"
      >
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
            New item name
          </span>
          <input
            value={newItem.name}
            onChange={(e) => setNewItem((s) => ({ ...s, name: e.target.value }))}
            className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            placeholder="e.g. Muslin Swaddle"
          />
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
            Category
          </span>
          <select
            value={newItem.category}
            onChange={(e) => setNewItem((s) => ({ ...s, category: e.target.value }))}
            className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
            Price (₦)
          </span>
          <input
            type="number"
            min="0"
            value={newItem.price}
            onChange={(e) => setNewItem((s) => ({ ...s, price: e.target.value }))}
            className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2 text-sm font-body"
            placeholder="0"
          />
        </label>
        <button
          type="submit"
          disabled={savingNew || !kvConfigured || !newItem.name.trim()}
          className="focus-ring rounded-full bg-lavender text-white px-6 py-2.5 font-body text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-lavender-600 transition-colors whitespace-nowrap"
        >
          {savingNew ? 'Adding…' : 'Add item'}
        </button>
      </form>

      {/* Catalog table */}
      {!products ? (
        <p className="text-sm text-charcoal/40 font-body py-10 text-center">Loading catalog…</p>
      ) : (
        <div className="rounded-2xl border border-lavender-100 bg-white overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-gold-700">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className="border-t border-charcoal/5">
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          className="focus-ring w-full rounded border border-charcoal/15 px-2 py-1"
                        />
                      ) : (
                        p.name
                      )}
                    </td>
                    <td className="px-5 py-3 text-charcoal/60">
                      {isEditing ? (
                        <select
                          value={draft.category}
                          onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                          className="focus-ring w-full rounded border border-charcoal/15 px-2 py-1 bg-white"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        p.category
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          value={draft.price}
                          onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                          className="focus-ring w-28 rounded border border-charcoal/15 px-2 py-1"
                        />
                      ) : (
                        formatNaira(p.price)
                      )}
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(p.id)}
                            className="focus-ring text-lavender hover:underline mr-4"
                          >
                            Save
                          </button>
                          <button onClick={cancelEdit} className="focus-ring text-charcoal/40 hover:underline">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(p)}
                            disabled={!kvConfigured}
                            className="focus-ring text-lavender hover:underline mr-4 disabled:opacity-30 disabled:no-underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(p.id)}
                            disabled={!kvConfigured}
                            className="focus-ring text-charcoal/40 hover:text-lavender-600 hover:underline disabled:opacity-30 disabled:no-underline"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
