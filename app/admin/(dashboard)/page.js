'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '../../../components/admin/StatCard';
import BarList from '../../../components/admin/BarList';
import DailyChart from '../../../components/admin/DailyChart';

export default function AdminOverviewPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => {
        if (!d.configured && !d.total) setData(d);
        else setData(d);
      })
      .catch(() => setError('Could not load analytics.'));
  }, []);

  const last7 = data?.daily?.slice(-7) || [];
  const visitsLast7 = last7.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl mb-1">Overview</h1>
        <p className="text-sm text-charcoal/50 font-body">
          Traffic across the storefront, tracked since your Redis database was connected.
        </p>
      </header>

      {data && !data.configured && (
        <div className="mb-8 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Analytics storage isn&apos;t connected yet.</p>
          <p>
            Connect a Redis database from the Vercel Marketplace (Storage tab → Upstash Redis)
            and redeploy — visits and product edits will both start persisting. See the README
            for the two-minute setup.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-lavender-600 font-body mb-6">{error}</p>}

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <StatCard label="Total visits" value={data ? data.total.toLocaleString() : '—'} />
        <StatCard label="Visits, last 7 days" value={data ? visitsLast7.toLocaleString() : '—'} />
        <StatCard
          label="Pages tracked"
          value={data ? data.topPages.length.toLocaleString() : '—'}
          hint="Unique paths visited"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-2xl border border-lavender-100 bg-white p-6">
          <h2 className="font-display text-lg mb-4">Most visited pages</h2>
          <BarList items={data?.topPages} />
        </div>
        <div className="rounded-2xl border border-lavender-100 bg-white p-6">
          <h2 className="font-display text-lg mb-4">Last 14 days</h2>
          <DailyChart daily={data?.daily} />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/orders"
          className="focus-ring inline-block rounded-full bg-lavender text-white px-6 py-3 font-body text-sm uppercase tracking-wide hover:bg-lavender-600 transition-colors"
        >
          Manage orders →
        </Link>
        <Link
          href="/admin/products"
          className="focus-ring inline-block rounded-full border border-charcoal/20 px-6 py-3 font-body text-sm uppercase tracking-wide hover:border-lavender hover:text-lavender transition-colors"
        >
          Manage products →
        </Link>
      </div>
    </div>
  );
}
