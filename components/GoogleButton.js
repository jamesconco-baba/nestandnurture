export default function GoogleButton({ redirect = '/' }) {
  return (
    <a
      href={`/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
      className="focus-ring w-full flex items-center justify-center gap-3 rounded-full border border-charcoal/15 py-3 font-body text-sm text-charcoal hover:border-lavender hover:text-lavender transition-colors"
    >
      <GoogleIcon />
      Continue with Google
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.93c1.71-1.58 2.7-3.9 2.7-6.64z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.93-2.27c-.81.54-1.85.86-3.03.86-2.33 0-4.3-1.57-5.01-3.68H.96v2.34C2.44 15.98 5.48 18 9 18z" />
      <path fill="#FBBC05" d="M3.99 10.73A5.4 5.4 0 013.71 9c0-.6.1-1.19.28-1.73V4.93H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.07l3.03-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.93l3.03 2.34C4.7 5.15 6.67 3.58 9 3.58z" />
    </svg>
  );
}
