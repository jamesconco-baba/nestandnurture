import { NextResponse } from 'next/server';
import { getSessionUserId, USER_COOKIE } from '../../../../lib/auth';
import { getUserById } from '../../../../lib/userStore';
import { saveUserCart } from '../../../../lib/cartStore';

export async function POST(request) {
  const token = request.cookies.get(USER_COOKIE)?.value;
  const userId = await getSessionUserId(token);
  if (!userId) return NextResponse.json({ ok: false, message: 'Not signed in' }, { status: 401 });

  const user = await getUserById(userId);
  if (!user) return NextResponse.json({ ok: false, message: 'Account not found' }, { status: 404 });

  const body = await request.json().catch(() => ({}));

  await saveUserCart(userId, {
    items: Array.isArray(body.items) ? body.items : [],
    personalization: body.personalization || {},
    subtotal: Number(body.subtotal) || 0,
    customerName: user.name,
    customerEmail: user.email,
  });

  return NextResponse.json({ ok: true });
}
