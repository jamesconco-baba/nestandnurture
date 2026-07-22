import { NextResponse } from 'next/server';
import { createUser, sanitizeUser } from '../../../../lib/userStore';
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
  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const password = body.password || '';

  if (!name || !email || !email.includes('@')) {
    return NextResponse.json({ ok: false, message: 'Please provide your name and a valid email.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, message: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  try {
    const user = await createUser({ name, email, password });
    const token = await createSession(user.id);
    const res = NextResponse.json({ ok: true, user: sanitizeUser(user) });
    res.cookies.set(USER_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, message: err.message || 'Could not create account' }, { status: 400 });
  }
}
