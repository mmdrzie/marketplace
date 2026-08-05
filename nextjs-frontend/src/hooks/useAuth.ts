'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { setAuthCookie, clearAuthCookie } from '@/lib/cookies';
import type { AuthRole, BusinessProfileInput, BusinessProfileResult, ProfileStatus } from '@/types';

function readApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
  return data?.error?.message || fallback;
}

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
      setError(readApiError(err, 'خطا در ثبت‌نام'));
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
      setError(readApiError(err, 'خطا در ارسال کد تایید'));
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
    role: AuthRole = 'user',
    business?: BusinessProfileInput,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register-with-otp', { type, identifier, code, password, name, role, ...business });
      const { token, user } = res.data.data;
      const profileStatus = res.data.data?.profileStatus as ProfileStatus | undefined;
      setAuth(token, user);
      setAuthCookie();
      return { token, user, profileStatus };
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در ثبت‌نام'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBusinessProfile = async (data: BusinessProfileInput): Promise<BusinessProfileResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/business-profile', data);
      return res.data.data as BusinessProfileResult;
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در ثبت پروفایل کسب‌وکار'));
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
      setError(readApiError(err, 'خطا در ورود'));
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
      setError(readApiError(err, 'خطا در ارسال ایمیل بازیابی'));
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
      setError(readApiError(err, 'خطا در تغییر رمز عبور'));
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

  /* ---- Google OAuth ---- */

  const googleStatus = async (): Promise<{ enabled: boolean }> => {
    const res = await api.get('/auth/google/status');
    return res.data.data;
  };

  const loginWithGoogle = (redirect?: string, role?: AuthRole) => {
    const base = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/google/authorize`;
    const params = new URLSearchParams();
    if (redirect) params.set('redirect', redirect);
    if (role) params.set('role', role);
    window.location.href = params.size > 0 ? `${base}?${params.toString()}` : base;
  };

  const googleFinalize = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/google/finalize', { t });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در تکمیل ورود'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleVerify = async (t: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/google/verify', { t, code });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در تایید کد'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleResend = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/google/resend', { t });
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در ارسال مجدد کد'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLink = async (t: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/google/link', { t, password });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در اتصال حساب گوگل'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ---- Email verification fallback (blocked login / email change) ---- */

  const sendVerifyCode = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/send-verify-code', { email });
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در ارسال کد تایید'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginCode = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/verify-code', { email, code });
      const { token, user } = res.data.data;
      setAuth(token, user);
      setAuthCookie();
      return { token, user };
    } catch (err: unknown) {
      setError(readApiError(err, 'خطا در تایید ایمیل'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registerWithEmail, sendRegisterOtp, registerWithOtp, createBusinessProfile,
    loginWithEmail, forgotPassword, resetPassword, logout, loading, error,
    googleStatus, loginWithGoogle, googleFinalize, googleVerify, googleResend, googleLink,
    sendVerifyCode, verifyLoginCode,
  };
}
