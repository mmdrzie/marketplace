import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from '../entities/user/User.entity.js';
import type { UserRepository } from '../entities/user/User.repository.js';
import type { VerificationRepository } from '../entities/verification/Verification.repository.js';
import { AppError } from '../../errors.js';
import { EmailService } from '../../services/email/index.js';
import { SmsService } from '../../services/sms/index.js';
import type {
  AuthProvider,
  AuthSession,
  AuthenticateResult,
  SessionIssuer,
} from './AuthProvider.js';

const SALT_ROUNDS = 12;
const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RATE_WINDOW_SEC = 3600;
export const OTP_MAX_PER_WINDOW = 3;

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function generateOtp(): string {
  return crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
}

export interface PasswordProviderDeps {
  emailService: EmailService;
  smsService: SmsService;
  userRepo: UserRepository;
  verificationRepo: VerificationRepository;
  sessionIssuer: SessionIssuer;
}

export type RegisterMethod = 'email' | 'phone';

export class PasswordAuthProvider implements AuthProvider {
  readonly name = 'password';

  private readonly emailService: EmailService;
  private readonly smsService: SmsService;
  private readonly userRepo: UserRepository;
  private readonly verificationRepo: VerificationRepository;
  private readonly sessionIssuer: SessionIssuer;

  constructor(deps: PasswordProviderDeps) {
    this.emailService = deps.emailService;
    this.smsService = deps.smsService;
    this.userRepo = deps.userRepo;
    this.verificationRepo = deps.verificationRepo;
    this.sessionIssuer = deps.sessionIssuer;
  }

  /* ---- Registration OTP ---- */

  async sendRegisterOtp(input: { type: RegisterMethod; identifier: string }): Promise<void> {
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
    type: RegisterMethod;
    identifier: string;
    code: string;
    role?: 'user' | 'dealer' | 'agency' | 'store' | 'workshop';
  }): Promise<AuthSession> {
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
      hasPassword: true,
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

    return this.sessionIssuer.issueSession(user);
  }

  /* ---- Legacy email+password register ---- */

  async register(input: { email: string; password: string; name: string }): Promise<AuthSession> {
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
      hasPassword: true,
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

    return this.sessionIssuer.issueSession(user);
  }

  /* ---- Login (email + password) ---- */

  async authenticate(input: { email: string; password: string }): Promise<AuthenticateResult> {
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

    // Email verification gate: only real emails are locked; phone-registered
    // users (synthetic @bazaar.local address) keep logging in with their phone.
    if (!user.emailVerified && !user.email.endsWith('@bazaar.local')) {
      throw AppError.emailNotVerified();
    }

    return { kind: 'session', user };
  }

  /* ---- Password recovery ---- */

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
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

    if (user.hasPassword === false) {
      // Google-only account: the link sets the FIRST password (has_password → true).
      await this.emailService.sendSetPasswordEmail(email, resetToken);
    } else {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const { jwtVerify } = await import('jose');
    const { authConfig } = await import('../../config/auth.js');

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

export { sha256 as sha256Hex, generateOtp as generateOtpCode };
