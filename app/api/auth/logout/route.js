import { NextResponse } from 'next/server';
import { destroySession, USER_COOKIE } from '../../../../lib/auth';

export async function POST(request) {
  const token = request.cookies.get(USER_COOKIE)?.value;
  await destroySession(token);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
