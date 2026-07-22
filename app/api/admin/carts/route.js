import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../../lib/adminAuth';
import { getAllUserCarts } from '../../../../lib/cartStore';
import { kvConfigured } from '../../../../lib/kv';

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  const carts = await getAllUserCarts();
  return NextResponse.json({ carts, kvConfigured });
}
