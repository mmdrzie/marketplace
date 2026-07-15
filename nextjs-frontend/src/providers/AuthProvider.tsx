'use client';

import { ReactNode, useEffect } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import api from '@/lib/api';
import { clearAuthCookie } from '@/lib/cookies';
import { useQuery } from '@tanstack/react-query';

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useIsAuthenticated();
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const { error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get('/me');
      setUser(res.data.data);
      return res.data.data;
    },
    enabled: !!token && isAuthenticated,
    staleTime: 30000,
    gcTime: 300000,
    retry: false,
    meta: { persist: false },
  });

  useEffect(() => {
    if (error) {
      logout();
      clearAuthCookie();
    }
  }, [error, logout]);

  return <>{children}</>;
}
