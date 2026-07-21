'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NestMark from '../../../components/NestMark';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Something went wrong');
        setLoading(false);
        return;
      }
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('Could not reach the server — try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-lavender-100 bg-white p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <NestMark className="w-10 h-10 mb-3" />
          <h1 className="font-display text-2xl">Nest &amp; Nurture Admin</h1>
          <p className="text-sm text-charcoal/50 font-body mt-1">Sign in to manage the store</p>
        </div>

        <label className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-2">
          Password
        </label>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body mb-4"
        />

        {error && (
          <p className="text-xs text-lavender-600 font-body mb-4 bg-lavender-50 border border-lavender-200 rounded-lg p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="focus-ring w-full rounded-full bg-lavender text-white py-3 font-body text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-lavender-600 transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
