'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  pendingAction: string | null;
  _hasHydrated: boolean;
  setAuth: (token: string, user: User, refreshToken?: string) => void;
  setUser: (user: User) => void;
  setPhoneVerified: (v: boolean) => void;
  setPendingAction: (action: string | null) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
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
      }),
      {
        name: 'auth-storage',
        version: 3,
        partialize: (state) => ({
          refreshToken: state.refreshToken,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          phoneVerified: state.phoneVerified,
          emailVerified: state.emailVerified,
          pendingAction: state.pendingAction,
        }),
        migrate: (persisted: unknown, version) => {
          if (version === 0) {
            const old = persisted as { token?: string; user?: User; isAuthenticated?: boolean };
            return {
              refreshToken: null,
              token: null,
              user: old.user ?? null,
              isAuthenticated: old.isAuthenticated ?? false,
              phoneVerified: false,
              emailVerified: false,
              pendingAction: null,
              _hasHydrated: true,
            } as AuthState;
          }
          if (version === 1) {
            const v1 = persisted as { user?: User; isAuthenticated?: boolean; phoneVerified?: boolean; pendingAction?: string | null };
            return {
              refreshToken: null,
              token: null,
              user: v1.user ?? null,
              isAuthenticated: v1.isAuthenticated ?? false,
              phoneVerified: v1.phoneVerified ?? false,
              emailVerified: false,
              pendingAction: v1.pendingAction ?? null,
              _hasHydrated: true,
            } as AuthState;
          }
          const v2 = persisted as { user?: User; isAuthenticated?: boolean; phoneVerified?: boolean; emailVerified?: boolean; pendingAction?: string | null };
          return {
            refreshToken: null,
            token: null,
            user: v2.user ?? null,
            isAuthenticated: v2.isAuthenticated ?? false,
            phoneVerified: v2.phoneVerified ?? false,
            emailVerified: v2.emailVerified ?? false,
            pendingAction: v2.pendingAction ?? null,
            _hasHydrated: true,
          } as AuthState;
        },
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error('Auth store rehydration failed:', error);
          }
          state?.setHasHydrated(true);
        },
      },
    ),
    { name: 'auth-storage', enabled: process.env.NODE_ENV === 'development' },
  ),
);

export const useIsAuthenticated = () => useAuthStore((s) => !!s.token);
export const useUser = () => useAuthStore((s) => s.user);
export const usePhoneVerified = () => useAuthStore((s) => s.phoneVerified);
export const useEmailVerified = () => useAuthStore((s) => s.emailVerified);
