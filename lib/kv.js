import { Redis } from '@upstash/redis';

// Vercel's own "KV" product was retired (Dec 2024). New projects provision Redis through the
// Vercel Marketplace (Upstash), and the exact env var names Vercel injects have varied across
// integration versions. We check every variant we've seen so this works regardless of which
// naming Vercel used when you connected the database:
//   - KV_REST_API_URL / KV_REST_API_TOKEN            (older "Vercel KV" compatibility names)
//   - UPSTASH_KV_REST_API_URL / UPSTASH_KV_REST_API_TOKEN   (current Vercel Marketplace naming)
//   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN     (raw Upstash naming)
const url =
  process.env.KV_REST_API_URL ||
  process.env.UPSTASH_KV_REST_API_URL ||
  process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.KV_REST_API_TOKEN ||
  process.env.UPSTASH_KV_REST_API_TOKEN ||
  process.env.UPSTASH_REDIS_REST_TOKEN;

export const kvConfigured = Boolean(url && token);

export const redis = kvConfigured ? new Redis({ url, token }) : null;
