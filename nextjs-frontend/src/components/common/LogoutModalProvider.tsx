'use client';

import { useLogoutModal } from '@/store/logoutModalStore';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useRef } from 'react';

export function LogoutModalProvider() {
  const { isOpen, onConfirm, close } = useLogoutModal();
  const logout = useAuthStore((s) => s.logout);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    logout();
    close();
    onConfirm?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-overlay backdrop-blur-md animate-fade-in" onClick={close} />
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm animate-scale-in"
      >
        <div className="bg-surface-2/95 backdrop-blur-2xl rounded-3xl p-8 border border-border shadow-2xl shadow-black/50 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">خروج از حساب</h3>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            آیا از خروج خود اطمینان دارید؟ برای استفاده مجدد نیاز به ورود خواهید داشت.
          </p>

          <div className="flex gap-3">
            <button onClick={close} className="flex-1 btn btn-ghost btn-lg">
              انصراف
            </button>
            <button onClick={handleConfirm} className="flex-1 btn btn-danger btn-lg">
              خروج از حساب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
