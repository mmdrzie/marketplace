import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../src/domain/services/auth';
import { AppError } from '../src/errors';
import { ErrorCode } from '../src/shared';

vi.mock('../src/repositories/user', () => ({
  userRepo: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    updatePassword: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../src/repositories/refreshToken', () => ({
  refreshTokenRepo: {
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    revoke: vi.fn(),
  },
}));

vi.mock('../src/services/jwt', () => ({
  signAccessToken: vi.fn(() => Promise.resolve('mock-access-token')),
  signRefreshToken: vi.fn(() => Promise.resolve('mock-refresh-token')),
}));

vi.mock('../src/services/email', () => ({
  EmailService: vi.fn(() => ({
    sendPasswordResetEmail: vi.fn(),
    sendVerificationEmail: vi.fn(),
  })),
}));

import { userRepo } from '../src/repositories/user';
import { refreshTokenRepo } from '../src/repositories/refreshToken';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('creates user and returns tokens', async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(undefined);
      vi.mocked(userRepo.create).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password_hash: 'hashed',
        name: 'Test User',
        phone: null,
        role: 'user',
        status: 'active',
        avatar: null,
        city: null,
        email_verified_at: null,
        phone_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      });

      const result = await authService.register({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.token).toBe('mock-access-token');
      expect(result.user.email).toBe('test@test.com');
      expect(userRepo.create).toHaveBeenCalledOnce();
    });

    it('throws EMAIL_ALREADY_EXISTS when email exists', async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue({
        id: 'existing',
        email: 'test@test.com',
      } as any);

      await expect(
        authService.register({ email: 'test@test.com', password: 'password123', name: 'T' }),
      ).rejects.toThrow(AppError);

      await expect(
        authService.register({ email: 'test@test.com', password: 'password123', name: 'T' }),
      ).rejects.toMatchObject({ code: ErrorCode.EMAIL_ALREADY_EXISTS });
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('password123', 4);

      vi.mocked(userRepo.findByEmail).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password_hash: hash,
        name: 'Test',
        phone: null,
        role: 'user',
        status: 'active',
        avatar: null,
        city: null,
        email_verified_at: null,
        phone_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result.token).toBe('mock-access-token');
    });

    it('throws INVALID_CREDENTIALS for wrong password', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('correct-password', 4);

      vi.mocked(userRepo.findByEmail).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password_hash: hash,
        status: 'active',
      } as any);

      await expect(
        authService.login({ email: 'test@test.com', password: 'wrong-password' }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
    });

    it('throws INVALID_CREDENTIALS for non-existent email', async () => {
      vi.mocked(userRepo.findByEmail).mockResolvedValue(undefined);

      await expect(
        authService.login({ email: 'none@test.com', password: 'password123' }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
    });

    it('throws FORBIDDEN for deactivated user', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash('password123', 4);

      vi.mocked(userRepo.findByEmail).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password_hash: hash,
        status: 'banned',
      } as any);

      await expect(
        authService.login({ email: 'test@test.com', password: 'password123' }),
      ).rejects.toMatchObject({ code: ErrorCode.FORBIDDEN });
    });
  });

  describe('getMe', () => {
    it('returns user when found', async () => {
      vi.mocked(userRepo.findById).mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        name: 'Test',
        phone: null,
        role: 'user',
        status: 'active',
        avatar: null,
        city: null,
        email_verified_at: null,
        phone_verified_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      const result = await authService.getMe('user-1');
      expect(result.email).toBe('test@test.com');
    });

    it('throws NOT_FOUND when user does not exist', async () => {
      vi.mocked(userRepo.findById).mockResolvedValue(undefined);

      await expect(authService.getMe('nonexistent')).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
      });
    });
  });
});
