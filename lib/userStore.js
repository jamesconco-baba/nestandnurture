import crypto from 'crypto';
import { redis, kvConfigured } from './kv';

const USERS_BY_EMAIL_KEY = 'nn:users'; // hash: email -> user object
const USERS_BY_ID_KEY = 'nn:users:byid'; // hash: id -> email

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(check, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function createUser({ name, email, password }) {
  if (!kvConfigured) throw new Error('Accounts are not configured yet.');
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await redis.hget(USERS_BY_EMAIL_KEY, normalizedEmail);
  if (existing) throw new Error('An account with this email already exists — try logging in instead.');

  const user = {
    id: `u${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await redis.hset(USERS_BY_EMAIL_KEY, { [normalizedEmail]: user });
  await redis.hset(USERS_BY_ID_KEY, { [user.id]: normalizedEmail });
  return user;
}

export async function findUserByEmail(email) {
  if (!kvConfigured || !email) return null;
  const user = await redis.hget(USERS_BY_EMAIL_KEY, email.trim().toLowerCase());
  return user || null;
}

export async function getUserById(id) {
  if (!kvConfigured || !id) return null;
  const email = await redis.hget(USERS_BY_ID_KEY, id);
  if (!email) return null;
  return findUserByEmail(email);
}

export async function verifyCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  return verifyPassword(password, user.passwordHash) ? user : null;
}
