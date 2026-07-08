'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface FeaturedPurchaseModalProps {
  listingId: number;
  listingTitle: string;
  onClose: () => void;
}

const TIERS = [
  {
    id: 'silver',
    name: 'نقره‌ای',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
    price: '۴۹,۰۰۰',
    color: 'muted-foreground',
    shadow: 'shadow-glow-primary',
    features: [
      'نشان ویژه نقره‌ای روی آگهی',
      'اولویت در نتایج جستجو',
      'مدت اعتبار: ۷ روز',
      'افزایش تا ۲ برابری بازدید',
    ],
  },
  {
    id: 'gold',
    name: 'طلایی',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    price: '۹۹,۰۰۰',
    color: 'warning',
    shadow: 'shadow-glow-warning',
    recommended: true,
    features: [
      'نشان ویژه طلایی روی آگهی',
      'صدر نتایج جستجو',
      'نمایش در بخش ویژه‌ها',
      'مدت اعتبار: ۱۴ روز',
      'افزایش تا ۴ برابری بازدید',
    ],
  },
  {
    id: 'diamond',
    name: 'الماسی',
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
    price: '۱۹۹,۰۰۰',
    color: 'accent-blue',
    shadow: 'shadow-glow-accent',
    features: [
      'نشان ویژه الماسی روی آگهی',
      'صدر نتایج جستجو',
      'نمایش در صفحه اصلی',
      'نشان در صفحه دسته‌بندی',
      'مدت اعتبار: ۳۰ روز',
      'افزایش تا ۶ برابری بازدید',
    ],
  },
];

export function FeaturedPurchaseModal({ listingId, listingTitle, onClose }: FeaturedPurchaseModalProps) {
  const [selected, setSelected] = useState('gold');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [onClose]);

  const initPayment = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/featured', { listing_id: listingId, tier: selected });
      return res.data.data;
    },
    onSuccess: (data) => {
      window.location.href = data.payment_url;
    },
  });

  const tier = TIERS.find((t) => t.id === selected)!;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="featured-title"
    >
      <div className="relative bg-card backdrop-blur-xl border border-border rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-warning) 10%, transparent)' }} />
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">برجسته‌سازی آگهی</h3>
                <p className="text-xs text-muted-foreground mt-1">سطح مناسب خود را انتخاب کنید</p>
              </div>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="glass rounded-2xl p-4 mb-6">
            <p className="text-xs text-muted-foreground mb-1.5">آگهی:</p>
            <p className="text-sm font-bold text-foreground line-clamp-2">«{listingTitle}»</p>
          </div>

          {/* Tier selector */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={cn(
                  'relative p-4 rounded-2xl border text-center transition-all',
                    selected === t.id
                      ? 'border-primary/30 bg-primary/10 shadow-glow-accent'
                    : 'border-border-subtle bg-surface-2 hover:border-border',
                )}
              >
                {t.recommended && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    پیشنهادی
                  </span>
                )}
                <div className="mb-1 flex items-center justify-center text-primary">{t.icon}</div>
                <div className={cn(
                  'text-sm font-bold',
                  selected === t.id ? 'text-foreground' : 'text-muted-foreground',
                )}>{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.price} تومان</div>
              </button>
            ))}
          </div>

          {/* Selected tier features */}
          <div className="rounded-2xl p-5 mb-6 border" style={{
            backgroundColor: `color-mix(in srgb, var(--color-${tier.color}) 5%, transparent)`,
            borderColor: `color-mix(in srgb, var(--color-${tier.color}) 20%, transparent)`,
          }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-primary">{tier.icon}</span>
              <span className="font-bold text-sm" style={{ color: `var(--color-${tier.color})` }}>مزایای پلن {tier.name}:</span>
            </div>
            <ul className="space-y-2">
              {tier.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ color: `var(--color-${tier.color})` }}><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {initPayment.isError && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v4M12 17h.01" /><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              خطا در اتصال به درگاه پرداخت.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 btn btn-glass text-sm">
              انصراف
            </button>
            <button
              onClick={() => initPayment.mutate()}
              disabled={initPayment.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 btn btn-primary text-sm"
            >
              {initPayment.isPending ? (
                <>در حال اتصال...</>
              ) : (
                <>خرید پلن {tier.name}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
