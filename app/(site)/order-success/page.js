'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import NestMark from '../../../components/NestMark';

function Success() {
  const params = useSearchParams();
  const ref = params.get('ref');

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-24 text-center">
      <NestMark className="w-14 h-14 mx-auto mb-6" />
      <h1 className="font-display text-4xl mb-4">Thank you!</h1>
      <p className="text-charcoal/60 font-body mb-2">
        Your gift is on its way to being lovingly packed and delivered.
      </p>
      {ref && (
        <p className="text-sm font-body text-charcoal/40 mb-10">
          Payment reference: <span className="font-semibold text-charcoal/60">{ref}</span>
        </p>
      )}
      <Link
        href="/"
        className="focus-ring inline-block rounded-full bg-lavender text-white px-7 py-3 font-body text-sm uppercase tracking-wide hover:bg-lavender-600 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <Success />
    </Suspense>
  );
}
