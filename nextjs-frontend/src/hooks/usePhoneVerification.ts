'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function usePhoneVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPhoneVerified = useAuthStore((s) => s.setPhoneVerified);

  const sendOtp = async (phone: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/phone/send-otp', { phone });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      setError(data?.error?.message || 'خطا در ارسال کد');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/phone/verify-otp', { phone, code });
      setPhoneVerified(true);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data;
      setError(data?.error?.message || 'کد نامعتبر است');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (): Promise<{ phone: string | null; verified: boolean }> => {
    try {
      const res = await api.get('/phone/status');
      return res.data.data;
    } catch {
      return { phone: null, verified: false };
    }
  };

  return { sendOtp, verifyOtp, checkStatus, loading, error };
}
