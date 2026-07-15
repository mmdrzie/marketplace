import { paymentRepo } from '../../repositories/payment.js';
import { listingRepo } from '../../repositories/listing.js';
import { createPaymentProvider } from '../../services/payment/provider.js';
import { AppError } from '../../errors.js';
import type { AuthUser } from '../../middleware/auth.js';

const FEATURED_PRICE = 50000; // 50,000 IRR for featured listing
const SUBSCRIPTION_PRICE = 200000; // 200,000 IRR for monthly dealer subscription

export class PaymentService {
  async createFeaturedPayment(listingId: number, user: AuthUser) {
    const listing = await listingRepo.findById(listingId);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.user_id !== user.id) throw AppError.forbidden('You can only feature your own listings');

    const payment = await paymentRepo.create({
      user_id: user.id,
      amount: FEATURED_PRICE,
      metadata: { type: 'featured', listing_id: listingId, listing_title: listing.title },
    });

    const provider = createPaymentProvider();
    const result = await provider.createPayment(FEATURED_PRICE, 'IRR', {
      payment_id: payment.id,
      type: 'featured',
      listing_id: listingId,
    });

    if (result.success && result.providerPaymentId) {
      await paymentRepo.update(payment.id, {
        provider_id: result.providerPaymentId,
      });

      // Noop auto-completes
      if (payment.provider === 'noop') {
        await this.completePayment(payment.id);
      }
    }

    return { ...payment, redirect_url: result.redirectUrl };
  }

  async createSubscriptionPayment(user: AuthUser) {
    const payment = await paymentRepo.create({
      user_id: user.id,
      amount: SUBSCRIPTION_PRICE,
      metadata: { type: 'subscription' },
    });

    const provider = createPaymentProvider();
    const result = await provider.createPayment(SUBSCRIPTION_PRICE, 'IRR', {
      payment_id: payment.id,
      type: 'subscription',
    });

    if (result.success && result.providerPaymentId) {
      await paymentRepo.update(payment.id, {
        provider_id: result.providerPaymentId,
      });

      if (payment.provider === 'noop') {
        await this.completePayment(payment.id);
      }
    }

    return { ...payment, redirect_url: result.redirectUrl };
  }

  async createDeposit(user: AuthUser, amount: number) {
    const payment = await paymentRepo.create({
      user_id: user.id,
      amount,
      metadata: { type: 'deposit' },
    });

    const provider = createPaymentProvider();
    const result = await provider.createPayment(amount, 'IRR', {
      payment_id: payment.id,
      type: 'deposit',
    });

    if (result.success && result.providerPaymentId) {
      await paymentRepo.update(payment.id, { provider_id: result.providerPaymentId });
      if (payment.provider === 'noop') {
        await this.completePayment(payment.id);
      }
    }

    return { ...payment, redirect_url: result.redirectUrl };
  }

  async completePayment(paymentId: number) {
    const db = (await import('../../config/database.js')).getDb;
    const d = await db();
    const { rows } = await d.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    const payment = rows[0] as { id: number; user_id: string; amount: number; metadata: { type?: string; listing_id?: number } } | undefined;
    if (!payment) throw AppError.notFound('Payment not found');

    await paymentRepo.update(paymentId, { status: 'completed' });

    const balance = await paymentRepo.getWalletBalance(payment.user_id);
    const type = payment.metadata?.type || 'featured';
    const isDeposit = type === 'deposit';
    await paymentRepo.addWalletTransaction({
      user_id: payment.user_id,
      type: isDeposit ? 'deposit' : type,
      amount: isDeposit ? payment.amount : -payment.amount,
      balance_before: balance,
      description: isDeposit ? 'Deposit to wallet' : type === 'subscription' ? 'Dealer subscription' : `Featured listing #${payment.metadata?.listing_id}`,
      reference_type: 'payment',
      reference_id: paymentId,
    });

    if (type === 'featured' && payment.metadata?.listing_id) {
      await listingRepo.update(payment.metadata.listing_id, { is_featured: true });
    }
  }
}

export const paymentService = new PaymentService();
