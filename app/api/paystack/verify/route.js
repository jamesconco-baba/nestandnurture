import { NextResponse } from 'next/server';
import { getSessionUserId, USER_COOKIE } from '../../../../lib/auth';
import { getUserById } from '../../../../lib/userStore';
import { createOrder } from '../../../../lib/orderStore';
import { deleteUserCart } from '../../../../lib/cartStore';
import { incrementDiscountUsage } from '../../../../lib/discountStore';
import { kvConfigured } from '../../../../lib/kv';

function getCustomField(customFields, name) {
  return customFields?.find((f) => f.variable_name === name)?.value || '';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ status: false, message: 'Missing reference' }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { status: false, message: 'PAYSTACK_SECRET_KEY is not configured on the server' },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: 'no-store',
      }
    );
    const data = await res.json();

    if (!res.ok || !data.status) {
      return NextResponse.json(
        { status: false, message: data.message || 'Verification failed' },
        { status: 400 }
      );
    }

    const successful = data.data?.status === 'success';

    if (successful && kvConfigured) {
      try {
        const token = request.cookies.get(USER_COOKIE)?.value;
        const userId = await getSessionUserId(token);
        const user = userId ? await getUserById(userId) : null;

        const metadata = data.data?.metadata || {};
        const customFields = metadata.custom_fields || [];
        const discountCode = getCustomField(customFields, 'discount_code');

        await createOrder({
          paymentReference: data.data?.reference,
          amount: (data.data?.amount || 0) / 100,
          userId: user?.id || null,
          accountName: user?.name || null,
          accountEmail: user?.email || data.data?.customer?.email || null,
          recipient: {
            name: getCustomField(customFields, 'recipient_name'),
            phone: getCustomField(customFields, 'recipient_phone'),
            email: data.data?.customer?.email || '',
            address: getCustomField(customFields, 'address'),
          },
          personalization: {
            gender: getCustomField(customFields, 'gender'),
            greetingText: getCustomField(customFields, 'greeting'),
            assemblyNotes: getCustomField(customFields, 'assembly_notes'),
          },
          items: metadata.cart || [],
          discount: discountCode
            ? {
                code: discountCode,
                amount: Number(getCustomField(customFields, 'discount_amount')) || 0,
              }
            : null,
        });

        if (discountCode) await incrementDiscountUsage(discountCode);
        if (userId) await deleteUserCart(userId);
      } catch (err) {
        // Payment already succeeded — don't fail the response over a logging issue, but
        // make sure it's visible in server logs so the order can be added manually if needed.
        console.error('[paystack/verify] failed to persist order:', err);
      }
    }

    return NextResponse.json({
      status: successful,
      amount: data.data?.amount,
      reference: data.data?.reference,
      metadata: data.data?.metadata,
      customer: data.data?.customer,
    });
  } catch (err) {
    return NextResponse.json({ status: false, message: 'Verification request failed' }, { status: 500 });
  }
}
