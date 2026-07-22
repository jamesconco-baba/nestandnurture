import { NextResponse } from 'next/server';
import { verifyCredentials, sanitizeUser } from '../../../../lib/userStore';
import { createSession, USER_COOKIE, SESSION_COOKIE_OPTIONS } from '../../../../lib/auth';
import { kvConfigured } from '../../../../lib/kv';

export async function POST(request) {
  if (!kvConfigured) {
    return NextResponse.json(
      { ok: false, message: 'Accounts aren\u2019t configured yet — connect Redis storage first (see README).' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = (body.email || '').trim();
  const password = body.password || '';

  if (!email || !password) {
    return NextResponse.json({ ok: false, message: 'Enter your email and password.' }, { status: 400 });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ ok: false, message: 'Incorrect email or password.' }, { status: 401 });
  }

  const token = await createSession(user.id);
  const res = NextResponse.json({ ok: true, user: sanitizeUser(user) });
  res.cookies.set(USER_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
