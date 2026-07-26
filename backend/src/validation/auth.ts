import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const registerWithOtpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  type: z.enum(['email', 'phone']),
  identifier: z.string().min(3).max(255),
  code: z.string().length(6, 'OTP code must be 6 digits'),
  role: z.enum(['user', 'dealer', 'agency', 'store']).optional().default('user'),
});

export const sendRegisterOtpSchema = z.object({
  type: z.enum(['email', 'phone']),
  identifier: z.string().min(3).max(255),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().max(500).nullable().optional(),
  phone: z.string().max(15).nullable().optional(),
  email: z.string().email().optional(),
  city: z.string().max(100).nullable().optional(),
  business_name: z.string().max(200).optional(),
  dealer_code: z.string().max(50).optional(),
  business_address: z.string().max(500).optional(),
  business_description: z.string().max(2000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterWithOtpInput = z.infer<typeof registerWithOtpSchema>;
export type SendRegisterOtpInput = z.infer<typeof sendRegisterOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
