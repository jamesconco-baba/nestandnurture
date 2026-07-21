import Link from 'next/link';
import NestMark from './NestMark';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gold-200 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid gap-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <NestMark className="w-8 h-8" />
            <span className="font-display text-lg">Nest &amp; Nurture</span>
          </div>
          <p className="mt-3 text-sm text-charcoal/60 font-body max-w-xs">
            Curated, thoughtful gifting for new mums and their newborns — from a
            single keepsake to a fully mysterious surprise scoop.
          </p>
        </div>
        <div className="font-body text-sm">
          <p className="uppercase tracking-wide text-gold-700 mb-3">Shop</p>
          <ul className="space-y-2 text-charcoal/70">
            <li><Link href="/shop" className="hover:text-lavender focus-ring rounded">Unit Shop</Link></li>
            <li><Link href="/build-a-gift" className="hover:text-lavender focus-ring rounded">Build-a-Gift Pack</Link></li>
            <li><Link href="/mystery-scoop" className="hover:text-lavender focus-ring rounded">Mystery Scoops</Link></li>
          </ul>
        </div>
        <div className="font-body text-sm">
          <p className="uppercase tracking-wide text-gold-700 mb-3">Mystery Scoop Baby Gifts</p>
          <p className="text-charcoal/70">
            Card, cash transfer & USSD accepted at checkout.<br />
            Every order includes a personalization survey so we get the
            gender, greeting and delivery details right.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-charcoal/40 font-body pb-8">
        © {new Date().getFullYear()} Nest &amp; Nurture. All rights reserved.
      </div>
    </footer>
  );
}
