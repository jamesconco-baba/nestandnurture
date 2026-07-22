import { NextResponse } from 'next/server';
import { getSessionUserId, USER_COOKIE } from '../../../../lib/auth';
import { getUserById, sanitizeUser } from '../../../../lib/userStore';

export async function GET(request) {
  const token = request.cookies.get(USER_COOKIE)?.value;
  const userId = await getSessionUserId(token);
  if (!userId) return NextResponse.json({ ok: true, user: null });

  const user = await getUserById(userId);
  return NextResponse.json({ ok: true, user: sanitizeUser(user) });
}
