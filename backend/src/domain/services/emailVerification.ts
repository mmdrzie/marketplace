import { createHash } from 'node:crypto';
import type { UserRepository } from '../entities/user/User.repository.js';
import type { VerificationRepository } from '../entities/verification/Verification.repository.js';
import { UserRepositoryImpl } from '../infrastructure/user/UserRepository.impl.js';
import { VerificationRepositoryImpl } from '../infrastructure/verification/VerificationRepository.impl.js';
import { AppError } from '../../errors.js';
import { EmailService } from '../../services/email/index.js';

export class EmailVerificationService {
  private emailService: EmailService;
  private verificationRepo: VerificationRepository;
  private userRepo: UserRepository;

  constructor(
    emailService?: EmailService,
    verificationRepo?: VerificationRepository,
    userRepo?: UserRepository,
  ) {
    this.emailService = emailService ?? new EmailService();
    this.verificationRepo = verificationRepo ?? new VerificationRepositoryImpl();
    this.userRepo = userRepo ?? new UserRepositoryImpl();
  }

  async sendVerification(userId: string, email: string): Promise<void> {
    const { SignJWT } = await import('jose');
    const { authConfig } = await import('../../config/auth.js');

    const token = await new SignJWT({ sub: userId, type: 'email_verify' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(authConfig.secret);

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.verificationRepo.createEmailVerification({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });

    await this.emailService.sendVerificationEmail(email, token);
  }

  async verify(token: string): Promise<void> {
    let payload: { sub?: string; type?: string };
    try {
      const { jwtVerify } = await import('jose');
      const { authConfig } = await import('../../config/auth.js');
      const { payload: p } = await jwtVerify(token, authConfig.secret);
      payload = p as { sub?: string; type?: string };
    } catch {
      throw AppError.invalidToken('Invalid or expired verification token');
    }

    if (payload.type !== 'email_verify') {
      throw AppError.invalidToken('Invalid or expired verification token');
    }

    if (!payload.sub) {
      throw AppError.invalidToken();
    }

    const stored = await this.verificationRepo.findLatestEmailVerification(payload.sub);
    if (!stored) {
      throw AppError.invalidToken();
    }

    if (stored.expiresAt < new Date()) {
      throw AppError.invalidToken('Verification token expired');
    }

    const valid = createHash('sha256').update(token).digest('hex') === stored.tokenHash;
    if (!valid) {
      throw AppError.invalidToken();
    }

    await this.verificationRepo.markEmailVerified(stored.id);

    const user = await this.userRepo.findById(payload.sub);
    if (user) {
      user.verifyEmail();
      await this.userRepo.save(user);
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
