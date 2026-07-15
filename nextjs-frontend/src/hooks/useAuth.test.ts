import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import type { User } from '@/types';

const { mockSetAuth, mockStoreLogout } = vi.hoisted(() => ({
  mockSetAuth: vi.fn(),
  mockStoreLogout: vi.fn(),
}));

const mockApiPost = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api', () => ({
  default: { post: mockApiPost },
}));

vi.mock('@/store/authStore', () => {
  const store = { token: null, user: null, setAuth: mockSetAuth, logout: mockStoreLogout };
  return {
    useAuthStore: (selector: (s: typeof store) => unknown) => selector(store),
  };
});

const mockUser: User = {
  id: '1',
  name: 'test',
  avatar: null,
  city: null,
  role: 'user',
  email: 'test@test.com',
  phone: '09120000000',
  created_at: new Date().toISOString(),
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers with email successfully', async () => {
    mockApiPost.mockResolvedValue({ data: { data: { token: 'fake-token', user: mockUser } } });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.registerWithEmail('test@test.com', 'password123', 'Test');
    });

    expect(mockApiPost).toHaveBeenCalledWith('/auth/register', { email: 'test@test.com', password: 'password123', name: 'Test' });
    expect(mockSetAuth).toHaveBeenCalledWith('fake-token', mockUser, undefined);
  });

  it('handles register error', async () => {
    mockApiPost.mockRejectedValue({
      response: { data: { error: { message: 'این ایمیل قبلاً ثبت شده است' } } },
    });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try { await result.current.registerWithEmail('existing@test.com', 'password123', 'T'); } catch { /* expected */ }
    });

    expect(result.current.error).toBe('این ایمیل قبلاً ثبت شده است');
  });

  it('logs in with email successfully', async () => {
    mockApiPost.mockResolvedValue({ data: { data: { token: 'fake-token', user: mockUser } } });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginWithEmail('test@test.com', 'password123');
    });

    expect(mockApiPost).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password123' });
    expect(mockSetAuth).toHaveBeenCalledWith('fake-token', mockUser, undefined);
  });

  it('handles login error', async () => {
    mockApiPost.mockRejectedValue({
      response: { data: { error: { message: 'ایمیل یا رمز عبور اشتباه است' } } },
    });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try { await result.current.loginWithEmail('test@test.com', 'wrong'); } catch { /* expected */ }
    });

    expect(result.current.error).toBe('ایمیل یا رمز عبور اشتباه است');
  });

  it('handles forgot password', async () => {
    mockApiPost.mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.forgotPassword('test@test.com');
    });

    expect(mockApiPost).toHaveBeenCalledWith('/auth/forgot', { email: 'test@test.com' });
  });

  it('handles reset password', async () => {
    mockApiPost.mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.resetPassword('reset-token', 'newpassword123');
    });

    expect(mockApiPost).toHaveBeenCalledWith('/auth/reset', { token: 'reset-token', password: 'newpassword123' });
  });

  it('calls store logout on logout', async () => {
    mockApiPost.mockResolvedValue({});
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockStoreLogout).toHaveBeenCalled();
  });
});
