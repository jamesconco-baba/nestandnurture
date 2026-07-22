import { NextResponse } from 'next/server';
import { exchangeCodeForTokens, fetchGoogleUserInfo, googleConfigured } from '../../../../../lib/googleAuth';
import { findOrCreateGoogleUser } from '../../../../../lib/userStore';
import { createSession, USER_COOKIE, SESSION_COOKIE_OPTIONS } from '../../../../../lib/auth';
import { kvConfigured } from '../../../../../lib/kv';

const STATE_COOKIE = 'nn_oauth_state';

function getOrigin(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = getOrigin(request);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const googleError = searchParams.get('error');

  let redirect = '/';
  let nonce = null;
  try {
    if (stateParam) {
      const parsed = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf8'));
      redirect = parsed.redirect || '/';
      nonce = parsed.nonce;
    }
  } catch (err) {
    // malformed state — falls through to the mismatch check below, which fails safely
  }

  const failRedirect = (reason) => {
    const url = new URL('/login', origin);
    url.searchParams.set('redirect', redirect);
    url.searchParams.set('error', reason);
    const res = NextResponse.redirect(url);
    res.cookies.set(STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  };

  if (googleError) return failRedirect(`google_${googleError}`);
  if (!kvConfigured) return failRedirect('accounts_not_configured');
  if (!googleConfigured) return failRedirect('google_not_configured');
  if (!code || !stateParam) return failRedirect('google_missing_code');

  const cookieNonce = request.cookies.get(STATE_COOKIE)?.value;
  if (!nonce || !cookieNonce || nonce !== cookieNonce) {
    return failRedirect('google_state_mismatch');
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    const tokens = await exchangeCodeForTokens({ code, redirectUri });
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!profile.email) return failRedirect('google_no_email');

    const user = await findOrCreateGoogleUser({
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      googleId: profile.sub,
    });

    const token = await createSession(user.id);
    const res = NextResponse.redirect(new URL(redirect, origin));
    res.cookies.set(USER_COOKIE, token, SESSION_COOKIE_OPTIONS);
    res.cookies.set(STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  } catch (err) {
    console.error('[auth/google/callback] failed:', err);
    return failRedirect('google_failed');
  }
}
