import { redis, kvConfigured } from './kv';

const cartKey = (userId) => `nn:cart:${userId}`;
const CARTS_INDEX = 'nn:carts:index';

export async function saveUserCart(userId, cartData) {
  if (!kvConfigured || !userId) return;
  try {
    if (!cartData.items || cartData.items.length === 0) {
      await redis.del(cartKey(userId));
      await redis.srem(CARTS_INDEX, userId);
      return;
    }
    await redis.set(cartKey(userId), {
      ...cartData,
      userId,
      updatedAt: new Date().toISOString(),
    });
    await redis.sadd(CARTS_INDEX, userId);
  } catch (err) {
    console.error('[cartStore] save failed:', err);
  }
}

export async function deleteUserCart(userId) {
  if (!kvConfigured || !userId) return;
  try {
    await redis.del(cartKey(userId));
    await redis.srem(CARTS_INDEX, userId);
  } catch (err) {
    console.error('[cartStore] delete failed:', err);
  }
}

export async function getAllUserCarts() {
  if (!kvConfigured) return [];
  try {
    const userIds = await redis.smembers(CARTS_INDEX);
    if (!userIds || userIds.length === 0) return [];
    const carts = await Promise.all(userIds.map((id) => redis.get(cartKey(id))));
    return carts
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  } catch (err) {
    console.error('[cartStore] list failed:', err);
    return [];
  }
}
