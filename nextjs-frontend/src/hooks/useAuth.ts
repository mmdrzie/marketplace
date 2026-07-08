'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

const DEMO_TOKEN = 'demo-token-do-not-use-in-production';

const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 9991,
    name: 'مدیر سیستم',
    email: 'admin@marketplace.com',
    phone: '09121111111',
    avatar: null,
    city: 'تهران',
    role: 'admin',
    status: 'active',
    phoneVerified: true,
    emailVerified: true,
    profile: null,
    dealer_profile: null,
    created_at: new Date().toISOString(),
  },
  user: {
    id: 9992,
    name: 'کاربر عادی',
    email: 'user@marketplace.com',
    phone: '09122222222',
    avatar: null,
    city: 'اصفهان',
    role: 'user',
    status: 'active',
    phoneVerified: true,
    emailVerified: true,
    profile: null,
    dealer_profile: null,
    created_at: new Date().toISOString(),
  },
  dealer: {
    id: 9993,
    name: 'نمایشگاه‌دار',
    email: 'dealer@marketplace.com',
    phone: '09123333333',
    avatar: null,
    city: 'مشهد',
    role: 'dealer',
    status: 'active',
    phoneVerified: true,
    emailVerified: true,
    profile: null,
    dealer_profile: {
      business_name: 'نمایشگاه اتوپلاس',
      logo: null,
      address: 'مشهد، بلوار وکیل‌آباد',
      description: 'نمایشگاه تخصصی خودروهای خارجی',
      dealer_code: 'DLR-001',
      subscription_plan: 'premium',
      subscription_expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
      listings_limit: 50,
      is_verified: true,
    },
    created_at: new Date().toISOString(),
  },
  agency: {
    id: 9994,
    name: 'آژانس خودرویی',
    email: 'agency@marketplace.com',
    phone: '09124444444',
    avatar: null,
    city: 'شیراز',
    role: 'agency',
    status: 'active',
    phoneVerified: true,
    emailVerified: true,
    profile: null,
    dealer_profile: {
      business_name: 'آژانس خودرو پارسیان',
      logo: null,
      address: 'شیراز، بلوار چمران',
      description: 'آژانس خرید و فروش خودرو و ماشین‌آلات',
      dealer_code: 'AGC-001',
      subscription_plan: 'basic',
      subscription_expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      listings_limit: 20,
      is_verified: true,
    },
    created_at: new Date().toISOString(),
  },
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, logout: storeLogout } = useAuthStore();

  const demoLogin = (role: string) => {
    const user = DEMO_USERS[role];
    if (!user) return;
    setAuth(DEMO_TOKEN, user);
  };

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password, name });
      const { token, user } = res.data.data;
      setAuth(token, user);
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
    }
  };

  return { registerWithEmail, loginWithEmail, forgotPassword, resetPassword, logout, demoLogin, isDemoMode, loading, error };
}
