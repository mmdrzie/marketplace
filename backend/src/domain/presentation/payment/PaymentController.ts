import type { Context } from 'hono';
import { PaymentRepository } from '../../entities/payment/Payment.repository.js';
import { paymentService } from '../../services/payment.js';

export class PaymentController {
  constructor(private readonly repo: PaymentRepository) {}

  async get(c: Context): Promise<Response> {
    const payment = await this.repo.findById(Number(c.req.param('id')));
    if (!payment) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: payment.snapshot() });
  }

  async listByUser(c: Context): Promise<Response> {
    const user = c.get('user');
    const payments = await this.repo.findByUser(user.id);
    return c.json({ data: payments.map(p => p.snapshot()) });
  }

  async createFeatured(c: Context): Promise<Response> {
    const user = c.get('user');
    const { listing_id } = await c.req.json();
    const result = await paymentService.createFeaturedPayment(listing_id, user);
    return c.json({ success: true, data: result }, 201);
  }

  async createSubscription(c: Context): Promise<Response> {
    const user = c.get('user');
    const result = await paymentService.createSubscriptionPayment(user);
    return c.json({ success: true, data: result }, 201);
  }

  async createDeposit(c: Context): Promise<Response> {
    const user = c.get('user');
    const { amount } = await c.req.json();
    const result = await paymentService.createDeposit(user, amount);
    return c.json({ success: true, data: result }, 201);
  }
}
