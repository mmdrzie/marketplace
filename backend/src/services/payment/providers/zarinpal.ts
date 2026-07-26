import type { PaymentInterface, PaymentResult } from '../provider.js';
import { config } from '../../../config/index.js';

const ZARINPAL_API = 'https://api.zarinpal.com/pg/v4/payment';

export class ZarinpalProvider implements PaymentInterface {
  private get merchantId(): string {
    return config.payment.zarinpal.merchantId;
  }

  async createPayment(amount: number, _currency: string, metadata: Record<string, unknown>): Promise<PaymentResult> {
    const description = (metadata.description as string) || 'Marketplace payment';
    const mobile = metadata.mobile as string | undefined;
    const email = metadata.email as string | undefined;

    const res = await fetch(`${ZARINPAL_API}/request.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount,
        callback_url: config.payment.zarinpal.callbackUrl,
        description,
        mobile,
        email,
      }),
    });

    const data = await res.json() as {
      data?: { code: number; authority: string };
      errors?: unknown;
    };

    if (!res.ok || !data.data || data.data.code !== 100) {
      return { success: false, error: JSON.stringify(data.errors ?? 'zarinpal request failed') };
    }

    const authority = data.data.authority;
    const gateway = config.nodeEnv === 'production'
      ? `https://www.zarinpal.com/pg/StartPay/${authority}`
      : `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;

    return {
      success: true,
      providerPaymentId: authority,
      redirectUrl: gateway,
    };
  }

  async verifyPayment(providerPaymentId: string): Promise<PaymentResult> {
    const res = await fetch(`${ZARINPAL_API}/verify.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        authority: providerPaymentId,
      }),
    });

    const data = await res.json() as {
      data?: { code: number; ref_id: string };
      errors?: unknown;
    };

    if (!res.ok || !data.data || data.data.code !== 100) {
      return { success: false, providerPaymentId, error: JSON.stringify(data.errors ?? 'zarinpal verify failed') };
    }

    return { success: true, providerPaymentId, redirectUrl: data.data.ref_id };
  }

  async refund(providerPaymentId: string, _amount?: number): Promise<PaymentResult> {
    const res = await fetch(`${ZARINPAL_API}/refund.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        authority: providerPaymentId,
      }),
    });

    if (!res.ok) {
      return { success: false, providerPaymentId, error: await res.text() };
    }

    return { success: true, providerPaymentId };
  }
}
