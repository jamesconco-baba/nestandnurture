import { redis, kvConfigured } from './kv';

const TOTAL_KEY = 'nn:analytics:total';
const PAGES_ZSET = 'nn:analytics:pages';
const dayKey = (isoDate) => `nn:analytics:day:${isoDate}`;

export async function recordVisit(pathname) {
  if (!kvConfigured) return;
  try {
    const today = new Date().toISOString().slice(0, 10);
    await Promise.all([
      redis.incr(TOTAL_KEY),
      redis.zincrby(PAGES_ZSET, 1, pathname || '/'),
      redis.incr(dayKey(today)),
    ]);
  } catch (err) {
    console.error('[analytics] write failed:', err);
  }
}

export async function getAnalyticsSummary() {
  if (!kvConfigured) {
    return { configured: false, total: 0, topPages: [], daily: [] };
  }
  try {
    const [total, topPagesRaw] = await Promise.all([
      redis.get(TOTAL_KEY),
      redis.zrange(PAGES_ZSET, 0, 9, { rev: true, withScores: true }),
    ]);

    const days = [];
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const dayCounts = await Promise.all(days.map((d) => redis.get(dayKey(d))));
    const daily = days.map((d, idx) => ({ date: d, count: Number(dayCounts[idx]) || 0 }));

    return {
      configured: true,
      total: Number(total) || 0,
      topPages: parseZRangeWithScores(topPagesRaw),
      daily,
    };
  } catch (err) {
    console.error('[analytics] read failed:', err);
    return { configured: true, total: 0, topPages: [], daily: [], error: true };
  }
}

// @upstash/redis has returned zrange(withScores) results in slightly different shapes across
// versions — either a flat [member, score, member, score, ...] array, or an array of
// { member, score } objects. Handle both defensively rather than pin an exact version.
function parseZRangeWithScores(raw) {
  if (!raw || raw.length === 0) return [];
  if (typeof raw[0] === 'object' && raw[0] !== null && 'member' in raw[0]) {
    return raw.map((r) => ({ path: String(r.member), count: Number(r.score) }));
  }
  const out = [];
  for (let i = 0; i < raw.length; i += 2) {
    out.push({ path: String(raw[i]), count: Number(raw[i + 1]) });
  }
  return out;
}
