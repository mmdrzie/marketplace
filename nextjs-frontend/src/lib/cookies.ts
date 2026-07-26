const AUTH_COOKIE = 'auth-session';
const COOKIE_PATH = '/';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function setAuthCookie() {
  if (typeof document === 'undefined') return;
  const secure = isSecureContext() ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE}=true; path=${COOKIE_PATH}; max-age=${COOKIE_MAX_AGE}; SameSite=Strict${secure}`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  const secure = isSecureContext() ? '; Secure' : '';
  document.cookie = `${AUTH_COOKIE}=; path=${COOKIE_PATH}; max-age=0; SameSite=Strict${secure}`;
}
