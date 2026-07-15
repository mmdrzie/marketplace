export interface PaymentResult {
  success: boolean;
  providerPaymentId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentInterface {
  createPayment(amount: number, currency: string, metadata: Record<string, unknown>): Promise<PaymentResult>;
  verifyPayment(providerPaymentId: string): Promise<PaymentResult>;
  refund(providerPaymentId: string, amount?: number): Promise<PaymentResult>;
}

import { NoopPaymentProvider } from './providers/noop.js';

export function createPaymentProvider(): PaymentInterface {
  const providerName = process.env.PAYMENT_PROVIDER || 'noop';

  if (providerName === 'zarinpal') {
    // Lazy-load Zarinpal when configured
    throw new Error('Zarinpal provider not yet implemented');
  }

  // Default: NoopPaymentProvider
  return new NoopPaymentProvider();
}
