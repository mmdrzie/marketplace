import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { EmailVerification } from '../src/domain/entities/verification/EmailVerification.entity.js';
import { User } from '../src/domain/entities/user/User.entity.js';

vi.mock('../src/services/email/index.js', () => ({
  EmailService: class {
    sendVerificationEmail = vi.fn();
  },
}));

vi.mock('../src/domain/events/index.js', () => ({
  eventBus: { publish: vi.fn() },
  EmailVerified: 'EmailVerified',
}));

import { EmailVerificationService } from '../src/domain/services/emailVerification.js';

function makeMockUser() {
  return User.fromSnapshot({
    id: 'u1', email: 'a@b.com', name: null, phone: null,
    role: 'user', status: 'active', avatar: null, publicId: null,
    passwordHash: null, city: null,
    emailVerified: false, phoneVerified: false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null,
  });
}

function makeMockVerification(tokenHash: string, expiresAt?: Date) {
  return EmailVerification.fromSnapshot({
    id: 'v1', userId: 'u1', tokenHash,
    expiresAt: (expiresAt ?? new Date(Date.now() + 60000)).toISOString(),
    verifiedAt: null, createdAt: new Date().toISOString(),
  });
}

describe('EmailVerificationService (related to 1.12)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses SHA-256 to hash the verification token, not bcrypt', async () => {
    const mockVerificationRepo = {
      createEmailVerification: vi.fn().mockResolvedValue(makeMockVerification('')),
      findEmailVerificationByHash: vi.fn(),
      findLatestEmailVerification: vi.fn(),
      markEmailVerified: vi.fn(),
      createPhoneVerification: vi.fn(),
      findLatestPhoneVerification: vi.fn(),
      markPhoneVerified: vi.fn(),
      countRecentByPhone: vi.fn(),
      countRecentByUser: vi.fn(),
    };

    const svc = new EmailVerificationService(undefined, mockVerificationRepo);
    await svc.sendVerification('u1', 'a@b.com');

    expect(mockVerificationRepo.createEmailVerification).toHaveBeenCalledTimes(1);
    const savedHash = mockVerificationRepo.createEmailVerification.mock.calls[0][0].token_hash;
    expect(savedHash).toMatch(/^[a-f0-9]{64}$/);
    expect(savedHash).not.toMatch(/^\$2[aby]\$/);
  });

  it('verifies a valid token and marks the email verified', async () => {
    const token = await (async () => {
      const { SignJWT } = await import('jose');
      const { authConfig } = await import('../src/config/auth.js');
      return new SignJWT({ sub: 'u1', type: 'email_verify' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(authConfig.secret);
    })();

    const mockUser = makeMockUser();
    const mockVerificationRepo = {
      createEmailVerification: vi.fn(),
      findEmailVerificationByHash: vi.fn(),
      findLatestEmailVerification: vi.fn().mockResolvedValue(makeMockVerification(
        crypto.createHash('sha256').update(token).digest('hex'),
      )),
      markEmailVerified: vi.fn().mockResolvedValue({}),
      createPhoneVerification: vi.fn(),
      findLatestPhoneVerification: vi.fn(),
      markPhoneVerified: vi.fn(),
      countRecentByPhone: vi.fn(),
      countRecentByUser: vi.fn(),
    };
    const mockUserRepo = {
      findById: vi.fn().mockResolvedValue(mockUser),
      findByEmail: vi.fn(),
      save: vi.fn(),
      updatePassword: vi.fn(),
    };

    const svc = new EmailVerificationService(undefined, mockVerificationRepo, mockUserRepo);
    await svc.verify(token);

    expect(mockVerificationRepo.markEmailVerified).toHaveBeenCalledWith('v1');
    expect(mockUserRepo.save).toHaveBeenCalledWith(expect.any(User));
    expect(mockUser.emailVerified).toBe(true);
  });

  it('rejects a tampered token (hash mismatch)', async () => {
    const token = await (async () => {
      const { authConfig } = await import('../src/config/auth.js');
      const { SignJWT } = await import('jose');
      return new SignJWT({ sub: 'u1', type: 'email_verify' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(authConfig.secret);
    })();

    const mockVerificationRepo = {
      createEmailVerification: vi.fn(),
      findEmailVerificationByHash: vi.fn(),
      findLatestEmailVerification: vi.fn().mockResolvedValue(makeMockVerification('deadbeef')),
      markEmailVerified: vi.fn(),
      createPhoneVerification: vi.fn(),
      findLatestPhoneVerification: vi.fn(),
      markPhoneVerified: vi.fn(),
      countRecentByPhone: vi.fn(),
      countRecentByUser: vi.fn(),
    };

    const svc = new EmailVerificationService(undefined, mockVerificationRepo);
    await expect(svc.verify(token)).rejects.toMatchObject({ code: 'INVALID_TOKEN' });
  });
});
