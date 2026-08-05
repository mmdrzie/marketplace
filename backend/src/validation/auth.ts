import { z } from 'zod';
import type { Context } from 'hono';
import { ErrorCode } from '../shared/index.js';
import { AUTH_ROLES, WORKSHOP_TYPES } from '../shared/auth.js';

/**
 * zValidator default hook for auth routes: consistent error shape
 * `{ success:false, error:{ code:'VALIDATION_ERROR', message, issues } }` with
 * HTTP 422 (AUTH_API.md §8) instead of zValidator's raw ZodError 400.
 */
export function validationErrorHook(
  result: { success: true; data: unknown } | { success: false; error: z.ZodError },
  c: Context,
): Response | void {
  if (!result.success) {
    const first = result.error.issues[0];
    return c.json(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: first?.message ?? 'Invalid input',
          issues: result.error.issues,
        },
      },
      422,
    );
  }
  return undefined;
}

export const authRoleSchema = z.enum(AUTH_ROLES);
export const workshopTypeSchema = z.enum(WORKSHOP_TYPES);

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const businessFields = {
  business_name: z.string().min(1, 'نام کسبوکار الزامی است').max(200).optional(),
  dealer_code: z.string().regex(/^[a-zA-Z0-9_-]{2,50}$/, 'کد نمایندگی معتبر نیست').optional(),
  business_address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  documents: z.array(z.string().max(500)).max(10).optional(),
  workshop_name: z.string().min(1, 'نام تعمیرکارگاه الزامی است').max(200).optional(),
  workshop_type: workshopTypeSchema.optional(),
  specialty: z.string().max(100).optional(),
  hours: z.string().max(200).optional(),
  services: z.array(z.string().max(100)).max(30).optional(),
  description: z.string().max(2000).optional(),
  phone: z.string().max(15).optional(),
};

export const registerWithOtpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  type: z.enum(['email', 'phone']),
  identifier: z.string().min(3).max(255),
  code: z.string().length(6, 'OTP code must be 6 digits'),
  role: z.enum(AUTH_ROLES).optional().default('user'),
  ...businessFields,
}).superRefine((val, ctx) => {
  // Business fields are OPTIONAL at registration: the session is issued even
  // when they're missing (profileStatus 'incomplete', completed later via
  // POST /auth/business-profile — AUTH_API.md §4/§5).
  if (val.role === 'user') {
    const forbidden = Object.keys(businessFields).find((k) => (val as Record<string, unknown>)[k] !== undefined);
    if (forbidden) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [forbidden],
        message: 'فیلدهای کسبوکار فقط برای نقشهای کسبوکار مجاز هستند',
      });
    }
  }
});

/**
 * Payload for POST /auth/business-profile. Role comes from the authenticated
 * session; required-field enforcement per role happens in
 * BusinessProfileService (422 when missing).
 */
export const businessProfileSchema = z.object(businessFields);

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

export const googleFinalizeSchema = z.object({
  t: z.string().uuid('Invalid session token'),
});

export const googleVerifySchema = z.object({
  t: z.string().uuid('Invalid session token'),
  code: z.string().length(6, 'OTP code must be 6 digits'),
});

export const googleResendSchema = z.object({
  t: z.string().uuid('Invalid session token'),
});

export const googleLinkSchema = z.object({
  t: z.string().uuid('Invalid session token'),
  password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
});

export const sendVerifyCodeSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'OTP code must be 6 digits'),
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
export type GoogleFinalizeInput = z.infer<typeof googleFinalizeSchema>;
export type GoogleVerifyInput = z.infer<typeof googleVerifySchema>;
export type GoogleResendInput = z.infer<typeof googleResendSchema>;
export type GoogleLinkInput = z.infer<typeof googleLinkSchema>;
export type SendVerifyCodeInput = z.infer<typeof sendVerifyCodeSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
