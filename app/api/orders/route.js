import { NextResponse } from 'next/server';
import { getSessionUserId, USER_COOKIE } from '../../../lib/auth';
import { getOrdersForUser } from '../../../lib/orderStore';

export async function GET(request) {
  const token = request.cookies.get(USER_COOKIE)?.value;
  const userId = await getSessionUserId(token);
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Not signed in' }, { status: 401 });
  }

  const orders = await getOrdersForUser(userId);
  return NextResponse.json({ ok: true, orders });
}
