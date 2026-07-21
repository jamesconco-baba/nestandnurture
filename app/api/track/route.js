import { NextResponse } from 'next/server';
import { recordVisit } from '../../../lib/analytics';

export async function POST(request) {
  let pathname = '/';
  try {
    const body = await request.json();
    if (typeof body.pathname === 'string' && body.pathname.length > 0) {
      pathname = body.pathname;
    }
  } catch (e) {
    // no/invalid body — fall back to '/'
  }

  await recordVisit(pathname);
  return NextResponse.json({ ok: true });
}
