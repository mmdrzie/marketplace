'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (token && isAuthenticated) {
      if (token.startsWith('demo-token-') || token.startsWith('register-token-')) {
        return;
      }
      api
        .get('/me')
        .then((res) => {
          setUser(res.data.data);
        })
        .catch(() => {
          logout();
        });
    }
  }, [token, isAuthenticated]);

  return <>{children}</>;
}
