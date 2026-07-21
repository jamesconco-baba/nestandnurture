import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from './lib/adminAuth';
import { recordVisit } from './lib/analytics';

export function middleware(request, event) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const expected = process.env.ADMIN_SESSION_SECRET;
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!expected || cookie !== expected) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Fire-and-forget page-view tracking for the public storefront. waitUntil keeps the
  // function alive long enough to finish the Redis write after the response is sent.
  event.waitUntil(recordVisit(pathname));

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and API routes (API routes that need auth check
  // it themselves; this avoids double-counting/protecting fetches that aren't page views).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
