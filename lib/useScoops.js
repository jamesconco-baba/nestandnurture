'use client';

import { useEffect, useState } from 'react';
import { MYSTERY_SCOOPS as DEFAULT_SCOOPS } from './scoops';

export function useScoops() {
  const [scoops, setScoops] = useState(DEFAULT_SCOOPS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/scoops', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && Array.isArray(d.scoops) && d.scoops.length > 0) {
          setScoops(d.scoops);
        }
      })
      .catch(() => {
        // Keep the static fallback if the API call fails for any reason.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { scoops, loading };
}
