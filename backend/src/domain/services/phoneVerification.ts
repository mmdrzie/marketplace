import crypto from 'crypto';
import type { UserRepository } from '../entities/user/User.repository.js';
import type { VerificationRepository } from '../entities/verification/Verification.repository.js';
import { UserRepositoryImpl } from '../infrastructure/user/UserRepository.impl.js';
import { VerificationRepositoryImpl } from '../infrastructure/verification/VerificationRepository.impl.js';
import { AppError } from '../../errors.js';
import { SmsService } from '../../services/sms/index.js';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RATE_WINDOW_SEC = 3600;
const OTP_MAX_PER_WINDOW = 3;

export class PhoneVerificationService {
  private smsService: SmsService;
  private verificationRepo: VerificationRepository;
  private userRepo: UserRepository;

  constructor(
    smsService?: SmsService,
    verificationRepo?: VerificationRepository,
    userRepo?: UserRepository,
  ) {
    this.smsService = smsService ?? new SmsService();
    this.verificationRepo = verificationRepo ?? new VerificationRepositoryImpl();
    this.userRepo = userRepo ?? new UserRepositoryImpl();
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOtp(userId: string, phone: string): Promise<void> {
    const recentCount = await this.verificationRepo.countRecentByPhone(phone, OTP_RATE_WINDOW_SEC);
    if (recentCount >= OTP_MAX_PER_WINDOW) {
      throw AppError.rateLimited('OTP rate limited. Try again later.');
    }

    const code = this.generateOtp();
    const otpHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.verificationRepo.createPhoneVerification({ user_id: userId, phone, otp_hash: otpHash, expires_at: expiresAt });

    await this.smsService.sendOtp(phone, code);
  }

  async verifyOtp(userId: string, phone: string, code: string): Promise<void> {
    const stored = await this.verificationRepo.findLatestPhoneVerification(userId, phone);
    if (!stored) {
      throw AppError.otpInvalid();
    }

    if (stored.expiresAt < new Date()) {
      throw AppError.otpExpired();
    }

    const valid = crypto.createHash('sha256').update(code).digest('hex') === stored.otpHash;
    if (!valid) {
      throw AppError.otpInvalid();
    }

    await this.verificationRepo.markPhoneVerified(stored.id);

    const user = await this.userRepo.findById(userId);
    if (user) {
      user.phone = phone;
      user.verifyPhone();
      await this.userRepo.save(user);
    }
  }

  async getStatus(userId: string): Promise<{ phone: string | null; verified: boolean }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return {
      phone: user.phone,
      verified: user.phoneVerified,
    };
  }
}

export const phoneVerificationService = new PhoneVerificationService();
