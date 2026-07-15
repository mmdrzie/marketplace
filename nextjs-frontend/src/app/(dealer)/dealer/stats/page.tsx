'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function DealerStatsPage() {
  const user = useAuthStore((s) => s.user);
  const isAgency = user?.role === 'agency';

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dealers.stats,
    queryFn: async () => { const res = await api.get('/dealer/stats'); return res.data.data; },
  });

  const stats = data || {};

  const cards = [
    { label: 'آگهی‌های فعال', value: stats.active_listings, icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />, bg: 'bg-success/10', border: 'border-success/20', text: 'text-success' },
    { label: 'بازدید امروز', value: stats.today_views, icon: <><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>, bg: 'bg-accent-blue-bg', border: 'border-accent-blue-border', text: 'text-accent-blue' },
    { label: 'پیام‌های نخوانده', value: stats.unread_messages, icon: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />, bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning' },
    { label: 'تماس‌های امروز', value: stats.today_contacts, icon: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, bg: 'bg-accent-indigo/10', border: 'border-accent-indigo/20', text: 'text-accent-indigo' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">آمار و عملکرد</h1>
        <p className="text-sm text-muted-foreground mt-1">خلاصه فعالیت {isAgency ? 'بنگاه' : 'نمایندگی'}</p>
      </div>

      <ErrorBoundary>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((item) => (
          <div key={item.label} className={`glass rounded-2xl p-5 border ${item.border} hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
              <div className={`w-9 h-9 rounded-xl ${item.bg} ${item.border} border flex items-center justify-center ${item.text}`}>
                <SvgIcon>{item.icon}</SvgIcon>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{item.value ?? 0}</p>
          </div>
        ))}
      </div>
      </ErrorBoundary>

      {isLoading && <div className="h-40 bg-surface-2 rounded-2xl motion-safe:animate-pulse" />}

      <ErrorBoundary>
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">آخرین فعالیت‌ها</h3>
        {data?.recent_activities?.length > 0 ? (
          <div className="space-y-3">
            {(data.recent_activities as Array<{ description: string; created_at: string }>).map((act, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isAgency ? 'bg-warning' : 'bg-success'}`} />
                <div>
                  <p className="text-foreground">{act.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{new Date(act.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center">
              <SvgIcon className="h-6 w-6 text-muted-foreground"><path d="M18 20V10M12 20V4M6 20v-6" /></SvgIcon>
            </div>
            <p className="text-sm text-muted-foreground">هنوز فعالیتی ثبت نشده است</p>
          </div>
        )}
      </div>
      </ErrorBoundary>
    </div>
  );
}
