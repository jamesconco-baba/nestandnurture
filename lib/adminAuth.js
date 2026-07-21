export const ADMIN_COOKIE = 'nn_admin_session';

// The admin "session" is a single shared secret (ADMIN_SESSION_SECRET) written into an
// httpOnly cookie on successful login. It's intentionally simple — one password for the
// business owner, not per-user accounts — appropriate for a small boutique storefront.
// If you need multiple admin accounts or finer-grained roles later, swap this for NextAuth.
export function isAuthorized(request) {
  const expected = process.env.ADMIN_SESSION_SECRET;
  if (!expected) return false;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  return Boolean(cookie) && cookie === expected;
}
