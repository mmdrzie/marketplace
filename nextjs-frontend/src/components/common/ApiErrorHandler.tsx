'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setOnApiError } from '@/lib/api';

export function ApiErrorHandler() {
  const router = useRouter();
  useEffect(() => {
    setOnApiError((error) => {
      const code = (error.response?.data as { error?: { code?: string } })?.error?.code;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/verify-phone') {
          router.push(`/verify-phone?redirect=${encodeURIComponent(currentPath)}`);
        }
      }
    });
  }, [router]);

  return null;
}
