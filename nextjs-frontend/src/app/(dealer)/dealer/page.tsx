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

export default function DealerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const isAgency = user?.role === 'agency';
  const accentBg = isAgency ? 'bg-warning/10' : 'bg-success/10';
  const accentText = isAgency ? 'text-warning' : 'text-success';

  const { data: stats } = useQuery({
    queryKey: queryKeys.dealers.stats,
    queryFn: async () => {
      const res = await api.get('/dealer/stats');
      return res.data.data as {
        active_listings: number;
        today_views: number;
        unread_messages: number;
        today_contacts: number;
      };
    },
  });

  const statCards = [
    { label: 'آگهی‌های فعال', value: stats?.active_listings ?? 0, icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />, },
    { label: 'بازدید امروز', value: stats?.today_views ?? 0, icon: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />, },
    { label: 'پیام‌های نخوانده', value: stats?.unread_messages ?? 0, icon: <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />, },
    { label: 'تماس‌های امروز', value: stats?.today_contacts ?? 0, icon: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">خوش آمدید، {user?.name || 'کاربر'}</h1>
        <p className="text-sm text-muted-foreground mt-1">{isAgency ? 'پنل مدیریت بنگاه' : 'پنل نمایندگی'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className={`glass rounded-2xl p-4 border border-border-subtle`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{card.label}</span>
              <span className={`w-8 h-8 rounded-xl ${accentBg} flex items-center justify-center ${accentText}`}>
                <SvgIcon className="h-4 w-4">{card.icon}</SvgIcon>
              </span>
            </div>
            <p className={`text-2xl font-black text-foreground`}>{card.value.toLocaleString('fa-IR')}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: '/dealer/listings', label: 'مدیریت آگهی‌ها', desc: 'آگهی‌های خود را مدیریت کنید', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
          { href: '/dealer/subscription', label: 'اشتراک', desc: 'برنامه و وضعیت اشتراک خود را مشاهده کنید', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
          { href: '/dealer/stats', label: 'آمار و عملکرد', desc: 'آمار بازدید و عملکرد آگهی‌ها', icon: <path d="M18 20V10M12 20V4M6 20v-6" /> },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="glass rounded-2xl p-5 border border-border-subtle hover:border-primary/20 transition-all group">
            <span className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center ${accentText} mb-3 group-hover:scale-110 transition-transform`}>
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
