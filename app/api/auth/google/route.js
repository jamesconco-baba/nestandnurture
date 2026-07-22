import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { googleConfigured, buildGoogleAuthUrl } from '../../../../lib/googleAuth';

const STATE_COOKIE = 'nn_oauth_state';

function getOrigin(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = getOrigin(request);
  const redirect = searchParams.get('redirect') || '/';

  if (!googleConfigured) {
    const url = new URL('/login', origin);
    url.searchParams.set('redirect', redirect);
    url.searchParams.set('error', 'google_not_configured');
    return NextResponse.redirect(url);
  }

  const nonce = crypto.randomBytes(16).toString('hex');
  const state = Buffer.from(JSON.stringify({ nonce, redirect })).toString('base64url');
  const redirectUri = `${origin}/api/auth/google/callback`;

  const res = NextResponse.redirect(buildGoogleAuthUrl({ redirectUri, state }));
  res.cookies.set(STATE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // must be 'lax', not 'strict' — this cookie needs to survive the
    // top-level redirect back from accounts.google.com
    path: '/',
    maxAge: 600, // 10 minutes is plenty for a login flow
  });
  return res;
}
