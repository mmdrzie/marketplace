import { config } from './index.js';

export interface RateLimitEntry {
  limit: number;
  window: number;
}

export const rateLimits: Record<string, RateLimitEntry> = {
  global: config.rateLimits.global,
  login: config.rateLimits.login,
  register: config.rateLimits.register,
  'otp:send': config.rateLimits.otpSend,
  'otp:verify': config.rateLimits.otpVerify,
  'forgot:password': config.rateLimits.forgotPassword,
  'email:verify': config.rateLimits.verifyEmail,
  'listing:publish': config.rateLimits.publishListing,
  'conversation:create': config.rateLimits.createConversation,
  'message:send': config.rateLimits.sendMessage,
};
