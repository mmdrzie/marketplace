import crypto from 'node:crypto';
import { jwtVerify } from 'jose';
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
import { PasswordAuthProvider, type RegisterMethod, generateOtpCode, sha256Hex, OTP_TTL_MS, OTP_RATE_WINDOW_SEC, OTP_MAX_PER_WINDOW } from '../providers/password.js';
import { GoogleAuthProvider } from '../providers/google.js';
import { OauthAccountRepositoryImpl } from '../infrastructure/oauth/OauthAccountRepository.impl.js';
import { OneTimeTokenRepositoryImpl } from '../infrastructure/oauth/OneTimeTokenRepository.impl.js';
import { OauthLoginLogRepositoryImpl } from '../infrastructure/oauth/OauthLoginLogRepository.impl.js';
import type {
  AuthSession,
  AuthIdentity,
  AuthCore,
  IssueSessionOptions,
  SanitizedUser,
} from '../providers/AuthProvider.js';

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sanitizeUser(user: User): SanitizedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    city: user.city,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    hasPassword: user.hasPassword,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
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

/**
 * Auth core. Owns provider-agnostic concerns:
 * - session issuance (access + refresh + cookie-ready tokens)
 * - user creation from normalized identities
 * - refresh rotation, logout, profile
 * - delegation to registered auth providers (password, google, ...)
 *
 * See ADR-012 (docs/adr/ADR-012-auth-providers.md).
 */
export class AuthService implements AuthCore {
  private emailService: EmailService;
  private smsService: SmsService;
  private userRepo: UserRepository;
  private refreshTokenRepo: RefreshTokenRepository;
  private dealerRepo: DealerRepository;
  private verificationRepo: VerificationRepository;

  readonly passwordProvider: PasswordAuthProvider;
  readonly googleProvider: GoogleAuthProvider;

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

    this.passwordProvider = new PasswordAuthProvider({
      emailService: this.emailService,
      smsService: this.smsService,
      userRepo: this.userRepo,
      verificationRepo: this.verificationRepo,
      sessionIssuer: this,
    });

    this.googleProvider = new GoogleAuthProvider({
      userRepo: this.userRepo,
      oauthRepo: new OauthAccountRepositoryImpl(),
      oneTimeRepo: new OneTimeTokenRepositoryImpl(),
      loginLogRepo: new OauthLoginLogRepositoryImpl(),
      verificationRepo: this.verificationRepo,
      emailService: this.emailService,
      core: this,
      passwordProvider: this.passwordProvider,
    });
  }

  /* ---- Session issuance (SessionIssuer) ---- */

  async issueSession(user: User, opts?: IssueSessionOptions): Promise<AuthSession> {
    const singleSession = opts?.singleSession ?? authConfig.singleSession;

    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
    });

    const refreshToken = await signRefreshToken(user.id);
    if (singleSession) {
      await this.refreshTokenRepo.revokeAllForUser(user.id);
    }
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

  /**
   * Create a user from a normalized provider identity. Used by provider flows
   * (e.g. Google) for brand-new accounts. Role always defaults to 'user'.
   */
  async createUserFromIdentity(
    identity: AuthIdentity,
    opts?: { role?: User['role']; phone?: string | null },
  ): Promise<User> {
    const email = identity.email || '';
    const id = crypto.randomUUID();
    const passwordHash = await import('bcryptjs').then((bcrypt) =>
      bcrypt.hash(crypto.randomUUID(), 12),
    );

    const user = User.fromSnapshot({
      id,
      email,
      name: identity.displayName ?? null,
      phone: opts?.phone ?? identity.phone ?? null,
      role: opts?.role ?? 'user',
      status: 'active',
      avatar: identity.avatarUrl ?? null,
      publicId: null,
      passwordHash,
      city: null,
      emailVerified: identity.emailVerified,
      phoneVerified: false,
      hasPassword: false,
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

    return user;
  }

  /* ---- Password provider delegation (public API unchanged) ---- */

  sendRegisterOtp(input: { type: RegisterMethod; identifier: string }): Promise<void> {
    return this.passwordProvider.sendRegisterOtp(input);
  }

  registerWithOtp(input: {
    name: string;
    password: string;
    type: RegisterMethod;
    identifier: string;
    code: string;
    role?: 'user' | 'dealer' | 'agency' | 'store' | 'workshop';
  }): Promise<AuthSession> {
    return this.passwordProvider.registerWithOtp(input);
  }

  register(input: { email: string; password: string; name: string }): Promise<AuthSession> {
    return this.passwordProvider.register(input);
  }

  async login(input: { email: string; password: string }): Promise<AuthSession> {
    const result = await this.passwordProvider.authenticate(input);
    if (result.kind !== 'session') {
      throw AppError.invalidCredentials();
    }
    return this.issueSession(result.user);
  }

  forgotPassword(email: string): Promise<void> {
    return this.passwordProvider.forgotPassword(email);
  }

  resetPassword(token: string, newPassword: string): Promise<void> {
    return this.passwordProvider.resetPassword(token, newPassword);
  }

  /* ---- Google provider delegation ---- */

  googleAuthorize(redirect?: string | null) {
    return this.googleProvider.authorize({ redirect });
  }

  googleCallback(input: {
    code?: string;
    error?: string;
    stateJti: string;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    return this.googleProvider.handleCallback(input);
  }

  googleFinalize(t: string, meta?: { ip?: string | null; userAgent?: string | null }) {
    return this.googleProvider.finalize({ t, ...meta });
  }

  googleVerify(t: string, code: string, meta?: { ip?: string | null; userAgent?: string | null }) {
    return this.googleProvider.verifyCode({ t, code, ...meta });
  }

  googleResend(t: string, meta?: { ip?: string | null; userAgent?: string | null }) {
    return this.googleProvider.resendCode({ t, ...meta });
  }

  googleLink(t: string, password: string, meta?: { ip?: string | null; userAgent?: string | null }) {
    return this.googleProvider.linkAccount({ t, password, ...meta });
  }

  googleStatus(): { enabled: boolean } {
    return { enabled: this.googleProvider.isConfigured() };
  }

  /* ---- Email verification fallback (blocked login / email change) ---- */

  /** Send a 6-digit code to a real (non-synthetic) email address. */
  async sendEmailVerificationCode(email: string): Promise<void> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) return; // do not reveal account existence
    if (user.emailVerified) return;
    if (user.email.endsWith('@bazaar.local')) return;

    const recentCount = await this.verificationRepo.countRecentRegistrationOtps(
      user.email, 'email', OTP_RATE_WINDOW_SEC,
    );
    if (recentCount >= OTP_MAX_PER_WINDOW) {
      throw AppError.rateLimited('Too many OTP requests. Try again later.');
    }

    const code = generateOtpCode();
    await this.verificationRepo.createRegistrationOtp({
      identifier: user.email,
      type: 'email',
      otp_hash: sha256Hex(code),
      expires_at: new Date(Date.now() + OTP_TTL_MS),
    });
    await this.emailService.sendOtp(user.email, code);
  }

  /** Verify the emailed code, mark the email verified, and log the user in. */
  async verifyEmailCodeAndLogin(email: string, code: string): Promise<AuthSession> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw AppError.invalidCredentials();

    const stored = await this.verificationRepo.findLatestRegistrationOtp(user.email, 'email');
    if (!stored) throw AppError.otpInvalid();
    if (stored.isExpired) throw AppError.otpExpired();
    if (sha256Hex(code) !== stored.otpHash) throw AppError.otpInvalid();
    await this.verificationRepo.markRegistrationOtpVerified(stored.id);

    if (!user.emailVerified) {
      user.verifyEmail();
      await this.userRepo.save(user);
    }

    return this.issueSession(user);
  }

  /* ---- Refresh rotation (core) ---- */

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
      if (!data.email.endsWith('@bazaar.local')) {
        this.sendEmailVerificationCode(data.email).catch(() => { /* non-blocking */ });
      }
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
}

export const authService = new AuthService();
