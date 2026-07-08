import type { PaymentInterface, PaymentResult } from '../provider';

export class NoopPaymentProvider implements PaymentInterface {
  async createPayment(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentResult> {
    return {
      success: true,
      providerPaymentId: `noop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      redirectUrl: null as unknown as undefined,
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<PaymentResult> {
    return { success: true, providerPaymentId };
  }

  async refund(providerPaymentId: string, _amount?: number): Promise<PaymentResult> {
    return { success: true, providerPaymentId };
  }
}
