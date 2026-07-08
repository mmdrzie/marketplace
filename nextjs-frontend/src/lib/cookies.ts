const AUTH_COOKIE = 'auth-session';
const COOKIE_PATH = '/';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function setAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=true; path=${COOKIE_PATH}; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=${COOKIE_PATH}; max-age=0; SameSite=Lax`;
}
