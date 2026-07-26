import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PhoneVerificationService } from '../src/domain/services/phoneVerification';
import { ErrorCode } from '../src/shared';
import { User } from '../src/domain/entities/user/User.entity.js';

function makeMockUser(opts?: { phone?: string; phoneVerified?: boolean }) {
  return User.fromSnapshot({
    id: 'user-1', email: 'a@b.com', name: null,
    phone: opts?.phone ?? null,
    role: 'user', status: 'active', avatar: null, publicId: null,
    passwordHash: null, city: null,
    emailVerified: false, phoneVerified: opts?.phoneVerified ?? false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null,
  });
}

describe('PhoneVerificationService', () => {
  let mockVerificationRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockUserRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerificationRepo = {
      createEmailVerification: vi.fn(),
      findEmailVerificationByHash: vi.fn(),
      markEmailVerified: vi.fn(),
      createPhoneVerification: vi.fn(),
      findLatestPhoneVerification: vi.fn(),
      markPhoneVerified: vi.fn(),
      countRecentByPhone: vi.fn(),
      countRecentByUser: vi.fn(),
    };
    mockUserRepo = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
      updatePassword: vi.fn(),
    };
  });

  it('sends OTP when under rate limit', async () => {
    mockVerificationRepo.countRecentByPhone.mockResolvedValue(0);

    const service = new PhoneVerificationService(undefined, mockVerificationRepo, mockUserRepo);
    await service.sendOtp('user-1', '09120000000');

    expect(mockVerificationRepo.createPhoneVerification).toHaveBeenCalledOnce();
  });

  it('throws RATE_LIMITED when over rate limit', async () => {
    mockVerificationRepo.countRecentByPhone.mockResolvedValue(3);

    const service = new PhoneVerificationService(undefined, mockVerificationRepo, mockUserRepo);
    await expect(service.sendOtp('user-1', '09120000000')).rejects.toMatchObject({
      code: ErrorCode.RATE_LIMITED,
    });

    expect(mockVerificationRepo.createPhoneVerification).not.toHaveBeenCalled();
  });

  it('throws OTP_INVALID for wrong code', async () => {
    mockVerificationRepo.findLatestPhoneVerification.mockResolvedValue({
      id: 'v-1',
      otpHash: '$2b$10$differenthash',
      expiresAt: new Date(Date.now() + 60000),
    });

    const service = new PhoneVerificationService(undefined, mockVerificationRepo, mockUserRepo);
    await expect(service.verifyOtp('user-1', '09120000000', '000000')).rejects.toMatchObject({
      code: ErrorCode.OTP_INVALID,
    });
  });

  it('returns phone status', async () => {
    const user = makeMockUser({ phone: '09120000000', phoneVerified: true });
    mockUserRepo.findById.mockResolvedValue(user);

    const service = new PhoneVerificationService(undefined, mockVerificationRepo, mockUserRepo);
    const status = await service.getStatus('user-1');
    expect(status.phone).toBe('09120000000');
    expect(status.verified).toBe(true);
  });
});
