import { describe, it, expect, vi, beforeEach } from 'vitest';
import { User } from '../src/domain/entities/user/User.entity.js';

vi.mock('../src/services/email/index.js', () => ({
  EmailService: class {
    sendVerificationEmail = vi.fn();
    sendPasswordResetEmail = vi.fn();
  },
}));

vi.mock('../src/domain/events/index.js', () => ({
  eventBus: { publish: vi.fn() },
  UserRegistered: 'UserRegistered',
  EmailVerified: 'EmailVerified',
}));

vi.mock('../src/domain/services/businessProfileService.js', () => ({
  BusinessProfileService: class {
    create = vi.fn().mockResolvedValue({
      profileStatus: 'pending',
      profile: { role: 'dealer', businessName: 'فروشگاه نمونه', status: 'pending' },
    });
  },
  businessProfileService: {
    create: vi.fn().mockResolvedValue({
      profileStatus: 'pending',
      profile: { role: 'dealer', businessName: 'فروشگاه نمونه', status: 'pending' },
    }),
  },
}));

import { AuthService } from '../src/domain/services/auth.js';
import { businessProfileService } from '../src/domain/services/businessProfileService.js';
import { AppError } from '../src/errors.js';

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return User.fromSnapshot({
    id: 'u1',
    email: 'a@b.com',
    name: 'Test',
    phone: null,
    role: 'user',
    status: 'active',
    avatar: null,
    publicId: null,
    passwordHash: (overrides.passwordHash as string) ?? 'hash',
    city: null,
    emailVerified: false,
    phoneVerified: false,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
    ...(overrides as Record<string, unknown>),
  });
}

function repoMocks() {
  return {
    user: {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
      updatePassword: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findByTokenHash: vi.fn(),
      revoke: vi.fn(),
      revokeAllForUser: vi.fn(),
    },
    verification: {
      findLatestRegistrationOtp: vi.fn(),
      markRegistrationOtpVerified: vi.fn(),
      createRegistrationOtp: vi.fn(),
      countRecentRegistrationOtps: vi.fn(),
    },
    dealer: {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn(),
      getStats: vi.fn(),
      getSubscription: vi.fn(),
      addReview: vi.fn(),
    },
  };
}

describe('AuthService.register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('registers a new user and returns a sanitized profile', async () => {
    const m = repoMocks();
    const mockUser = makeUser();
    m.user.findByEmail.mockResolvedValue(undefined);
    m.user.findById.mockResolvedValue(mockUser);

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    const res = await svc.register({ email: 'a@b.com', password: 'password123', name: 'Test' });

    expect(res.token).toBeTypeOf('string');
    expect(res.refreshToken).toBeTypeOf('string');
    expect(res.user.email).toBe('a@b.com');
    expect(res.user.role).toBe('user');
    expect(res.user.status).toBeUndefined();
    expect(m.user.save).toHaveBeenCalledTimes(1);
  });

  it('throws emailAlreadyExists when email is taken', async () => {
    const m = repoMocks();
    m.user.findByEmail.mockResolvedValue(makeUser());

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    await expect(
      svc.register({ email: 'a@b.com', password: 'password123', name: 'Test' }),
    ).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS', httpStatus: 409 });
    expect(m.user.save).not.toHaveBeenCalled();
  });
});

describe('AuthService.login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('logs in with correct credentials', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('password123', 12);
    const m = repoMocks();
    m.user.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash, emailVerified: true }));
    m.refreshToken.create.mockResolvedValue({ id: 'rt1' });

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    const res = await svc.login({ email: 'a@b.com', password: 'password123' });

    expect(res.token).toBeTypeOf('string');
    expect(res.user.email).toBe('a@b.com');
  });

  it('throws invalidCredentials for wrong password', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('password123', 12);
    const m = repoMocks();
    m.user.findByEmail.mockResolvedValue(makeUser({ passwordHash: hash }));

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    await expect(
      svc.login({ email: 'a@b.com', password: 'wrongpass' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', httpStatus: 401 });
  });

  it('throws invalidCredentials for unknown email', async () => {
    const m = repoMocks();
    m.user.findByEmail.mockResolvedValue(undefined);

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    await expect(
      svc.login({ email: 'missing@b.com', password: 'password123' }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });
});

describe('AuthService.refresh', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns a new access token for a valid stored refresh token', async () => {
    const { RefreshToken } = await import('../src/domain/entities/refreshToken/RefreshToken.entity.js');
    const m = repoMocks();
    m.refreshToken.findByTokenHash.mockResolvedValue(
      RefreshToken.create({
        id: 'rt1', userId: 'u1', tokenHash: 'h',
        expiresAt: new Date(Date.now() + 60000),
      }),
    );
    m.user.findById.mockResolvedValue(makeUser());

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    const refreshTokenStr = await (await import('../src/services/jwt.js')).signRefreshToken('u1');
    const res = await svc.refresh(refreshTokenStr);

    expect(res.token).toBeTypeOf('string');
    expect(m.refreshToken.revoke).toHaveBeenCalledWith('rt1');
  });

  it('throws invalidToken for an unknown refresh token', async () => {
    const m = repoMocks();
    m.refreshToken.findByTokenHash.mockResolvedValue(undefined);

    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    const refreshTokenStr = await (await import('../src/services/jwt.js')).signRefreshToken('u1');
    await expect(svc.refresh(refreshTokenStr)).rejects.toMatchObject({ code: 'INVALID_TOKEN' });
  });
});

describe('sanitizeUser output', () => {
  it('includes role and omits status from the output', async () => {
    const m = repoMocks();
    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    const userWithRole = User.fromSnapshot({
      id: 'u1', email: 'a@b.com', name: 'Test', phone: null,
      role: 'admin', status: 'banned', avatar: null, publicId: null,
      passwordHash: 'hash', city: null,
      emailVerified: false, phoneVerified: false,
      createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z', deletedAt: null,
    });
    m.user.findById.mockResolvedValue(userWithRole);
    const out = await svc.getMe('u1');
    expect(out.role).toBe('admin');
    expect(out).not.toHaveProperty('status');
    expect(out.id).toBe('u1');
    expect(out.email).toBe('a@b.com');
  });
});

describe('AuthService.registerWithOtp (role + profileStatus)', () => {
  beforeEach(() => vi.clearAllMocks());

  async function otpSessionMocks() {
    const m = repoMocks();
    const { sha256Hex } = await import('../src/domain/providers/password.js');
    const { RegistrationOtp } = await import('../src/domain/entities/verification/RegistrationOtp.entity.js');
    m.verification.findLatestRegistrationOtp.mockResolvedValue(
      RegistrationOtp.fromSnapshot({
        id: 'v1', identifier: 'a@b.com', type: 'email', otpHash: sha256Hex('123456'),
        expiresAt: new Date(Date.now() + 60000).toISOString(),
        verifiedAt: null, createdAt: '2024-01-01T00:00:00Z',
      }),
    );
    m.user.findByEmail.mockResolvedValue(undefined);
    m.user.findById.mockResolvedValue(makeUser());
    m.refreshToken.create.mockResolvedValue({ id: 'rt1' });
    return m;
  }

  it("returns profileStatus 'complete' for role 'user' without touching the business profile", async () => {
    const m = await otpSessionMocks();
    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer, m.verification);
    const res = await svc.registerWithOtp({
      name: 'Test', password: 'password123', type: 'email',
      identifier: 'a@b.com', code: '123456', role: 'user',
    });
    expect(res.profileStatus).toBe('complete');
    expect(res.user.role).toBe('user');
    expect(businessProfileService.create).not.toHaveBeenCalled();
  });

  it("returns profileStatus 'pending' for a business role when the profile is created", async () => {
    const m = await otpSessionMocks();
    (businessProfileService.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      profileStatus: 'pending',
      profile: { role: 'dealer', businessName: 'نمایندگی نمونه', status: 'pending' },
    });
    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer, m.verification);
    const res = await svc.registerWithOtp({
      name: 'Test', password: 'password123', type: 'email',
      identifier: 'a@b.com', code: '123456', role: 'dealer', business_name: 'نمایندگی نمونه',
    });
    expect(res.profileStatus).toBe('pending');
    expect(businessProfileService.create).toHaveBeenCalledWith('u1', 'dealer', expect.objectContaining({ business_name: 'نمایندگی نمونه' }));
  });

  it("returns profileStatus 'incomplete' when profile creation fails but the session is kept", async () => {
    const m = await otpSessionMocks();
    (businessProfileService.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('db down'));
    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer, m.verification);
    const res = await svc.registerWithOtp({
      name: 'Test', password: 'password123', type: 'email',
      identifier: 'a@b.com', code: '123456', role: 'workshop', workshop_name: 'تعمیرگاه نمونه',
    });
    expect(res.profileStatus).toBe('incomplete');
    expect(res.token).toBeTypeOf('string');
    expect(res.refreshToken).toBeTypeOf('string');
  });
});

describe('AuthService.createBusinessProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws 403 for role user', async () => {
    const m = repoMocks();
    m.user.findById.mockResolvedValue(makeUser());
    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    await expect(svc.createBusinessProfile('u1', { business_name: 'X' }))
      .rejects.toMatchObject({ code: 'FORBIDDEN', httpStatus: 403 });
    expect(businessProfileService.create).not.toHaveBeenCalled();
  });

  it('delegates to the business profile service for business roles', async () => {
    const m = repoMocks();
    m.user.findById.mockResolvedValue(makeUser({ role: 'store' }));
    const svc = new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer);
    const out = await svc.createBusinessProfile('u1', { business_name: 'فروشگاه نمونه' });
    expect(out.profileStatus).toBe('pending');
    expect(businessProfileService.create).toHaveBeenCalledWith('u1', 'store', { business_name: 'فروشگاه نمونه' });
  });
});

describe('AppError', () => {
  it('maps error codes to http statuses', () => {
    expect(new AppError('NOT_FOUND').httpStatus).toBe(404);
    expect(AppError.forbidden().httpStatus).toBe(403);
  });
});
