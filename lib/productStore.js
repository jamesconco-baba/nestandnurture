import { redis, kvConfigured } from './kv';
import { PRODUCTS as DEFAULT_PRODUCTS } from './products';

const KEY = 'nn:products';

export async function getProducts() {
  if (!kvConfigured) return DEFAULT_PRODUCTS;
  try {
    const stored = await redis.get(KEY);
    if (Array.isArray(stored) && stored.length > 0) return stored;
    // First run — seed storage with the default catalog so future admin edits have
    // something to build on.
    await redis.set(KEY, DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  } catch (err) {
    console.error('[productStore] read failed, falling back to defaults:', err);
    return DEFAULT_PRODUCTS;
  }
}

export async function saveProducts(products) {
  if (!kvConfigured) {
    throw new Error('Storage is not configured — connect a Redis database first.');
  }
  await redis.set(KEY, products);
  return products;
}
