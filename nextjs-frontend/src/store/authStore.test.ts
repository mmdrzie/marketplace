import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

const mockUser = {
  id: 'u1',
  name: 'Test User',
  email: 'a@b.com',
  phone: '09120000000',
  avatar: null,
  city: null,
  role: 'user',
  status: null,
  phoneVerified: false,
  emailVerified: true,
  profile: null,
  dealer_profile: null,
  created_at: '',
} as const;

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('setAuth stores token and user and marks authenticated', () => {
    useAuthStore.getState().setAuth('tok-123', mockUser as never, 'ref-1');

    const s = useAuthStore.getState();
    expect(s.token).toBe('tok-123');
    expect(s.refreshToken).toBe('ref-1');
    expect(s.isAuthenticated).toBe(true);
    expect(s.user?.email).toBe('a@b.com');
    expect(s.emailVerified).toBe(true);
  });

  it('setAuth defaults refreshToken to null when omitted', () => {
    useAuthStore.getState().setAuth('tok', mockUser as never);
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it('logout clears auth state', () => {
    useAuthStore.getState().setAuth('tok', mockUser as never, 'ref');
    useAuthStore.getState().logout();

    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated).toBe(false);
    expect(s.refreshToken).toBeNull();
  });

  it('setUser updates the stored user', () => {
    useAuthStore.getState().setAuth('tok', mockUser as never);
    useAuthStore.getState().setUser({ ...mockUser, name: 'Changed' } as never);
    expect(useAuthStore.getState().user?.name).toBe('Changed');
  });
});
