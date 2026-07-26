'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function StoreSubscriptionPage() {
  const { data: sub } = useQuery({
    queryKey: ['store', 'subscription'],
    queryFn: async () => {
      const res = await api.get('/store/subscription');
      return res.data.data as { plan: string; expiresAt: string | null };
    },
  });

  const plans = [
    {
      name: 'رایگان', price: '۰', desc: 'برای شروع کار', features: ['مدیریت ۱۰ قطعه', 'آمار پایه', 'پشتیبانی عمومی'],
      popular: false, href: '/store/subscription',
    },
    {
      name: 'حرفه‌ای', price: '۲۹۹,۰۰۰', desc: 'برای فروشگاه‌های فعال', features: ['قطعات نامحدود', 'آمار پیشرفته', 'اولویت در نمایش', 'پشتیبانی اختصاصی', 'گزارش‌گیری'],
      popular: true, href: '/dealer/subscription',
    },
  ];

  const accentColor = '#8b5cf6';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 p-5 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">اشتراک فروشگاه</h1>
        <p className="text-sm text-muted-foreground mt-1">طرح مناسب فروشگاه قطعات یدکی خود را انتخاب کنید</p>
      </div>

      {sub && (
        <div className="rounded-2xl border p-5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 5%, transparent)', borderColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 20%, transparent)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 10%, transparent)', color: accentColor }}>
              <SvgIcon className="h-6 w-6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></SvgIcon>
            </div>
            <div>
              <p className="font-bold text-foreground">طرح {sub.plan === 'free' ? 'رایگان' : sub.plan}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sub.expiresAt ? `اعتبار تا ${new Date(sub.expiresAt).toLocaleDateString('fa-IR')}` : 'بدون تاریخ انقضا'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.name} className={`glass rounded-2xl p-6 border transition-all ${plan.popular ? 'border-primary/30 shadow-lg' : 'border-border-subtle hover:border-primary/20'}`}>
            {plan.popular && <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">پیشنهادی</span>}
            <h3 className="text-lg font-black text-foreground mt-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
            <p className="text-3xl font-black text-foreground mt-4">{plan.price}<span className="text-sm font-normal text-muted-foreground"> تومان / ماه</span></p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SvgIcon className="h-4 w-4 text-success shrink-0"><polyline points="20 6 9 17 4 12" /></SvgIcon>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`w-full block text-center py-3 rounded-xl mt-6 text-sm font-bold transition-all ${
                plan.popular ? 'btn btn-primary' : 'btn btn-ghost border border-border'
              }`}
            >
              {plan.price === '۰' ? 'شروع کنید' : 'خرید اشتراک'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
