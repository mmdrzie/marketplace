import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhoneVerificationService } from '../src/domain/services/phoneVerification';
import { AppError } from '../src/errors';
import { ErrorCode } from '@marketplace/shared';

vi.mock('../src/repositories/verification', () => ({
  verificationRepo: {
    createEmailVerification: vi.fn(),
    findEmailVerificationByHash: vi.fn(),
    markEmailVerified: vi.fn(),
    createPhoneVerification: vi.fn(),
    findPhoneVerificationByHash: vi.fn(),
    markPhoneVerified: vi.fn(),
    countRecentByPhone: vi.fn(),
    countRecentByUser: vi.fn(),
  },
}));

vi.mock('../src/repositories/user', () => ({
  userRepo: { findById: vi.fn(), update: vi.fn() },
}));

vi.mock('../src/services/sms', () => ({
  SmsService: vi.fn(() => ({
    sendOtp: vi.fn(),
  })),
}));

import { verificationRepo } from '../src/repositories/verification';
import { userRepo } from '../src/repositories/user';

describe('PhoneVerificationService', () => {
  let service: PhoneVerificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PhoneVerificationService();
  });

  it('sends OTP when under rate limit', async () => {
    vi.mocked(verificationRepo.countRecentByPhone).mockResolvedValue(0);

    await service.sendOtp('user-1', '09120000000');

    expect(verificationRepo.createPhoneVerification).toHaveBeenCalledOnce();
  });

  it('throws RATE_LIMITED when over rate limit', async () => {
    vi.mocked(verificationRepo.countRecentByPhone).mockResolvedValue(3);

    await expect(service.sendOtp('user-1', '09120000000')).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMITED,
    });

    expect(verificationRepo.createPhoneVerification).not.toHaveBeenCalled();
  });

  it('throws OTP_INVALID for wrong code', async () => {
    vi.mocked(verificationRepo.findPhoneVerificationByHash).mockResolvedValue({
      id: 'v-1',
      otp_hash: '$2b$10$differenthash',
      expires_at: new Date(Date.now() + 60000).toISOString(),
    } as any);

    await expect(service.verifyOtp('user-1', '09120000000', '000000')).rejects.toMatchObject({
      code: ErrorCode.OTP_INVALID,
    });
  });

  it('returns phone status', async () => {
    vi.mocked(userRepo.findById).mockResolvedValue({
      phone: '09120000000',
      phone_verified_at: new Date().toISOString(),
    } as any);

    const status = await service.getStatus('user-1');
    expect(status.phone).toBe('09120000000');
    expect(status.verified).toBe(true);
  });
});
