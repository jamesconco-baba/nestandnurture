import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../../lib/adminAuth';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../../../lib/discountStore';
import { kvConfigured } from '../../../../lib/kv';

function unauthorized() {
  return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
}

function notConfigured() {
  return NextResponse.json(
    { ok: false, message: 'Storage is not configured — connect Redis first (see README).' },
    { status: 503 }
  );
}

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();
  const discounts = await getDiscounts();
  return NextResponse.json({ discounts, kvConfigured });
}

export async function POST(request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!kvConfigured) return notConfigured();

  const body = await request.json().catch(() => ({}));

  if (!body.code?.trim()) {
    return NextResponse.json({ ok: false, message: 'Enter a code.' }, { status: 400 });
  }
  if (!['percentage', 'fixed'].includes(body.type)) {
    return NextResponse.json({ ok: false, message: 'Choose a discount type.' }, { status: 400 });
  }
  const value = Number(body.value);
  if (!value || value <= 0) {
    return NextResponse.json({ ok: false, message: 'Enter a value greater than 0.' }, { status: 400 });
  }
  if (body.type === 'percentage' && value > 100) {
    return NextResponse.json({ ok: false, message: 'Percentage discounts can\u2019t exceed 100.' }, { status: 400 });
  }

  try {
    await createDiscount(body);
    return NextResponse.json({ ok: true, discounts: await getDiscounts() });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || 'Could not create discount' }, { status: 400 });
  }
}

export async function PUT(request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!kvConfigured) return notConfigured();

  const body = await request.json().catch(() => ({}));
  if (!body.id) {
    return NextResponse.json({ ok: false, message: 'Missing id' }, { status: 400 });
  }

  try {
    const { id, ...patch } = body;
    await updateDiscount(id, patch);
    return NextResponse.json({ ok: true, discounts: await getDiscounts() });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!kvConfigured) return notConfigured();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const discounts = await deleteDiscount(id);
  return NextResponse.json({ ok: true, discounts });
}
