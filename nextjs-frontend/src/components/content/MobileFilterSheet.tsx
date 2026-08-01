'use client';

import { useEffect } from 'react';

export function MobileFilterSheet({
  open,
  onClose,
  title = 'فیلترها',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border border-border bg-background shadow-2xl animate-slide-up">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-3 pb-3 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
            <h3 className="font-bold text-foreground text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 space-y-6">{children}</div>
      </div>
    </div>
  );
}
