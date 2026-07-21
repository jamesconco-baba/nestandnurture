import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '../../../../lib/adminAuth';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const password = body.password || '';

  const expectedPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedPassword || !sessionSecret) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Admin login is not configured yet. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your environment variables (see README).',
      },
      { status: 500 }
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ ok: false, message: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
