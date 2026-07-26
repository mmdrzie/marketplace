import type { Context } from 'hono';
import { emailVerificationService } from '../../services/emailVerification.js';

export class EmailVerificationController {
  async send(c: Context): Promise<Response> {
    const user = c.get('user');
    await emailVerificationService.sendVerification(user.id, user.email);
    return c.json({ success: true, message: 'Verification email sent' });
  }

  async sendToEmail(c: Context): Promise<Response> {
    const user = c.get('user');
    const { email } = await c.req.json();
    await emailVerificationService.sendVerification(user.id, email);
    return c.json({ success: true, message: 'Verification email sent' });
  }

  async verify(c: Context): Promise<Response> {
    const { token } = c.req.param();
    await emailVerificationService.verify(token);
    return c.json({ success: true, message: 'Email verified' });
  }

  async verifyFromBody(c: Context): Promise<Response> {
    const { token } = await c.req.json();
    await emailVerificationService.verify(token);
    return c.json({ success: true, message: 'Email verified' });
  }
}
