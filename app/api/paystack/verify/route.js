import { NextResponse } from 'next/server';

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

    // TODO: once verified, persist the order (with data.data.metadata containing the
    // personalization survey + cart contents) to a database or send a notification —
    // e.g. Supabase, Airtable, or an email via Resend/SendGrid.

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
