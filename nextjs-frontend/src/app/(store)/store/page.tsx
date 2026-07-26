'use client';

import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function StoreDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const accentColor = '#8b5cf6';

  const { data: stats } = useQuery({
    queryKey: ['store', 'inventory', 'stats'],
    queryFn: async () => {
      const res = await api.get('/store/inventory/stats');
      return res.data.data as {
        total_items: number;
        active_items: number;
        out_of_stock: number;
        total_stock: number;
      };
    },
  });

  const statCards = [
    { label: 'قطعات در انبار', value: stats?.total_items ?? 0, icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
    { label: 'موجودی فعال', value: stats?.active_items ?? 0, icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { label: 'ناموجود', value: stats?.out_of_stock ?? 0, icon: <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /> },
    { label: 'تعداد کل موجودی', value: stats?.total_stock ?? 0, icon: <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">خوش آمدید، {user?.name || 'کاربر'}</h1>
        <p className="text-sm text-muted-foreground mt-1">پنل مدیریت فروشگاه قطعات یدکی</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-4 border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 10%, transparent)', color: accentColor }}>
                <SvgIcon className="h-4 w-4">{card.icon}</SvgIcon>
              </span>
            </div>
            <p className="text-2xl font-black text-foreground">{card.value.toLocaleString('fa-IR')}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: '/store/inventory', label: 'مدیریت قطعات', desc: 'قطعات یدکی خود را مدیریت کنید', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></> },
          { href: '/store/orders', label: 'سفارشات', desc: 'سفارشات و درخواست‌های قطعات', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
          { href: '/store/subscription', label: 'اشتراک', desc: 'برنامه و وضعیت اشتراک فروشگاه', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="glass rounded-2xl p-5 border border-border-subtle hover:border-primary/20 transition-all group">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 10%, transparent)', color: accentColor }}>
              <SvgIcon className="h-5 w-5">{item.icon}</SvgIcon>
            </span>
            <h3 className="font-bold text-foreground text-sm mb-1">{item.label}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
