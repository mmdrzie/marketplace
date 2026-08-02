'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  pendingAction: string | null;
  _hasHydrated: boolean;
  _refreshing: boolean;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
  setUser: (user: User) => void;
  setPhoneVerified: (v: boolean) => void;
  setPendingAction: (action: string | null) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
  setRefreshing: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,
        phoneVerified: false,
        emailVerified: false,
        pendingAction: null,
        _hasHydrated: false,
        _refreshing: false,
        setAuth: (token, user, refreshToken) =>
          set({
            token,
            refreshToken: refreshToken ?? null,
            user,
            isAuthenticated: true,
            phoneVerified: user.phoneVerified ?? false,
            emailVerified: user.emailVerified ?? false,
          }),
        setUser: (user) => set({ user }),
        setPhoneVerified: (v) => set({ phoneVerified: v }),
        setPendingAction: (action) => set({ pendingAction: action }),
        logout: () =>
          set({
            token: null,
            refreshToken: null,
            user: null,
            isAuthenticated: false,
            phoneVerified: false,
            emailVerified: false,
            pendingAction: null,
          }),
        setHasHydrated: (v) => set({ _hasHydrated: v }),
        setRefreshing: (v) => set({ _refreshing: v }),
      }),
      {
        name: 'auth-storage',
        version: 7,
        partialize: (state) => ({
          token: state.token,
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          phoneVerified: state.phoneVerified,
          emailVerified: state.emailVerified,
          pendingAction: state.pendingAction,
        }),
        migrate: (persisted: unknown, version) => {
          const v = persisted as {
            token?: string | null;
            refreshToken?: string | null;
            user?: User;
            isAuthenticated?: boolean;
            phoneVerified?: boolean;
            emailVerified?: boolean;
            pendingAction?: string | null;
          };
          return {
            token: version >= 7 ? (v.token ?? null) : null,
            refreshToken: version >= 7 ? (v.refreshToken ?? null) : null,
            user: v.user ?? null,
            isAuthenticated: v.isAuthenticated ?? false,
            phoneVerified: v.phoneVerified ?? false,
            emailVerified: v.emailVerified ?? false,
            pendingAction: v.pendingAction ?? null,
            _hasHydrated: true,
            _refreshing: false,
          } as AuthState;
        },
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
          if (state?.user && !state.token) {
            state.setRefreshing(true);
            const body = state.refreshToken ? { refreshToken: state.refreshToken } : {};
            api.post('/auth/refresh', body, { withCredentials: true })
              .then((res) => {
                const newToken = res.data.data?.token || res.data.token;
                const newRefresh = res.data.data?.refreshToken;
                const currentUser = useAuthStore.getState().user;
                if (newToken && currentUser) {
                  useAuthStore.getState().setAuth(newToken, currentUser, newRefresh);
                }
              })
              .catch(() => {
                useAuthStore.getState().logout();
              })
              .finally(() => {
                useAuthStore.getState().setRefreshing(false);
              });
          }
        },
      },
    ),
    { name: 'auth-storage' },
  ),
);

export const useIsAuthenticated = () => useAuthStore((s) => !!s.token);
export const useUser = () => useAuthStore((s) => s.user);
export const usePhoneVerified = () => useAuthStore((s) => s.phoneVerified);
export const useEmailVerified = () => useAuthStore((s) => s.emailVerified);
