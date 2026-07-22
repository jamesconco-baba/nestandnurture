'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NestMark from '../../../components/NestMark';
import GoogleButton from '../../../components/GoogleButton';
import { useAuth } from '../../../context/AuthContext';
import { getAuthErrorMessage } from '../../../lib/authErrors';

function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
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

    if (form.password !== form.confirm) {
      setError('Passwords don\u2019t match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || 'Could not create your account.');
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
          <h1 className="font-display text-2xl">Create your account</h1>
          <p className="text-sm text-charcoal/50 font-body mt-1 text-center">
            So we can keep every order — and anything waiting in your cart — attached to you.
          </p>
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
          <Field label="Full name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body"
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body"
            />
          </Field>
          <Field label="Confirm password" last>
            <input
              required
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
              className="focus-ring w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm font-body"
            />
          </Field>

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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm font-body text-charcoal/50">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-lavender hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children, last }) {
  return (
    <label className={`block ${last ? 'mb-4' : 'mb-4'}`}>
      <span className="block text-xs uppercase tracking-wide text-gold-700 font-body mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
