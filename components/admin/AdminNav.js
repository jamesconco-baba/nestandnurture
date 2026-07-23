'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NestMark from '../NestMark';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/scoops', label: 'Mystery Scoops' },
  { href: '/admin/discounts', label: 'Discounts' },
  { href: '/admin/users', label: 'Customers' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="border-b border-charcoal/10 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2 focus-ring rounded">
            <NestMark className="w-7 h-7" />
            <span className="font-display text-lg">Admin</span>
          </Link>
          <nav className="hidden sm:flex gap-6 text-sm font-body">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`focus-ring rounded transition-colors ${
                  pathname === l.href ? 'text-lavender font-semibold' : 'text-charcoal/60 hover:text-lavender'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-body text-charcoal/50 hover:text-lavender focus-ring rounded">
            View site →
          </Link>
          <button
            onClick={logout}
            className="focus-ring text-xs font-body uppercase tracking-wide border border-charcoal/20 rounded-full px-4 py-2 hover:border-lavender hover:text-lavender transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
      <nav className="sm:hidden flex gap-5 px-5 pb-3 text-sm font-body">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? 'text-lavender font-semibold' : 'text-charcoal/60'}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
