import { NextResponse } from 'next/server';
import {
  findDiscountByCode,
  validateDiscountForOrder,
  computeDiscountAmount,
} from '../../../../lib/discountStore';
import { getSessionUserId, USER_COOKIE } from '../../../../lib/auth';
import { hasUserUsedDiscount } from '../../../../lib/orderStore';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const code = (body.code || '').trim();
  const subtotal = Number(body.subtotal) || 0;

  if (!code) {
    return NextResponse.json({ ok: false, message: 'Enter a discount code.' }, { status: 400 });
  }

  const discount = await findDiscountByCode(code);

  let alreadyUsedByCustomer = false;
  if (discount?.oncePerCustomer) {
    const token = request.cookies.get(USER_COOKIE)?.value;
    const userId = await getSessionUserId(token);
    if (!userId) {
      // This code is limited to one use per customer, which we can only check for a signed-in
      // account — checkout already requires login before reaching this point, so this only
      // triggers if the endpoint is called out of that normal flow.
      return NextResponse.json(
        { ok: false, message: 'Please log in to use this code.' },
        { status: 401 }
      );
    }
    alreadyUsedByCustomer = await hasUserUsedDiscount(userId, discount.code);
  }

  const check = validateDiscountForOrder(discount, subtotal, { alreadyUsedByCustomer });
  if (!check.valid) {
    return NextResponse.json({ ok: false, message: check.message }, { status: 400 });
  }

  const discountAmount = computeDiscountAmount(discount, subtotal);

  return NextResponse.json({
    ok: true,
    discount: {
      code: discount.code,
      type: discount.type,
      value: discount.value,
      description: discount.description,
    },
    discountAmount,
    newTotal: Math.max(0, subtotal - discountAmount),
  });
}
