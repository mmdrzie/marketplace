import type { Context } from 'hono';
import { authService } from '../../services/auth.js';
import { setRefreshCookie, clearRefreshCookie, getRefreshTokenFromCookie } from '../auth/authCookies.js';

export class UserController {
  async register(c: Context): Promise<Response> {
    const { email, password, name } = await c.req.json();
    const result = await authService.register({ email, password, name });
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, user: result.user } }, 201);
  }

  async registerWithOtp(c: Context): Promise<Response> {
    const body = await c.req.json();
    const result = await authService.registerWithOtp({
      name: body.name,
      password: body.password,
      type: body.type,
      identifier: body.identifier,
      code: body.code,
      role: body.role,
    });
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, user: result.user } }, 201);
  }

  async sendRegisterOtp(c: Context): Promise<Response> {
    const { type, identifier } = await c.req.json();
    await authService.sendRegisterOtp({ type, identifier });
    return c.json({ success: true, data: null });
  }

  async login(c: Context): Promise<Response> {
    const { email, password } = await c.req.json();
    const result = await authService.login({ email, password });
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, user: result.user } });
  }

  async refresh(c: Context): Promise<Response> {
    const refreshToken = getRefreshTokenFromCookie(c);
    if (!refreshToken) return c.json({ error: 'No refresh token' }, 401);
    const result = await authService.refresh(refreshToken);
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token } });
  }

  async logout(c: Context): Promise<Response> {
    const refreshToken = getRefreshTokenFromCookie(c);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(c);
    return c.json({ success: true, data: null });
  }

  async getProfile(c: Context): Promise<Response> {
    const user = c.get('user');
    if (process.env.NODE_ENV === 'development' && user.id.startsWith('dev-')) {
      return c.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.email === 'admin@marketplace.com' ? 'مدیر سایت'
            : user.email === 'demo@marketplace.com' ? 'کاربر آزمایشی'
            : user.email === 'dealer@marketplace.com' ? 'نماینده نمونه'
            : user.email === 'agency@marketplace.com' ? 'آژانس نمونه'
            : user.email === 'store@marketplace.com' ? 'فروشگاه نمونه'
            : 'کاربر تست',
          role: user.role,
          phone: '09120000000',
          avatar: null,
          city: null,
          status: 'active',
          phoneVerified: true,
          emailVerified: true,
          created_at: new Date().toISOString(),
        },
      });
    }
    const profile = await authService.getMe(user.id);
    return c.json({ success: true, data: profile });
  }

  async updateProfile(c: Context): Promise<Response> {
    const user = c.get('user');
    const data = await c.req.json();
    const profile = await authService.updateProfile(user.id, data);
    return c.json({ success: true, data: profile });
  }

  async updateAvatar(c: Context): Promise<Response> {
    const user = c.get('user');
    const { object_key } = await c.req.json();
    const profile = await authService.updateProfile(user.id, { avatar: object_key });
    return c.json({ success: true, data: profile });
  }

  async forgotPassword(c: Context): Promise<Response> {
    const { email } = await c.req.json();
    await authService.forgotPassword(email);
    return c.json({ success: true, data: null });
  }

  async resetPassword(c: Context): Promise<Response> {
    const { token, password } = await c.req.json();
    await authService.resetPassword(token, password);
    return c.json({ success: true, data: null });
  }

  async sendVerifyCode(c: Context): Promise<Response> {
    const { email } = await c.req.json();
    await authService.sendEmailVerificationCode(email);
    return c.json({ success: true, data: null });
  }

  async verifyCode(c: Context): Promise<Response> {
    const { email, code } = await c.req.json();
    const result = await authService.verifyEmailCodeAndLogin(email, code);
    setRefreshCookie(c, result.refreshToken);
    return c.json({ success: true, data: { token: result.token, user: result.user } });
  }
}
