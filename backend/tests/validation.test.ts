import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema, resetPasswordSchema } from '../src/validation/auth.js';

describe('validation/auth password rules (related to 1.16)', () => {
  it('accepts a password of 8 characters (min)', () => {
    const res = registerSchema.safeParse({ email: 'a@b.com', password: 'abcdefgh', name: 'Test' });
    expect(res.success).toBe(true);
  });

  it('rejects a password shorter than 8 characters', () => {
    const res = registerSchema.safeParse({ email: 'a@b.com', password: 'short', name: 'Test' });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toMatch(/at least 8/);
    }
  });

  it('rejects a password longer than 128 characters', () => {
    const res = registerSchema.safeParse({
      email: 'a@b.com',
      password: 'a'.repeat(129),
      name: 'Test',
    });
    expect(res.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const res = registerSchema.safeParse({ email: 'not-an-email', password: 'abcdefgh', name: 'Test' });
    expect(res.success).toBe(false);
  });

  it('enforces min length on resetPassword too', () => {
    const res = resetPasswordSchema.safeParse({ token: 'tok', password: '123' });
    expect(res.success).toBe(false);
  });

  it('login requires a password present', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(res.success).toBe(false);
  });
});
