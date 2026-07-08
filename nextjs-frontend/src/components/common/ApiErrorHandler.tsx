'use client';

import { useEffect } from 'react';
import { setOnApiError } from '@/lib/api';

export function ApiErrorHandler() {
  useEffect(() => {
    setOnApiError((error) => {
      const code = (error.response?.data as { error?: { code?: string } })?.error?.code;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        const currentPath = window.location.pathname;
        if (currentPath !== '/verify-phone') {
          window.location.href = `/verify-phone?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    });
  }, []);

  return null;
}
