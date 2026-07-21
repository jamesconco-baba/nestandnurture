import { Redis } from '@upstash/redis';

// Vercel's own "KV" product was retired (Dec 2024) — new projects provision Redis through
// the Vercel Marketplace (Upstash), which injects the same KV_REST_API_URL / KV_REST_API_TOKEN
// variable names for compatibility. We also accept the raw Upstash names as a fallback.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvConfigured = Boolean(url && token);

export const redis = kvConfigured ? new Redis({ url, token }) : null;
