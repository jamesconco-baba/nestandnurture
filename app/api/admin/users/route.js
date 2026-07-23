import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../../lib/adminAuth';
import { getAllUsers, sanitizeUser } from '../../../../lib/userStore';
import { getOrders } from '../../../../lib/orderStore';
import { kvConfigured } from '../../../../lib/kv';

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  const [users, orders] = await Promise.all([getAllUsers(), getOrders()]);

  const enriched = users
    .map((u) => {
      const userOrders = orders.filter((o) => o.userId === u.id);
      const totalSpent = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      return {
        ...sanitizeUser(u),
        orderCount: userOrders.length,
        totalSpent,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json({ users: enriched, kvConfigured });
}
