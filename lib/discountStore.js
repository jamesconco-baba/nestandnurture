import { redis, kvConfigured } from './kv';

const KEY = 'nn:discounts';

export async function getDiscounts() {
  if (!kvConfigured) return [];
  try {
    const stored = await redis.get(KEY);
    return Array.isArray(stored) ? stored : [];
  } catch (err) {
    console.error('[discountStore] read failed:', err);
    return [];
  }
}

async function saveDiscounts(discounts) {
  if (!kvConfigured) throw new Error('Storage is not configured.');
  await redis.set(KEY, discounts);
  return discounts;
}

export async function createDiscount({
  code,
  type,
  value,
  description,
  maxUses,
  expiresAt,
  minOrderAmount,
}) {
  if (!kvConfigured) throw new Error('Storage is not configured.');
  const discounts = await getDiscounts();
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) throw new Error('Enter a code.');
  if (discounts.some((d) => d.code === normalizedCode)) {
    throw new Error('A discount with this code already exists.');
  }

  const discount = {
    id: `disc${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    code: normalizedCode,
    type, // 'percentage' | 'fixed'
    value: Number(value),
    description: (description || '').trim(),
    maxUses: maxUses ? Number(maxUses) : null,
    usedCount: 0,
    expiresAt: expiresAt || null,
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
    active: true,
    createdAt: new Date().toISOString(),
  };

  await saveDiscounts([discount, ...discounts]);
  return discount;
}

export async function updateDiscount(id, patch) {
  if (!kvConfigured) throw new Error('Storage is not configured.');
  const discounts = await getDiscounts();
  const idx = discounts.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error('Discount not found');

  const updated = [...discounts];
  updated[idx] = { ...updated[idx], ...patch };
  await saveDiscounts(updated);
  return updated[idx];
}

export async function deleteDiscount(id) {
  if (!kvConfigured) throw new Error('Storage is not configured.');
  const discounts = await getDiscounts();
  const updated = discounts.filter((d) => d.id !== id);
  await saveDiscounts(updated);
  return updated;
}

export async function findDiscountByCode(code) {
  const discounts = await getDiscounts();
  const normalized = (code || '').trim().toUpperCase();
  return discounts.find((d) => d.code === normalized) || null;
}

export async function incrementDiscountUsage(code) {
  if (!kvConfigured || !code) return;
  try {
    const discounts = await getDiscounts();
    const normalized = code.trim().toUpperCase();
    const idx = discounts.findIndex((d) => d.code === normalized);
    if (idx === -1) return;
    const updated = [...discounts];
    updated[idx] = { ...updated[idx], usedCount: (updated[idx].usedCount || 0) + 1 };
    await saveDiscounts(updated);
  } catch (err) {
    console.error('[discountStore] increment usage failed:', err);
  }
}

export function computeDiscountAmount(discount, subtotal) {
  if (!discount) return 0;
  if (discount.type === 'percentage') {
    return Math.round((subtotal * discount.value) / 100);
  }
  return Math.min(discount.value, subtotal); // fixed amount — never exceed the subtotal
}

export function validateDiscountForOrder(discount, subtotal) {
  if (!discount) return { valid: false, message: 'That code isn\u2019t valid.' };
  if (!discount.active) return { valid: false, message: 'That code is no longer active.' };
  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    return { valid: false, message: 'That code has expired.' };
  }
  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return { valid: false, message: 'That code has reached its usage limit.' };
  }
  if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
    return {
      valid: false,
      message: `That code needs a minimum order of \u20a6${discount.minOrderAmount.toLocaleString()}.`,
    };
  }
  return { valid: true };
}
