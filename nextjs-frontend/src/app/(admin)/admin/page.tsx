'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function AdminDashboardPage() {
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: queryKeys.admin.pending,
    queryFn: async () => { const res = await api.get('/listings', { params: { status: 'pending' } }); return res.data; },
  });

  const { data: usersData } = useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: async () => { const res = await api.get('/admin/users'); return res.data; },
  });

  const { data: reportsData } = useQuery({
    queryKey: queryKeys.admin.reports,
    queryFn: async () => { const res = await api.get('/admin/reports'); return res.data; },
  });

  const pendingCount = pendingData?.data?.length || 0;
  const totalUsers = usersData?.data?.length || 0;
  const pendingReports = reportsData?.data?.filter((r: { status: string }) => r.status === 'pending')?.length || 0;
  const totalReports = reportsData?.data?.length || 0;
  const pendingListings = pendingData?.data?.slice(0, 5) || [];

  const stats = [
    {
      label: 'آگهی‌های در انتظار',
      value: pendingCount,
      icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
      color: 'text-warning',
      bg: 'bg-warning/10',
      border: 'border-warning/20',
    },
    {
      label: 'کاربران',
      value: totalUsers,
      icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue-bg',
      border: 'border-accent-blue-border',
    },
    {
      label: 'گزارشات در انتظار',
      value: pendingReports,
      icon: <path d="M18 20V10M12 20V4M6 20v-6" />,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      border: 'border-destructive/20',
    },
    {
      label: 'کل گزارشات',
      value: totalReports,
      icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      color: 'text-accent-indigo',
      bg: 'bg-accent-indigo/10',
      border: 'border-accent-indigo/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">داشبورد مدیریت</h1>
        <p className="text-sm text-muted-foreground mt-1">خلاصه وضعیت پلتفرم</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`glass rounded-2xl p-5 border ${stat.border} hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center ${stat.color}`}>
                <SvgIcon>{stat.icon}</SvgIcon>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">آگهی‌های در انتظار بررسی</h3>
            <Link href="/admin/moderation" className="text-xs text-primary hover:text-primary/80 transition-colors">مشاهده همه</Link>
          </div>
          {pendingLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-surface-2 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : pendingListings.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
                <SvgIcon className="h-6 w-6 text-success"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></SvgIcon>
              </div>
              <p className="text-sm text-muted-foreground">همه آگهی‌ها بررسی شده‌اند</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingListings.map((item: { id: number; title: string; user?: { name: string }; city?: string; created_at?: string }) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl hover:bg-surface-3 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-warning shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.user?.name || 'کاربر'}
                      {item.city ? ` - ${item.city}` : ''}
                      {item.created_at ? ` | ${new Date(item.created_at).toLocaleDateString('fa-IR')}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">دسترسی سریع</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/moderation', label: 'مدیریت آگهی‌ها', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />, color: 'text-warning', bg: 'bg-warning/10' },
              { href: '/admin/users', label: 'مدیریت کاربران', icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />, color: 'text-accent-blue', bg: 'bg-accent-blue-bg' },
              { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />, color: 'text-accent-indigo', bg: 'bg-accent-indigo/10' },
              { href: '/admin/reports', label: 'گزارشات', icon: <path d="M18 20V10M12 20V4M6 20v-6" />, color: 'text-destructive', bg: 'bg-destructive/10' },
              { href: '/admin/settings', label: 'تنظیمات', icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />, color: 'text-muted-foreground', bg: 'bg-muted/10' },
              { href: '/admin/attributes', label: 'ویژگی‌ها', icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />, color: 'text-success', bg: 'bg-success/10' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-xl ${link.bg} ${link.color} hover:opacity-80 transition-opacity`}
              >
                <SvgIcon className="h-5 w-5 shrink-0">{link.icon}</SvgIcon>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
