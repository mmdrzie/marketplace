import type { Context } from 'hono';
import { phoneVerificationService } from '../../services/phoneVerification.js';

export class PhoneVerificationController {
  async sendOtp(c: Context): Promise<Response> {
    const user = c.get('user');
    const { phone } = await c.req.json();
    await phoneVerificationService.sendOtp(user.id, phone);
    return c.json({ success: true, data: null });
  }

  async verifyOtp(c: Context): Promise<Response> {
    const user = c.get('user');
    const { phone, code } = await c.req.json();
    await phoneVerificationService.verifyOtp(user.id, phone, code);
    return c.json({ success: true, message: 'Phone verified' });
  }

  async status(c: Context): Promise<Response> {
    const user = c.get('user');
    const status = await phoneVerificationService.getStatus(user.id);
    return c.json({ success: true, data: status });
  }
}
