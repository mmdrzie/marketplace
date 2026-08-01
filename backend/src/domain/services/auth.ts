import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { User } from '../entities/user/User.entity.js';
import type { UserRepository } from '../entities/user/User.repository.js';
import type { DealerRepository } from '../entities/dealer/Dealer.repository.js';
import type { RefreshTokenRepository } from '../entities/refreshToken/RefreshToken.repository.js';
import type { VerificationRepository } from '../entities/verification/Verification.repository.js';
import { UserRepositoryImpl } from '../infrastructure/user/UserRepository.impl.js';
import { DealerRepositoryImpl } from '../infrastructure/dealer/DealerRepository.impl.js';
import { RefreshTokenRepositoryImpl } from '../infrastructure/refreshToken/RefreshTokenRepository.impl.js';
import { VerificationRepositoryImpl } from '../infrastructure/verification/VerificationRepository.impl.js';
import { signAccessToken, signRefreshToken } from '../../services/jwt.js';
import { authConfig } from '../../config/auth.js';
import { AppError } from '../../errors.js';
import { EmailService } from '../../services/email/index.js';
import { SmsService } from '../../services/sms/index.js';

const SALT_ROUNDS = 12;
const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RATE_WINDOW_SEC = 3600;
const OTP_MAX_PER_WINDOW = 3;

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sanitizeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    city: user.city,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

const refreshLocks = new Map<string, Promise<unknown>>();

async function withRefreshLock<T>(userId: string, fn: () => Promise<T>): Promise<T> {
  const existing = refreshLocks.get(userId);
  if (existing) return existing as Promise<T>;

  const promise = (async () => {
    try {
      return await fn();
    } finally {
      refreshLocks.delete(userId);
    }
  })();

  refreshLocks.set(userId, promise);
  return promise as Promise<T>;
}

export class AuthService {
  private emailService: EmailService;
  private smsService: SmsService;
  private userRepo: UserRepository;
  private refreshTokenRepo: RefreshTokenRepository;
  private dealerRepo: DealerRepository;
  private verificationRepo: VerificationRepository;

  constructor(
    emailService?: EmailService,
    smsService?: SmsService,
    userRepo?: UserRepository,
    refreshTokenRepo?: RefreshTokenRepository,
    dealerRepo?: DealerRepository,
    verificationRepo?: VerificationRepository,
  ) {
    this.emailService = emailService ?? new EmailService();
    this.smsService = smsService ?? new SmsService();
    this.userRepo = userRepo ?? new UserRepositoryImpl();
    this.refreshTokenRepo = refreshTokenRepo ?? new RefreshTokenRepositoryImpl();
    this.dealerRepo = dealerRepo ?? new DealerRepositoryImpl();
    this.verificationRepo = verificationRepo ?? new VerificationRepositoryImpl();
  }

  /* ---- Registration OTP ---- */

  async sendRegisterOtp(input: { type: 'email' | 'phone'; identifier: string }): Promise<void> {
    if (input.type === 'email') {
      const existing = await this.userRepo.findByEmail(input.identifier);
      if (existing) throw AppError.emailAlreadyExists();
    } else {
      const existing = await this.userRepo.findByPhone(input.identifier);
      if (existing) throw AppError.phoneAlreadyExists();
    }

    const recentCount = await this.verificationRepo.countRecentRegistrationOtps(
      input.identifier, input.type, OTP_RATE_WINDOW_SEC,
    );
    if (recentCount >= OTP_MAX_PER_WINDOW) {
      throw AppError.rateLimited('Too many OTP requests. Try again later.');
    }

    const code = generateOtp();
    const otpHashed = sha256(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.verificationRepo.createRegistrationOtp({
      identifier: input.identifier,
      type: input.type,
      otp_hash: otpHashed,
      expires_at: expiresAt,
    });

    if (input.type === 'email') {
      await this.emailService.sendOtp(input.identifier, code);
    } else {
      await this.smsService.sendOtp(input.identifier, code);
    }
  }

  async registerWithOtp(input: {
    name: string;
    password: string;
    type: 'email' | 'phone';
    identifier: string;
    code: string;
    role?: 'user' | 'dealer' | 'agency' | 'store' | 'workshop';
  }) {
    const stored = await this.verificationRepo.findLatestRegistrationOtp(input.identifier, input.type);
    if (!stored) throw AppError.otpInvalid();
    if (stored.isExpired) throw AppError.otpExpired();

    const valid = sha256(input.code) === stored.otpHash;
    if (!valid) throw AppError.otpInvalid();

    if (input.type === 'email') {
      const existing = await this.userRepo.findByEmail(input.identifier);
      if (existing) throw AppError.emailAlreadyExists();
    } else {
      const existing = await this.userRepo.findByPhone(input.identifier);
      if (existing) throw AppError.phoneAlreadyExists();
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const id = crypto.randomUUID();

    const email = input.type === 'email'
      ? input.identifier
      : `phone_${sha256(input.identifier).substring(0, 12)}@bazaar.local`;
    const phone = input.type === 'phone' ? input.identifier : null;

    const user = User.fromSnapshot({
      id,
      email,
      name: input.name,
      phone,
      role: input.role || 'user',
      status: 'active',
      avatar: null,
      publicId: null,
      passwordHash,
      city: null,
      emailVerified: input.type === 'email',
      phoneVerified: input.type === 'phone',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });

    try {
      await this.userRepo.save(user);
    } catch (err) {
      if (err && (err as { code?: string }).code === '23505') {
        throw AppError.emailAlreadyExists();
      }
      throw err;
    }

    await this.verificationRepo.markRegistrationOtpVerified(stored.id);

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
    });

    const refreshToken = await signRefreshToken(user.id);
    await this.refreshTokenRepo.revokeAllForUser(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.create({
      user_id: user.id,
      token_hash: sha256(refreshToken),
      expires_at: expiresAt,
    });

    const created = await this.userRepo.findById(user.id);
    return {
      token: accessToken,
      refreshToken,
      user: sanitizeUser(created ?? user),
    };
  }

  /* ---- Legacy email+password register ---- */

  async register(input: { email: string; password: string; name: string }) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.emailAlreadyExists();
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const id = crypto.randomUUID();
    const user = User.fromSnapshot({
      id,
      email: input.email,
      name: input.name,
      phone: null,
      role: 'user',
      status: 'active',
      avatar: null,
      publicId: null,
      passwordHash,
      city: null,
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    });

    try {
      await this.userRepo.save(user);
    } catch (err) {
      if (err && (err as { code?: string }).code === '23505') {
        throw AppError.emailAlreadyExists();
      }
      throw err;
    }

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
    });

    const refreshToken = await signRefreshToken(user.id);
    await this.refreshTokenRepo.revokeAllForUser(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.create({
      user_id: user.id,
      token_hash: sha256(refreshToken),
      expires_at: expiresAt,
    });

    const created = await this.userRepo.findById(user.id);
    return {
      token: accessToken,
      refreshToken,
      user: sanitizeUser(created ?? user),
    };
  }

  async login(input: { email: string; password: string }) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.invalidCredentials();
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash ?? '');
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
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
    });

    const refreshToken = await signRefreshToken(user.id);
    await this.refreshTokenRepo.revokeAllForUser(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepo.create({
      user_id: user.id,
      token_hash: sha256(refreshToken),
      expires_at: expiresAt,
    });

    return {
      token: accessToken,
      refreshToken,
      user: sanitizeUser(user),
    };
  }

  async refresh(refreshTokenStr: string) {
    let payload: { sub?: string };
    try {
      const { payload: p } = await jwtVerify(refreshTokenStr, authConfig.secret);
      payload = p as { sub?: string };
    } catch {
      throw AppError.invalidToken();
    }

    if (!payload.sub) {
      throw AppError.invalidToken();
    }

    const stored = await this.refreshTokenRepo.findByTokenHash(sha256(refreshTokenStr));
    if (!stored) {
      throw AppError.invalidToken();
    }

    if (stored.isExpired) {
      throw AppError.tokenExpired();
    }

    const user = await this.userRepo.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw AppError.unauthorized();
    }

    return withRefreshLock(user.id, async () => {
      const current = await this.refreshTokenRepo.findByTokenHash(sha256(refreshTokenStr));
      if (!current) {
        throw AppError.invalidToken();
      }
      if (current.isExpired) {
        throw AppError.tokenExpired();
      }

      await this.refreshTokenRepo.revoke(current.id);

      const accessToken = await signAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
      });

      const newRefreshToken = await signRefreshToken(user.id);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await this.refreshTokenRepo.create({
        user_id: user.id,
        token_hash: sha256(newRefreshToken),
        expires_at: expiresAt,
      });

      return { token: accessToken, refreshToken: newRefreshToken };
    });
  }

  async logout(refreshTokenStr: string) {
    const stored = await this.refreshTokenRepo.findByTokenHash(sha256(refreshTokenStr));
    if (stored) {
      await this.refreshTokenRepo.revoke(stored.id);
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return sanitizeUser(user);
  }

  async updateProfile(
    userId: string,
    data: {
      name?: string;
      avatar?: string | null;
      phone?: string | null;
      email?: string;
      city?: string | null;
      business_name?: string;
      dealer_code?: string;
      business_address?: string;
      business_description?: string;
    },
  ) {
    const existing = await this.userRepo.findById(userId);
    if (!existing) throw AppError.notFound('User not found');

    if (data.name !== undefined) existing.name = data.name;
    if (data.avatar !== undefined) existing.avatar = data.avatar;
    if (data.phone !== undefined) existing.phone = data.phone;
    if (data.city !== undefined) existing.city = data.city;
    if (data.email !== undefined && data.email !== existing.email) {
      existing.email = data.email;
      existing.emailVerified = false;
    }
    existing.updatedAt = new Date();

    await this.userRepo.save(existing);

    const isDealer = existing.role === 'dealer' || existing.role === 'agency' || existing.role === 'store';
    const hasDealerFields =
      data.business_name !== undefined ||
      data.dealer_code !== undefined ||
      data.business_address !== undefined ||
      data.business_description !== undefined;

    if (isDealer && hasDealerFields) {
      const dealer = await this.dealerRepo.findByUserId(userId);
      if (dealer) {
        if (data.business_name !== undefined) dealer.businessName = data.business_name;
        if (data.dealer_code !== undefined) dealer.dealerCode = data.dealer_code;
        if (data.business_address !== undefined) dealer.address = data.business_address;
        if (data.business_description !== undefined) dealer.description = data.business_description;
        dealer.updatedAt = new Date();
        await this.dealerRepo.save(dealer);
      }
    }

    return sanitizeUser(existing);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return;
    }

    const resetToken = await new SignJWT({ sub: user.id, type: 'password_reset' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(authConfig.secret);

    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub?: string; type?: string };
    try {
      const { payload: p } = await jwtVerify(token, authConfig.secret);
      payload = p as { sub?: string; type?: string };
    } catch {
      throw AppError.invalidToken('Invalid or expired reset token');
    }

    if (payload.type !== 'password_reset') {
      throw AppError.invalidToken('Invalid or expired reset token');
    }

    if (!payload.sub) {
      throw AppError.invalidToken();
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.userRepo.updatePassword(payload.sub, passwordHash);
  }
}

export const authService = new AuthService();
