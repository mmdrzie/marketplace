'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useSearchParams, useRouter } from 'next/navigation';
import { JSX, Suspense, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ActivityCard } from '@/components/listing/ActivityCard';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { formatRelativeTime } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import type { ActivityType } from '@/components/listing/ActivityCard';
import { Skeleton } from '@/components/common/Skeleton';

// آیکون‌های مدرن SVG
const Icons = {
  success: <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3.01" />,
  error: <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  listings: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
  messages: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  favorites: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
  views: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />,
  wallet: <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
  plus: <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  settings: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  chevronLeft: <path d="M15 19l-7-7 7-7" />,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  messageNotif: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  listingNotif: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  heart: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></>,
};

const Icon = ({ path, className = "h-5 w-5" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

const NOTIF_ICONS: Record<string, React.ReactNode> = {
  message: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  listing: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  favorite: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />,
  system: <circle cx="12" cy="12" r="3" />,
};

function NotifsCard() {
  const { data, isLoading } = useNotifications();
  const notifications: { id: number; type: string; is_read: boolean; data: { title?: string; body?: string; action_url?: string }; created_at: string }[] = data?.data || [];

  const recent = notifications.slice(0, 5);

  return (
    <div className="bg-surface/40 border border-border rounded-3xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground tracking-tight">آخرین اعلان‌ها</h3>
        <Link href="/dashboard/notifications" className="text-xs text-primary hover:underline flex items-center gap-1">
          مشاهده همه
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        </Link>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : recent.length > 0 ? (
        <div className="space-y-2">
          {recent.map((n) => (
            <Link
              key={n.id}
              href={n.data?.action_url || '#'}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-surface-2/50 ${n.is_read ? '' : 'bg-primary/5 border border-primary/10'}`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.is_read ? 'bg-surface-2 text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {NOTIF_ICONS[n.type] || NOTIF_ICONS.system}
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${n.is_read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>{n.data?.title || 'اعلان'}</p>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{n.data?.body}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">{formatRelativeTime(n.created_at)}</p>
              </div>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">اعلانی وجود ندارد</div>
      )}
    </div>
  );
}

function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const phoneVerified = useAuthStore((s) => s.phoneVerified);
  const emailVerified = useAuthStore((s) => s.emailVerified);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: recentListings } = useQuery({
    queryKey: ['listings', 'recent'],
    queryFn: async () => { const res = await api.get('/listings', { params: { scope: 'me', limit: 5 } }); return res.data.data; },
    enabled: !!user,
  });

  const activities = useMemo(() => {
    if (!recentListings || !Array.isArray(recentListings)) return [];
    return recentListings.slice(0, 5).map((listing: { id: number | string; title: string; created_at: string; status: string }) => ({
      id: String(listing.id),
      type: (listing.status === 'sold' ? 'listing_sold' : 'listing_created') as ActivityType,
      message: listing.status === 'sold' ? `آگهی ${listing.title} به فروش رفت` : `آگهی ${listing.title} ثبت شد`,
      created_at: listing.created_at,
    }));
  }, [recentListings]);
  const payment = searchParams.get('payment');

  const paymentMsg = useMemo(() => {
    if (payment === 'success') return 'پرداخت با موفقیت انجام شد. آگهی شما ویژه شد!';
    if (payment === 'failed') return 'پرداخت ناموفق بود یا لغو شد. لطفاً دوباره تلاش کنید.';
    return null;
  }, [payment]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: async () => {       const res = await api.get('/auth/me'); return res.data.data; },
    enabled: !!user,
  });

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک و معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8">
        
        {/* پیام پرداخت */}
        {paymentMsg && (
          <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm animate-fade-in backdrop-blur-xl border ${
            payment === 'success' 
              ? 'bg-success/10 text-success border-success/20' 
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }`}>
            <Icon path={payment === 'success' ? Icons.success : Icons.error} className="h-6 w-6 shrink-0" />
            <span className="font-medium">{paymentMsg}</span>
            <button onClick={() => router.replace('/dashboard')} className="mr-auto opacity-70 hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        )}

        {/* تایید حساب */}
        {(!phoneVerified || !emailVerified) && (
          <div className="glass rounded-2xl p-4 border border-warning/20 bg-warning/5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center text-warning shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" /></svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">تکمیل اطلاعات حساب</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {!phoneVerified && !emailVerified && 'شماره موبایل و ایمیل شما تایید نشده است'}
                    {!phoneVerified && emailVerified && 'شماره موبایل شما تایید نشده است'}
                    {phoneVerified && !emailVerified && 'ایمیل شما تایید نشده است'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!phoneVerified && (
                  <Link href="/verify-phone?redirect=/dashboard" className="btn btn-sm btn-primary rounded-lg text-xs">
                    تایید موبایل
                  </Link>
                )}
                {!emailVerified && (
                  <Link href="/verify-email?redirect=/dashboard" className="btn btn-sm btn-glass rounded-lg text-xs">
                    تایید ایمیل
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* هدر خوش‌آمدگویی */}
        <div className="glass rounded-3xl p-6 md:p-8 shadow-xl border border-border-subtle overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">
                خوش آمدید، {user?.name || 'کاربر'}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base font-light">از اینجا می‌توانید آگهی‌ها، پیام‌ها و تنظیمات خود را مدیریت کنید.</p>
            </div>
            <Link href="/dashboard/listings/new" className="flex items-center justify-center gap-2 btn btn-primary rounded-xl shrink-0">
              <Icon path={Icons.plus} className="h-4 w-4" />
              ثبت آگهی جدید
            </Link>
          </div>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'آگهی‌های فعال', value: stats?.listings_count, icon: Icons.listings, color: 'text-primary', glow: 'bg-primary/10' },
            { label: 'بازدیدهای کل', value: stats?.views_count || 0, icon: Icons.views, color: 'text-warning', glow: 'bg-warning/10' },
            { label: 'پیام‌های جدید', value: stats?.unread_messages, icon: Icons.messages, color: 'text-success', glow: 'bg-success/10' },
            { label: 'علاقه‌مندی‌ها', value: stats?.favorites_count, icon: Icons.favorites, color: 'text-destructive', glow: 'bg-destructive/10' },
          ].map((item) => (
            <div key={item.label} className="bg-surface/40 border border-border rounded-2xl p-5 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm">
              <div className={`w-12 h-12 rounded-xl ${item.glow} flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon path={item.icon} />
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tighter mb-1">{statsLoading ? <span className="inline-block h-8 w-20 bg-surface-2 rounded-lg motion-safe:animate-pulse" /> : (item.value ?? '0')}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>

        {/* کیف پول و میانبرها */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* کارت کیف پول */}
          <div className="lg:col-span-1 bg-surface/40 border border-border rounded-3xl p-6 relative overflow-hidden group hover:border-primary/40 transition-all backdrop-blur-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">موجودی کیف پول</h3>
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary">
                  <Icon path={Icons.wallet} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground mb-1 tracking-tighter">
                {(stats?.wallet_balance || 0).toLocaleString('fa-IR')} 
                <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
              </p>
              <p className="text-xs text-muted-foreground mb-6">برای ویژه کردن آگهی‌ها استفاده کنید</p>
              <Link href="/dashboard/wallet" className="flex items-center justify-center gap-2 w-full py-2.5 btn btn-glass rounded-xl text-xs font-medium">
                شارژ کیف پول
              </Link>
            </div>
          </div>

          {/* میانبرهای سریع */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { href: '/dashboard/listings', title: 'مدیریت آگهی‌ها', desc: 'ویرایش، حذف و مدیریت آگهی‌های فعال', icon: Icons.listings, color: 'text-primary' },
              { href: '/dashboard/messages', title: 'صندوق پیام‌ها', desc: 'مشاهده و پاسخ به پیام‌های خریداران', icon: Icons.messages, color: 'text-success' },
              { href: '/dashboard/favorites', title: 'لیست علاقه‌مندی‌ها', desc: 'آگهی‌هایی که ذخیره کرده‌اید', icon: Icons.favorites, color: 'text-destructive' },
              { href: '/dashboard/settings', title: 'تنظیمات حساب', desc: 'ویرایش پروفایل و اطلاعات تماس', icon: Icons.settings, color: 'text-muted-foreground' },
            ].map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="bg-surface/40 border border-border rounded-2xl p-5 hover:border-primary/40 hover:bg-surface transition-all duration-300 group flex items-start gap-4 backdrop-blur-sm"
              >
                <div className={`w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center ${item.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon path={item.icon} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground">{item.title}</p>
                    <Icon path={Icons.chevronLeft} className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* فعالیت‌های اخیر */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ErrorBoundary>
            <div className="bg-surface/40 border border-border rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 tracking-tight">فعالیت‌های اخیر</h3>
              <ActivityCard activities={activities} />
            </div>
          </ErrorBoundary>

          <ErrorBoundary><NotifsCard /></ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center"><Skeleton className="h-6 w-48 mx-auto" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}