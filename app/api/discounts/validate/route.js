import { NextResponse } from 'next/server';
import {
  findDiscountByCode,
  validateDiscountForOrder,
  computeDiscountAmount,
} from '../../../../lib/discountStore';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const code = (body.code || '').trim();
  const subtotal = Number(body.subtotal) || 0;

  if (!code) {
    return NextResponse.json({ ok: false, message: 'Enter a discount code.' }, { status: 400 });
  }

  const discount = await findDiscountByCode(code);
  const check = validateDiscountForOrder(discount, subtotal);
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
