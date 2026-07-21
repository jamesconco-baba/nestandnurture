'use client';

import { useEffect, useState } from 'react';

const SCRIPT_SRC = 'https://js.paystack.co/v1/inline.js';

export function usePaystackScript() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.PaystackPop) {
      setReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => setReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  return ready;
}
