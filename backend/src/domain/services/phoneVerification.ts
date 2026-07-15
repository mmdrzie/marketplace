import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { verificationRepo } from '../../repositories/verification.js';
import { userRepo } from '../../repositories/user.js';
import { AppError } from '../../errors.js';
import { SmsService } from '../../services/sms/index.js';
import { eventBus, PhoneVerified } from '../events/index.js';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RATE_WINDOW_SEC = 3600;
const OTP_MAX_PER_WINDOW = 3;

export class PhoneVerificationService {
  private smsService: SmsService;

  constructor(smsService?: SmsService) {
    this.smsService = smsService ?? new SmsService();
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOtp(userId: string, phone: string): Promise<void> {
    const recentCount = await verificationRepo.countRecentByPhone(phone, OTP_RATE_WINDOW_SEC);
    if (recentCount >= OTP_MAX_PER_WINDOW) {
      throw AppError.rateLimited('OTP rate limited. Try again later.');
    }

    const code = this.generateOtp();
    const otpHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await verificationRepo.createPhoneVerification({ user_id: userId, phone, otp_hash: otpHash, expires_at: expiresAt });

    await this.smsService.sendOtp(phone, code);
  }

  async verifyOtp(userId: string, phone: string, code: string): Promise<void> {
    const stored = await verificationRepo.findLatestPhoneVerification(userId, phone);
    if (!stored) {
      throw AppError.otpInvalid();
    }

    if (new Date(stored.expires_at) < new Date()) {
      throw AppError.otpExpired();
    }

    const valid = await bcrypt.compare(code, stored.otp_hash);
    if (!valid) {
      throw AppError.otpInvalid();
    }

    await verificationRepo.markPhoneVerified(stored.id);
    await userRepo.update(userId, { phone, phone_verified_at: new Date().toISOString() });

    eventBus.publish(PhoneVerified, { userId, phone });
  }

  async getStatus(userId: string): Promise<{ phone: string | null; verified: boolean }> {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return {
      phone: user.phone,
      verified: !!user.phone_verified_at,
    };
  }
}

export const phoneVerificationService = new PhoneVerificationService();
