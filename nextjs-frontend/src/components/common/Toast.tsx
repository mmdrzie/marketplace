'use client';

import { useEffect, useState, useCallback } from 'react';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  error: <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>,
  warning: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
};

const colors: Record<ToastType, string> = {
  success: 'bg-success/10 border-success/20 text-success',
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
  info: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
  warning: 'bg-warning/10 border-warning/20 text-warning',
};

let addToastExternal: ((toast: Omit<ToastData, 'id'>) => void) | null = null;

export function toast(data: Omit<ToastData, 'id'>) {
  addToastExternal?.(data);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((data: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...data, id }]);
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => { addToastExternal = null; };
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, t.duration ?? 3500);
    return () => clearTimeout(timer);
  }, [t.duration, onClose]);

  return (
    <div className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slide-up ${colors[t.type]}`}>
      <div className="shrink-0 mt-0.5">
        <SvgIcon className="h-5 w-5">{icons[t.type]}</SvgIcon>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{t.title}</p>
        {t.message && <p className="text-xs opacity-80 mt-0.5">{t.message}</p>}
      </div>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <SvgIcon className="h-4 w-4"><path d="M18 6L6 18M6 6l12 12" /></SvgIcon>
      </button>
    </div>
  );
}
