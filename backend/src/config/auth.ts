import { config } from './index.js';

export const authConfig = {
  secret: new TextEncoder().encode(config.jwt.secret),
  accessTtl: config.jwt.accessTtl,
  refreshTtl: config.jwt.refreshTtl,
  refreshCookieName: 'refresh_token',
  refreshCookiePath: '/api/v1/auth',
  // Cross-site deployments (frontend/backend on different domains, e.g. Vercel)
  // require SameSite=None + Secure so the refresh cookie is sent on XHR.
  refreshCookieSameSite: process.env.REFRESH_COOKIE_SAMESITE || (config.nodeEnv === 'production' ? 'None' : 'Lax'),
  refreshCookieSecure: process.env.REFRESH_COOKIE_SECURE === 'true' || config.nodeEnv === 'production',
  refreshCookieHttpOnly: true,
  refreshCookieMaxAge: 7 * 24 * 60 * 60,
  singleSession: process.env.AUTH_SINGLE_SESSION === 'true',
};
