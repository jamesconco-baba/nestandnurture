import crypto from 'crypto';
import { redis, kvConfigured } from './kv';

export const USER_COOKIE = 'nn_user_session';
const SESSION_PREFIX = 'nn:session:';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId) {
  if (!kvConfigured) throw new Error('Accounts are not configured yet.');
  const token = crypto.randomBytes(32).toString('hex');
  await redis.set(`${SESSION_PREFIX}${token}`, { userId }, { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function getSessionUserId(token) {
  if (!token || !kvConfigured) return null;
  try {
    const data = await redis.get(`${SESSION_PREFIX}${token}`);
    return data?.userId || null;
  } catch (err) {
    return null;
  }
}

export async function destroySession(token) {
  if (!token || !kvConfigured) return;
  await redis.del(`${SESSION_PREFIX}${token}`);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
