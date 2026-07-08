import { describe, it, expect } from 'vitest';
import { PermissionService } from '../src/services/permission';
import { AppError } from '../src/errors';

describe('PermissionService', () => {
  const service = new PermissionService();

  const phoneVerifiedUser = { phoneVerified: true, role: 'user' };
  const unverifiedUser = { phoneVerified: false, role: 'user' };
  const adminUser = { phoneVerified: true, role: 'admin' };

  it('allows listing:publish for phone-verified users', () => {
    expect(service.can('listing:publish', phoneVerifiedUser)).toBe(true);
    expect(service.can('listing:publish', unverifiedUser)).toBe(false);
  });

  it('allows conversation:start for phone-verified users', () => {
    expect(service.can('conversation:start', phoneVerifiedUser)).toBe(true);
    expect(service.can('conversation:start', unverifiedUser)).toBe(false);
  });

  it('allows account upgrade only for user role with phone verified', () => {
    expect(service.can('account:upgrade-dealer', phoneVerifiedUser)).toBe(true);
    expect(service.can('account:upgrade-dealer', adminUser)).toBe(false);
    expect(service.can('account:upgrade-dealer', unverifiedUser)).toBe(false);
  });

  it('allows admin:access only for admin role', () => {
    expect(service.can('admin:access', adminUser)).toBe(true);
    expect(service.can('admin:access', phoneVerifiedUser)).toBe(false);
  });

  it('throws on requireCapability for denied permission', () => {
    expect(() => service.requireCapability('listing:publish', unverifiedUser)).toThrow(AppError);
    expect(() => service.requireCapability('admin:access', phoneVerifiedUser)).toThrow(AppError);
  });

  it('does not throw on requireCapability for granted permission', () => {
    expect(() => service.requireCapability('listing:publish', phoneVerifiedUser)).not.toThrow();
    expect(() => service.requireCapability('admin:access', adminUser)).not.toThrow();
  });
});
