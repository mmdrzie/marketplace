import { Hono, type Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authService } from '../domain/services/auth.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../errors.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validation/auth.js';

const router = new Hono();

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_PATH = '/api/v1/auth';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function setRefreshCookie(c: Context, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'None' : 'Lax';
  const secure = isProd ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${REFRESH_COOKIE}=${token}; HttpOnly; Path=${COOKIE_PATH}; SameSite=${sameSite}${secure}; Max-Age=${COOKIE_MAX_AGE}`,
  );
}

function clearRefreshCookie(c: Context) {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'None' : 'Lax';
  const secure = isProd ? '; Secure' : '';
  c.header(
    'Set-Cookie',
    `${REFRESH_COOKIE}=; HttpOnly; Path=${COOKIE_PATH}; SameSite=${sameSite}${secure}; Max-Age=0`,
  );
}

router.post('/register', rateLimiter('register'), zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, name } = c.req.valid('json');
    const result = await authService.register({ email, password, name });
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, refreshToken: result.refreshToken, user: result.user } }, 201);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && 'httpStatus' in err) {
      const appErr = err as { code: string; httpStatus: number; message: string };
      return c.json({ success: false, error: { code: appErr.code, message: appErr.message } }, appErr.httpStatus as 401 | 403 | 404 | 409 | 422 | 429 | 500);
    }
    console.error('[register] unhandled:', err);
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500);
  }
});

router.post('/login', rateLimiter('login'), zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json');
    const result = await authService.login({ email, password });
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, refreshToken: result.refreshToken, user: result.user } });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && 'httpStatus' in err) {
      const appErr = err as { code: string; httpStatus: number; message: string };
      return c.json({ success: false, error: { code: appErr.code, message: appErr.message } }, appErr.httpStatus as 401 | 403 | 404 | 409 | 422 | 429 | 500);
    }
    console.error('[login] unhandled:', err);
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500);
  }
});

router.post('/refresh', async (c) => {
  try {
    const cookie = c.req.header('Cookie') || '';
    const match = cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
    const body = await c.req.json().catch(() => ({}));
    const refreshToken = match?.[1] || body.refreshToken;

    if (!refreshToken) {
      return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } }, 401);
    }

    const result = await authService.refresh(refreshToken);
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, refreshToken: result.refreshToken } });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && 'httpStatus' in err) {
      const appErr = err as { code: string; httpStatus: number; message: string };
      return c.json({ success: false, error: { code: appErr.code, message: appErr.message } }, appErr.httpStatus as 401 | 403 | 404 | 409 | 422 | 429 | 500);
    }
    console.error('[refresh] unhandled:', err);
    return c.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }, 500);
  }
});

router.post('/logout', async (c) => {
  const cookie = c.req.header('Cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
  const refreshToken = match?.[1];

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  clearRefreshCookie(c);
  return c.json({ success: true, data: null });
});

router.get('/me', auth(), async (c) => {
  const user = c.get('user');
  const profile = await authService.getMe(user.id);
  return c.json({ success: true, data: profile });
});

router.put('/me', auth(), zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  const profile = await authService.updateProfile(user.id, data);
  return c.json({ success: true, data: profile });
});

router.post('/forgot', rateLimiter('forgot:password'), zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');
  await authService.forgotPassword(email);
  return c.json({ success: true, data: null });
});

router.post('/reset', zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json');
  await authService.resetPassword(token, password);
  return c.json({ success: true, data: null });
});

export { router as authRouter };
