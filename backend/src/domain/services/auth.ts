import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { userRepo } from '../../repositories/user.js';
import { refreshTokenRepo } from '../../repositories/refreshToken.js';
import { signAccessToken, signRefreshToken } from '../../services/jwt.js';
import { AppError } from '../../errors.js';
import { EmailService } from '../../services/email/index.js';
import { eventBus, UserRegistered } from '../events/index.js';

const SALT_ROUNDS = 12;
const PASSWORD_RESET_PREFIX = 'pwd_reset:';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export class AuthService {
  private emailService: EmailService;

  constructor(emailService?: EmailService) {
    this.emailService = emailService ?? new EmailService();
  }

  async register(input: { email: string; password: string; name: string }) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.emailAlreadyExists();
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepo.create({
      email: input.email,
      password_hash: passwordHash,
      name: input.name,
    });

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: !!user.phone_verified_at,
      emailVerified: !!user.email_verified_at,
    });

    const refreshToken = await signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepo.create({
      user_id: user.id,
      token_hash: sha256(refreshToken),
      expires_at: expiresAt,
    });

    eventBus.publish(UserRegistered, { userId: user.id, email: user.email, name: user.name });

    return {
      token: accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async login(input: { email: string; password: string }) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.invalidCredentials();
    }

    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      throw AppError.invalidCredentials();
    }

    if (user.status !== 'active') {
      throw AppError.forbidden('Account is deactivated');
    }

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: !!user.phone_verified_at,
      emailVerified: !!user.email_verified_at,
    });

    const refreshToken = await signRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepo.create({
      user_id: user.id,
      token_hash: sha256(refreshToken),
      expires_at: expiresAt,
    });

    return {
      token: accessToken,
      refreshToken,
      user: this.sanitizeUser(user),
    };
  }

  async refresh(refreshTokenStr: string) {
    let payload: { sub?: string };
    try {
      const { jwtVerify } = await import('jose');
      const { authConfig } = await import('../../config/auth.js');
      const { payload: p } = await jwtVerify(refreshTokenStr, authConfig.secret);
      payload = p as { sub?: string };
    } catch {
      throw AppError.invalidToken();
    }

    if (!payload.sub) {
      throw AppError.invalidToken();
    }

    const stored = await refreshTokenRepo.findByTokenHash(sha256(refreshTokenStr));
    if (!stored) {
      throw AppError.invalidToken();
    }

    if (new Date(stored.expires_at) < new Date()) {
      throw AppError.tokenExpired();
    }

    const user = await userRepo.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw AppError.unauthorized();
    }

    await refreshTokenRepo.revoke(stored.id);

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: !!user.phone_verified_at,
      emailVerified: !!user.email_verified_at,
    });

    const newRefreshToken = await signRefreshToken(user.id);
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepo.create({
      user_id: user.id,
      token_hash: newRefreshHash,
      expires_at: expiresAt,
    });

    return { token: accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshTokenStr: string) {
    const stored = await refreshTokenRepo.findByTokenHash(sha256(refreshTokenStr));
    if (stored) {
      await refreshTokenRepo.revoke(stored.id);
    }
  }

  async getMe(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string | null }) {
    const user = await userRepo.update(userId, data);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return this.sanitizeUser(user);
  }

  async forgotPassword(email: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return;
    }

    const { SignJWT } = await import('jose');
    const { authConfig } = await import('../../config/auth.js');
    const resetToken = await new SignJWT({ sub: user.id, type: 'password_reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(authConfig.secret);

    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub?: string };
    try {
      const { jwtVerify } = await import('jose');
      const { authConfig } = await import('../../config/auth.js');
      const { payload: p } = await jwtVerify(token, authConfig.secret);
      payload = p as { sub?: string };
    } catch {
      throw AppError.invalidToken('Invalid or expired reset token');
    }

    if (!payload.sub) {
      throw AppError.invalidToken();
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepo.updatePassword(payload.sub, passwordHash);
  }

  private sanitizeUser(user: { id: string; email: string; name: string; phone: string | null; role: string; status: string; avatar: string | null; city: string | null; email_verified_at: string | null; phone_verified_at: string | null; created_at: string; updated_at: string }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      city: user.city,
      emailVerified: !!user.email_verified_at,
      phoneVerified: !!user.phone_verified_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}

export const authService = new AuthService();
