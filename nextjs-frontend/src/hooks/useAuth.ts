'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { setAuthCookie, clearAuthCookie } from '@/lib/cookies';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const storeLogout = useAuthStore((s) => s.logout);

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password, name });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      const msg = data?.error?.message || 'خطا در ثبت‌نام';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendRegisterOtp = async (identifier: string, type: 'email' | 'phone') => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-register-otp', { type, identifier });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      const msg = data?.error?.message || 'خطا در ارسال کد تایید';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithOtp = async (
    identifier: string,
    type: 'email' | 'phone',
    code: string,
    password: string,
    name: string,
    role: 'user' | 'dealer' | 'agency' | 'store' | 'workshop' = 'user',
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register-with-otp', { type, identifier, code, password, name, role });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      const msg = data?.error?.message || 'خطا در ثبت‌نام';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      const msg = data?.error?.message || 'خطا در ورود';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot', { email });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      const msg = data?.error?.message || 'خطا در ارسال ایمیل بازیابی';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset', { token, password });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      const msg = data?.error?.message || 'خطا در تغییر رمز عبور';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
        storeLogout();
        clearAuthCookie();
    }
  };

  return {
    registerWithEmail, sendRegisterOtp, registerWithOtp,
    loginWithEmail, forgotPassword, resetPassword, logout, loading, error,
  };
}
