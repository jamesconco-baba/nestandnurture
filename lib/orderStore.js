import { redis, kvConfigured } from './kv';

const ORDERS_KEY = 'nn:orders';

export const ORDER_STATUSES = ['waiting_to_ship', 'shipped', 'delivered', 'completed'];

export const ORDER_STATUS_LABELS = {
  waiting_to_ship: 'Waiting to Ship',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
};

export async function getOrders() {
  if (!kvConfigured) return [];
  try {
    const stored = await redis.get(ORDERS_KEY);
    return Array.isArray(stored) ? stored : [];
  } catch (err) {
    console.error('[orderStore] read failed:', err);
    return [];
  }
}

export async function getOrdersForUser(userId) {
  if (!userId) return [];
  const orders = await getOrders();
  return orders.filter((o) => o.userId === userId);
}

export async function hasUserUsedDiscount(userId, code) {
  if (!userId || !code) return false;
  const normalized = code.trim().toUpperCase();
  const orders = await getOrdersForUser(userId);
  return orders.some((o) => o.discount?.code === normalized);
}

export async function createOrder(order) {
  if (!kvConfigured) throw new Error('Order storage is not configured.');
  const orders = await getOrders();
  const newOrder = {
    id: `ord${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    status: 'waiting_to_ship',
    createdAt: new Date().toISOString(),
    ...order,
  };
  await redis.set(ORDERS_KEY, [newOrder, ...orders]);
  return newOrder;
}

export async function updateOrderStatus(id, status) {
  if (!kvConfigured) throw new Error('Order storage is not configured.');
  if (!ORDER_STATUSES.includes(status)) throw new Error('Invalid status');

  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error('Order not found');

  const updated = [...orders];
  updated[idx] = { ...updated[idx], status, updatedAt: new Date().toISOString() };
  await redis.set(ORDERS_KEY, updated);
  return updated[idx];
}
