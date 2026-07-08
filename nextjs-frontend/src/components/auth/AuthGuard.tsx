'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="follow-the-leader text-primary" aria-hidden="true">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
        در حال انتقال به ورود…
      </p>
    </div>
  );
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once the persisted auth state has rehydrated, otherwise
    // logged-in users would be bounced to /login on every first paint.
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // While hydration hasn't completed, or after we know the user is unauthenticated,
  // show a loader instead of a blank screen. The effect above handles the redirect.
  if (!_hasHydrated || !isAuthenticated) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
