import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../../lib/adminAuth';
import { getOrders, updateOrderStatus, ORDER_STATUSES } from '../../../../lib/orderStore';
import { kvConfigured } from '../../../../lib/kv';

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  const orders = await getOrders();
  return NextResponse.json({ orders, kvConfigured });
}

export async function PUT(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (!kvConfigured) {
    return NextResponse.json({ ok: false, message: 'Order storage is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  if (!body.id || !ORDER_STATUSES.includes(body.status)) {
    return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(body.id, body.status);
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || 'Update failed' }, { status: 400 });
  }
}
