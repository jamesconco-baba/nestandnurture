import { redis, kvConfigured } from './kv';
import { MYSTERY_SCOOPS as DEFAULT_SCOOPS } from './scoops';

const KEY = 'nn:scoops';

export async function getScoops() {
  if (!kvConfigured) return DEFAULT_SCOOPS.map((s) => ({ ...s, imageUrl: null }));
  try {
    const stored = await redis.get(KEY);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    const seeded = DEFAULT_SCOOPS.map((s) => ({ ...s, imageUrl: null }));
    await redis.set(KEY, seeded);
    return seeded;
  } catch (err) {
    console.error('[scoopStore] read failed, falling back to defaults:', err);
    return DEFAULT_SCOOPS.map((s) => ({ ...s, imageUrl: null }));
  }
}

export async function saveScoops(scoops) {
  if (!kvConfigured) {
    throw new Error('Storage is not configured — connect a Redis database first.');
  }
  await redis.set(KEY, scoops);
  return scoops;
}
