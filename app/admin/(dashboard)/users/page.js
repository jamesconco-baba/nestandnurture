'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatNaira } from '../../../../lib/format';

export default function AdminUsersPage() {
  const [users, setUsers] = useState(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setKvConfigured(Boolean(d.kvConfigured));
      })
      .catch(() => setError('Could not load customers.'));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl mb-1">Customers</h1>
        <p className="text-sm text-charcoal/50 font-body">
          Everyone who has created an account — whether by email/password or Google sign-in.
        </p>
      </header>

      {!kvConfigured && (
        <div className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Customer storage isn&apos;t connected yet.</p>
          <p>Connect Redis (Storage tab → Upstash Redis) and redeploy to start seeing accounts here.</p>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-lavender-600 font-body bg-lavender-50 border border-lavender-200 rounded-lg p-3">
          {error}
        </p>
      )}

      <input
        type="search"
        placeholder="Search by name or email…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="focus-ring w-full sm:w-80 rounded-full border border-charcoal/15 px-5 py-2.5 font-body text-sm bg-white mb-6"
      />

      {!users ? (
        <p className="text-sm text-charcoal/40 font-body py-10 text-center">Loading customers…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-charcoal/40 font-body py-10 text-center">
          {query ? `No customers match "${query}".` : 'No one has signed up yet.'}
        </p>
      ) : (
        <div className="rounded-2xl border border-lavender-100 bg-white overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-lavender-50 text-left text-xs uppercase tracking-wide text-gold-700">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Signed up via</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-charcoal/5">
                  <td className="px-5 py-3">{u.name}</td>
                  <td className="px-5 py-3 text-charcoal/60">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-[11px] uppercase tracking-wide rounded-full px-2.5 py-1 ${
                        u.authProvider === 'google'
                          ? 'bg-gold-50 text-gold-700'
                          : 'bg-lavender-50 text-lavender'
                      }`}
                    >
                      {u.authProvider === 'google' ? 'Google' : 'Email'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-charcoal/60">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">{u.orderCount}</td>
                  <td className="px-5 py-3">{formatNaira(u.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
