import { config } from './index';

export const authConfig = {
  secret: new TextEncoder().encode(config.jwt.secret),
  accessTtl: config.jwt.accessTtl,
  refreshTtl: config.jwt.refreshTtl,
  refreshCookieName: 'refresh_token',
  refreshCookiePath: '/api/v1/auth',
  refreshCookieSameSite: 'Lax' as const,
  refreshCookieSecure: config.nodeEnv === 'production',
  refreshCookieHttpOnly: true,
  refreshCookieMaxAge: 7 * 24 * 60 * 60,
};
