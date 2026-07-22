'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import NestMark from './NestMark';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { href: '/shop', label: 'Unit Shop' },
  { href: '/build-a-gift', label: 'Build-a-Gift' },
  { href: '/mystery-scoop', label: 'Mystery Scoops' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-gold-200">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 focus-ring rounded">
          <NestMark className="w-9 h-9 sm:w-11 sm:h-11" />
          <span className="font-display text-xl sm:text-2xl text-charcoal leading-none">
            Nest <span className="text-lavender">&amp;</span> Nurture
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-body text-sm tracking-wide uppercase">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`focus-ring rounded transition-colors ${
                pathname === n.href ? 'text-lavender' : 'text-charcoal/80 hover:text-lavender'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-3 font-body text-sm">
              <span className="text-charcoal/60">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                className="focus-ring text-charcoal/50 hover:text-lavender underline-offset-2 hover:underline"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline focus-ring text-sm font-body text-charcoal/70 hover:text-lavender"
            >
              Log in
            </Link>
          )}
          <Link
            href="/cart"
            className="focus-ring relative flex items-center gap-2 rounded-full border border-lavender/40 px-4 py-2 text-sm font-body text-charcoal hover:bg-lavender hover:text-white transition-colors"
          >
            Cart
            {itemCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-lavender text-white text-xs">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden focus-ring rounded p-2 text-charcoal"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-gold-100 bg-cream">
          <div className="max-w-6xl mx-auto px-5 py-3 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded py-2 text-charcoal font-body"
              >
                {n.label}
              </Link>
            ))}
            <div className="border-t border-gold-100 mt-2 pt-2">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="focus-ring rounded py-2 text-charcoal font-body text-left w-full"
                >
                  Log out ({user.name.split(' ')[0]})
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded py-2 text-charcoal font-body block"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded py-2 text-charcoal font-body block"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
