import bcrypt from 'bcryptjs';
import { verificationRepo } from '../../repositories/verification';
import { userRepo } from '../../repositories/user';
import { AppError } from '../../errors';
import { EmailService } from '../../services/email';
import { eventBus, EmailVerified } from '../events';

export class EmailVerificationService {
  private emailService: EmailService;

  constructor(emailService?: EmailService) {
    this.emailService = emailService ?? new EmailService();
  }

  async sendVerification(userId: string, email: string): Promise<void> {
    const { SignJWT } = await import('jose');
    const { authConfig } = await import('../../config/auth');

    const token = await new SignJWT({ sub: userId, type: 'email_verify' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(authConfig.secret);

    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await verificationRepo.createEmailVerification({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });

    await this.emailService.sendVerificationEmail(email, token);
  }

  async verify(token: string): Promise<void> {
    let payload: { sub?: string };
    try {
      const { jwtVerify } = await import('jose');
      const { authConfig } = await import('../../config/auth');
      const { payload: p } = await jwtVerify(token, authConfig.secret);
      payload = p as { sub?: string };
    } catch {
      throw AppError.invalidToken('Invalid or expired verification token');
    }

    if (!payload.sub) {
      throw AppError.invalidToken();
    }

    const tokenHash = await bcrypt.hash(token, 10);
    const stored = await verificationRepo.findEmailVerificationByHash(tokenHash);
    if (!stored) {
      throw AppError.invalidToken();
    }

    if (new Date(stored.expires_at) < new Date()) {
      throw AppError.invalidToken('Verification token expired');
    }

    await verificationRepo.markEmailVerified(stored.id);
    await userRepo.update(payload.sub, { email_verified_at: new Date().toISOString() });

    eventBus.publish(EmailVerified, { userId: payload.sub, email: '' });
  }
}

export const emailVerificationService = new EmailVerificationService();
