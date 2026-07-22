export const AUTH_ERROR_MESSAGES = {
  google_not_configured:
    'Google sign-in isn\u2019t set up yet — use email and password instead.',
  accounts_not_configured:
    'Accounts aren\u2019t configured yet — connect Redis storage first (see README).',
  google_state_mismatch: 'That Google sign-in link expired or was already used — please try again.',
  google_missing_code: 'Google sign-in was interrupted — please try again.',
  google_no_email:
    'Your Google account doesn\u2019t expose an email we can use — try a different account or use email/password.',
  google_access_denied: 'Google sign-in was cancelled.',
  google_failed: 'Something went wrong signing in with Google — please try again.',
};

export function getAuthErrorMessage(code) {
  if (!code) return '';
  return AUTH_ERROR_MESSAGES[code] || 'Something went wrong — please try again.';
}
