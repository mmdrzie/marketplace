import { config } from '../../config/index.js';
import { Payment } from '../entities/payment/Payment.entity.js';
import type { PaymentRepository } from '../entities/payment/Payment.repository.js';
import type { ListingRepository } from '../entities/listing/Listing.repository.js';
import type { WalletRepository } from '../entities/wallet/Wallet.repository.js';
import { PaymentRepositoryImpl } from '../infrastructure/payment/PaymentRepository.impl.js';
import { ListingRepositoryImpl } from '../infrastructure/listing/ListingRepository.impl.js';
import { WalletRepositoryImpl } from '../infrastructure/wallet/WalletRepository.impl.js';
import { createPaymentProvider } from '../../services/payment/provider.js';
import { AppError } from '../../errors.js';
import type { AuthUser } from '../../middleware/auth.js';

const FEATURED_PRICE = 50000; // 50,000 IRR for featured listing
const SUBSCRIPTION_PRICE = 200000; // 200,000 IRR for monthly dealer subscription

export class PaymentService {
  private listingRepo: ListingRepository;
  private paymentRepo: PaymentRepository;
  private walletRepo: WalletRepository;

  constructor(listingRepo?: ListingRepository, paymentRepo?: PaymentRepository, walletRepo?: WalletRepository) {
    this.listingRepo = listingRepo ?? new ListingRepositoryImpl();
    this.paymentRepo = paymentRepo ?? new PaymentRepositoryImpl();
    this.walletRepo = walletRepo ?? new WalletRepositoryImpl();
  }

  private async createPaymentRecord(data: {
    userId: string; amount: number; metadata?: Record<string, unknown>;
  }): Promise<Payment> {
    const payment = Payment.fromSnapshot({
      id: 0, userId: data.userId, amount: data.amount,
      currency: 'IRR', gateway: 'zarinpal',
      provider: config.payment.provider,
      status: 'pending', referenceId: null, providerId: null,
      description: null, metadata: data.metadata ?? null,
      paidAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this.paymentRepo.save(payment);
    const created = await this.paymentRepo.findById(payment.id);
    return created ?? payment;
  }

  async createFeaturedPayment(listingId: number, user: AuthUser) {
    const listing = await this.listingRepo.findById(listingId);
    if (!listing) throw AppError.notFound('Listing not found');
    if (!listing.isOwnedBy(user.id)) throw AppError.forbidden('You can only feature your own listings');

    const payment = await this.createPaymentRecord({
      userId: user.id,
      amount: FEATURED_PRICE,
      metadata: { type: 'featured', listing_id: listingId, listing_title: listing.title },
    });

    const provider = await createPaymentProvider();
    const result = await provider.createPayment(FEATURED_PRICE, 'IRR', {
      payment_id: payment.id,
      type: 'featured',
      listing_id: listingId,
    });

    if (result.success && result.providerPaymentId) {
      payment.providerId = result.providerPaymentId;
      await this.paymentRepo.save(payment);

      if (payment.provider === 'noop') {
        await this.completePayment(payment.id);
      }
    }

    return { ...payment.snapshot(), redirect_url: result.redirectUrl };
  }

  async createSubscriptionPayment(user: AuthUser) {
    const payment = await this.createPaymentRecord({
      userId: user.id,
      amount: SUBSCRIPTION_PRICE,
      metadata: { type: 'subscription' },
    });

    const provider = await createPaymentProvider();
    const result = await provider.createPayment(SUBSCRIPTION_PRICE, 'IRR', {
      payment_id: payment.id,
      type: 'subscription',
    });

    if (result.success && result.providerPaymentId) {
      payment.providerId = result.providerPaymentId;
      await this.paymentRepo.save(payment);

      if (payment.provider === 'noop') {
        await this.completePayment(payment.id);
      }
    }

    return { ...payment.snapshot(), redirect_url: result.redirectUrl };
  }

  async createDeposit(user: AuthUser, amount: number) {
    const payment = await this.createPaymentRecord({
      userId: user.id,
      amount,
      metadata: { type: 'deposit' },
    });

    const provider = await createPaymentProvider();
    const result = await provider.createPayment(amount, 'IRR', {
      payment_id: payment.id,
      type: 'deposit',
    });

    if (result.success && result.providerPaymentId) {
      payment.providerId = result.providerPaymentId;
      await this.paymentRepo.save(payment);

      if (payment.provider === 'noop') {
        await this.completePayment(payment.id);
      }
    }

    return { ...payment.snapshot(), redirect_url: result.redirectUrl };
  }

  async completePayment(paymentId: number) {
    const payment = await this.paymentRepo.findById(paymentId);
    if (!payment) throw AppError.notFound('Payment not found');

    if (payment.status === 'completed') {
      return payment.snapshot();
    }

    const metadata = payment.metadata as Record<string, unknown> | null;
    const type = (metadata?.type as string) || 'featured';
    const isDeposit = type === 'deposit';
    const amount = isDeposit ? payment.amount : -payment.amount;
    const description = isDeposit ? 'Deposit to wallet' : type === 'subscription' ? 'Dealer subscription' : `Featured listing #${(metadata?.listing_id as number) ?? ''}`;

    const transaction = await this.walletRepo.addAtomicTransaction({
      userId: payment.userId,
      type: isDeposit ? 'deposit' : type,
      amount,
      description,
      referenceType: 'payment',
      referenceId: paymentId,
    });

    if (!transaction) {
      const alreadyCredited = await this.walletRepo.hasReference('payment', paymentId);
      if (alreadyCredited) {
        payment.status = 'completed';
        await this.paymentRepo.save(payment);
        return payment.snapshot();
      }
      throw AppError.validation('Insufficient wallet balance');
    }

    payment.status = 'completed';
    await this.paymentRepo.save(payment);

    if (type === 'featured' && metadata?.listing_id) {
      const featured = await this.listingRepo.findById(metadata.listing_id as number);
      if (featured) {
        featured.isFeatured = true;
        await this.listingRepo.save(featured);
      }
    }

    return payment.snapshot();
  }
}

export const paymentService = new PaymentService();
