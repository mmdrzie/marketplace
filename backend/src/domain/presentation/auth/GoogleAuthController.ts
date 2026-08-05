import type { Context } from 'hono';
import { authService } from '../../services/auth.js';
import { config } from '../../../config/index.js';
import { authRoleSchema } from '../../../validation/auth.js';
import { setRefreshCookie, setOauthStateCookie, clearOauthStateCookie, getOauthStateCookie } from './authCookies.js';

const FRONTEND_URL = config.frontendUrl;

function clientMeta(c: Context) {
  return {
    ip: c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? null,
    userAgent: c.req.header('user-agent') ?? null,
  };
}

export class GoogleAuthController {
  async status(c: Context): Promise<Response> {
    return c.json({ success: true, data: authService.googleStatus() });
  }

  async authorize(c: Context): Promise<Response> {
    try {
      const redirect = c.req.query('redirect');
      // Optional role hint for brand-new accounts (AUTH_API.md §6);
      // invalid values are ignored.
      const roleParam = c.req.query('role') ?? null;
      const role = roleParam && authRoleSchema.safeParse(roleParam).success ? roleParam : null;
      const { url, tokenJti } = await authService.googleAuthorize(redirect, role);
      setOauthStateCookie(c, tokenJti);
      return c.redirect(url, 302);
    } catch (err) {
      const reason = (err as { code?: string }).code === 'BAD_REQUEST'
        ? 'not_configured'
        : 'authorize_failed';
      return c.redirect(`${FRONTEND_URL}/google-complete?mode=error&reason=${reason}`, 302);
    }
  }

  async callback(c: Context): Promise<Response> {
    const code = c.req.query('code') ?? undefined;
    const googleError = c.req.query('error') ?? undefined;
    const stateParam = c.req.query('state') ?? undefined;
    const stateJti = getOauthStateCookie(c) ?? stateParam;
    clearOauthStateCookie(c);

    if (!stateJti) {
      return c.redirect(`${FRONTEND_URL}/google-complete?mode=error&reason=invalid_state`, 302);
    }

    const result = await authService.googleCallback({
      code,
      error: googleError,
      stateJti,
      ...clientMeta(c),
    });
    return c.redirect(result.redirectUrl, 302);
  }

  async finalize(c: Context): Promise<Response> {
    const { t } = await c.req.json();
    const session = await authService.googleFinalize(t, clientMeta(c));
    setRefreshCookie(c, session.refreshToken);
    return c.json({ success: true, data: { token: session.token, user: session.user } });
  }

  async verify(c: Context): Promise<Response> {
    const { t, code } = await c.req.json();
    const session = await authService.googleVerify(t, code, clientMeta(c));
    setRefreshCookie(c, session.refreshToken);
    return c.json({ success: true, data: { token: session.token, user: session.user } });
  }

  async resend(c: Context): Promise<Response> {
    const { t } = await c.req.json();
    await authService.googleResend(t, clientMeta(c));
    return c.json({ success: true, data: null });
  }

  async link(c: Context): Promise<Response> {
    const { t, password } = await c.req.json();
    const session = await authService.googleLink(t, password, clientMeta(c));
    setRefreshCookie(c, session.refreshToken);
    return c.json({ success: true, data: { token: session.token, user: session.user } });
  }
}

export const googleAuthController = new GoogleAuthController();
