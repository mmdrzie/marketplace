import { EmailVerification } from './EmailVerification.entity.js';
import { PhoneVerification } from './PhoneVerification.entity.js';
import { RegistrationOtp } from './RegistrationOtp.entity.js';

export interface VerificationRepository {
  findLatestEmailVerification(userId: string): Promise<EmailVerification | null>;
  createEmailVerification(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<EmailVerification>;
  findEmailVerificationByHash(hash: string): Promise<EmailVerification | null>;
  markEmailVerified(id: string): Promise<void>;

  createPhoneVerification(data: { user_id: string; phone: string; otp_hash: string; expires_at: Date }): Promise<PhoneVerification>;
  findLatestPhoneVerification(userId: string, phone: string): Promise<PhoneVerification | null>;
  markPhoneVerified(id: string): Promise<void>;
  countRecentByPhone(phone: string, withinSeconds: number): Promise<number>;
  countRecentByUser(userId: string, withinSeconds: number): Promise<number>;

  createRegistrationOtp(data: { identifier: string; type: 'email' | 'phone'; otp_hash: string; expires_at: Date }): Promise<RegistrationOtp>;
  findLatestRegistrationOtp(identifier: string, type: 'email' | 'phone'): Promise<RegistrationOtp | null>;
  markRegistrationOtpVerified(id: string): Promise<void>;
  countRecentRegistrationOtps(identifier: string, type: 'email' | 'phone', withinSeconds: number): Promise<number>;
}
