import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailVerificationService } from '../src/domain/services/emailVerification';
import { AppError } from '../src/errors';
import { ErrorCode } from '../src/shared';

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
  userRepo: { update: vi.fn() },
}));

vi.mock('../src/services/email', () => ({
  EmailService: vi.fn(() => ({
    sendVerificationEmail: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
  })),
}));

import { verificationRepo } from '../src/repositories/verification';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmailVerificationService();
  });

  it('sends verification email', async () => {
    await service.sendVerification('user-1', 'test@test.com');
    expect(verificationRepo.createEmailVerification).toHaveBeenCalledOnce();
  });

  it('throws INVALID_TOKEN for expired or invalid token on verify', async () => {
    vi.mocked(verificationRepo.findEmailVerificationByHash).mockResolvedValue(undefined);

    await expect(service.verify('bad-token')).rejects.toMatchObject({
      code: ErrorCode.INVALID_TOKEN,
    });
  });
});
