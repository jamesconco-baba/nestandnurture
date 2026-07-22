'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NestMark from '../../../components/NestMark';
import GoogleButton from '../../../components/GoogleButton';
import { useAuth } from '../../../context/AuthContext';
import { getAuthErrorMessage } from '../../../lib/authErrors';

function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get('redirect') || '/';
  const oauthError = getAuthErrorMessage(params.get('error'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Could not log in.');
        setLoading(false);
        return;
      }
      setUser(data.user);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError('Could not reach the server — try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-lavender-100 bg-white p-8">
        <div className="flex flex-col items-center mb-6">
          <NestMark className="w-10 h-10 mb-3" />
          <h1 className="font-display text-2xl">Welcome back</h1>
          <p className="text-sm text-charcoal/50 font-body mt-1">Log in to continue</p>
        </div>

        {oauthError && (
          <p className="text-xs text-lavender-600 font-body mb-4 bg-lavender-50 border border-lavender-200 rounded-lg p-3">
            {oauthError}
          </p>
        )}

        <GoogleButton redirect={redirect} />

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-charcoal/10" />
          <span className="text-xs text-charcoal/40 font-body">or</span>
          <span className="h-px flex-1 bg-charcoal/10" />
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Email
            </span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
              Password
            </span>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body"
            />
          </label>

          {error && (
            <p className="text-xs text-lavender-600 font-body mb-4 bg-lavender-50 border border-lavender-200 rounded-lg p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-full bg-lavender text-white py-3 font-body text-sm uppercase tracking-wide disabled:opacity-40 hover:bg-lavender-600 transition-colors mb-4"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm font-body text-charcoal/50">
          New here?{' '}
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-lavender hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
