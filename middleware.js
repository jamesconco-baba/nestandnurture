import { NextResponse } from 'next/server';

const ADMIN_COOKIE = 'nn_admin_session';

// Deliberately dependency-free: middleware always runs on Next.js's Edge runtime, which
// doesn't support every Node.js API. Keeping this file to a plain cookie comparison (no
// Redis client, no other packages) avoids any edge-bundling issues. Visit tracking lives
// in app/api/track/route.js instead, called from the client on the normal Node.js runtime.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') return NextResponse.next();

  const expected = process.env.ADMIN_SESSION_SECRET;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!expected || cookie !== expected) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
