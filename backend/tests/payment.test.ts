import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Payment } from '../src/domain/entities/payment/Payment.entity.js';

vi.mock('../src/services/payment/provider.js', () => ({
  createPaymentProvider: () => ({ createPayment: vi.fn() }),
}));

import { PaymentService } from '../src/domain/services/payment.js';

function basePaymentSnapshot() {
  return {
    id: 1, userId: 'u1', amount: 50000,
    currency: 'IRR', gateway: 'zarinpal' as const, provider: 'zarinpal',
    status: 'pending' as const, referenceId: null, providerId: null,
    description: null, metadata: { type: 'featured', listing_id: 5 },
    paidAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function mockPaymentRepo() {
  return {
    findById: vi.fn(),
    findByUser: vi.fn(),
    save: vi.fn(),
  };
}

function mockListingRepo() {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    getDetails: vi.fn(),
  };
}

function mockWalletRepo() {
  return {
    addAtomicTransaction: vi.fn(),
    hasReference: vi.fn(),
    getBalance: vi.fn(),
    getTransactions: vi.fn(),
  };
}

describe('PaymentService.completePayment idempotency (related to flow)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('credits the wallet and completes the payment on first call', async () => {
    const payment = Payment.fromSnapshot(basePaymentSnapshot());
    const listingRepo = mockListingRepo();
    const paymentRepo = mockPaymentRepo();
    const walletRepo = mockWalletRepo();

    paymentRepo.findById.mockResolvedValue(payment);
    walletRepo.addAtomicTransaction.mockResolvedValue({ id: 1, balanceAfter: -50000 });

    const svc = new PaymentService(listingRepo, paymentRepo, walletRepo);
    const res = await svc.completePayment(1);

    expect(walletRepo.addAtomicTransaction).toHaveBeenCalledTimes(1);
    expect(paymentRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(listingRepo.findById).toHaveBeenCalledWith(5);
    expect(res.status).toBe('completed');
  });

  it('does NOT credit the wallet twice when called again on an already-completed payment', async () => {
    const listingRepo = mockListingRepo();
    const paymentRepo = mockPaymentRepo();
    const walletRepo = mockWalletRepo();

    const payment1 = Payment.fromSnapshot(basePaymentSnapshot());
    paymentRepo.findById.mockResolvedValueOnce(payment1);
    walletRepo.addAtomicTransaction.mockResolvedValueOnce({ id: 1, balanceAfter: -50000 });

    const payment2 = Payment.fromSnapshot({ ...basePaymentSnapshot(), status: 'completed' });
    paymentRepo.findById.mockResolvedValueOnce(payment2);

    const svc = new PaymentService(listingRepo, paymentRepo, walletRepo);
    await svc.completePayment(1);
    const res = await svc.completePayment(1);

    expect(walletRepo.addAtomicTransaction).toHaveBeenCalledTimes(1);
    expect(paymentRepo.save).toHaveBeenCalledTimes(1);
    expect(res.status).toBe('completed');
  });

  it('throws notFound for a missing payment', async () => {
    const listingRepo = mockListingRepo();
    const paymentRepo = mockPaymentRepo();
    const walletRepo = mockWalletRepo();
    paymentRepo.findById.mockResolvedValue(null);

    const svc = new PaymentService(listingRepo, paymentRepo, walletRepo);
    await expect(svc.completePayment(999)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('handles idempotency when addAtomicTransaction returns null but reference exists', async () => {
    const payment = Payment.fromSnapshot(basePaymentSnapshot());
    const listingRepo = mockListingRepo();
    const paymentRepo = mockPaymentRepo();
    const walletRepo = mockWalletRepo();

    paymentRepo.findById.mockResolvedValue(payment);
    walletRepo.addAtomicTransaction.mockResolvedValue(null);
    walletRepo.hasReference.mockResolvedValue(true);

    const svc = new PaymentService(listingRepo, paymentRepo, walletRepo);
    const res = await svc.completePayment(1);

    expect(walletRepo.hasReference).toHaveBeenCalledWith('payment', 1);
    expect(paymentRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(res.status).toBe('completed');
  });

  it('throws insufficient balance when addAtomicTransaction returns null and no reference exists', async () => {
    const payment = Payment.fromSnapshot(basePaymentSnapshot());
    const listingRepo = mockListingRepo();
    const paymentRepo = mockPaymentRepo();
    const walletRepo = mockWalletRepo();

    paymentRepo.findById.mockResolvedValue(payment);
    walletRepo.addAtomicTransaction.mockResolvedValue(null);
    walletRepo.hasReference.mockResolvedValue(false);

    const svc = new PaymentService(listingRepo, paymentRepo, walletRepo);
    await expect(svc.completePayment(1)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
