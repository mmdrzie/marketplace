import type { Context } from 'hono';
import { authConfig } from '../../../config/auth.js';

export function setRefreshCookie(c: Context, token: string) {
  const sameSite = authConfig.refreshCookieSameSite;
  const secure = authConfig.refreshCookieSecure ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${authConfig.refreshCookieName}=${token}; HttpOnly; Path=${authConfig.refreshCookiePath}; SameSite=${sameSite}${secure}; Max-Age=${authConfig.refreshCookieMaxAge}`,
  );
}

export function clearRefreshCookie(c: Context) {
  const sameSite = authConfig.refreshCookieSameSite;
  const secure = authConfig.refreshCookieSecure ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${authConfig.refreshCookieName}=; HttpOnly; Path=${authConfig.refreshCookiePath}; SameSite=${sameSite}${secure}; Max-Age=0`,
  );
}

export function getRefreshTokenFromCookie(c: Context): string | null {
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${authConfig.refreshCookieName}=([^;]*)`));
  return match?.[1] ?? null;
}

const STATE_COOKIE_NAME = 'google_oauth_state';
const STATE_COOKIE_PATH = '/api/v1/auth/google';
const STATE_COOKIE_MAX_AGE = 10 * 60;

export function setOauthStateCookie(c: Context, jti: string) {
  const secure = authConfig.refreshCookieSecure ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${STATE_COOKIE_NAME}=${jti}; HttpOnly; Path=${STATE_COOKIE_PATH}; SameSite=Lax${secure}; Max-Age=${STATE_COOKIE_MAX_AGE}`,
  );
}

export function clearOauthStateCookie(c: Context) {
  const secure = authConfig.refreshCookieSecure ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${STATE_COOKIE_NAME}=; HttpOnly; Path=${STATE_COOKIE_PATH}; SameSite=Lax${secure}; Max-Age=0`,
  );
}

export function getOauthStateCookie(c: Context): string | null {
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE_NAME}=([^;]*)`));
  return match?.[1] ?? null;
}
