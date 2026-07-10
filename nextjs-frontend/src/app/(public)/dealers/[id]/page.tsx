'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingGrid } from '@/components/listing/ListingGrid';
const DealerReviews = dynamic(() => import('@/components/common/DealerReviews').then(mod => mod.DealerReviews));
import { AuthGate } from '@/components/common/AuthGate';
import { TrustBadge, getTier, getScore } from '@/components/common/TrustBadge';
import { StatChartCard } from '@/components/common/Charts';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import Image from 'next/image';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { User, Listing } from '@/types';

async function fetchDealerProfile(id: string) {
  const res = await api.get(`/users/${id}/profile`);
  return res.data.data as User;
}

export default function DealerStorefrontPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dealerId = parseInt(id);

  const { data: apiUser } = useQuery({
    queryKey: queryKeys.dealers.profile(id),
    queryFn: async () => {
      const res = await api.get(`/dealers/${id}/profile`);
      return res.data.data as User;
    },
    enabled: !!id,
  });

  const { data: apiListings } = useQuery({
    queryKey: ['listings', 'seller', id],
    queryFn: async () => { const res = await api.get('/listings', { params: { seller_id: id } }); return res.data.data as Listing[]; },
    enabled: !!id,
  });

  const dealer = apiUser;
  const listings = apiListings ?? [];
  const dp = dealer?.dealer_profile;
  const isAgency = dealer?.role === 'agency';

  if (!dealer && !apiUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-surface-2 border border-border-subtle flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-4.5A1 1 0 015.45 4h13.1a1 1 0 01.95.5L21 9m-18 0h18m-18 0v10a1 1 0 001 1h16a1 1 0 001-1V9M9 20v-6h6v6" /></svg></div>
          <h1 className="text-2xl font-black text-foreground mb-2">فروشنده یافت نشد</h1>
          <p className="text-muted-foreground mb-6">این فروشنده در سیستم ثبت نشده است.</p>
          <Link href="/" className="btn btn-primary">بازگشت به صفحه اصلی</Link>
        </div>
      </div>
    );
  }

  const score = getScore(dp?.is_verified, 12, !!dp?.subscription_plan);
  const tier = getTier(12);

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full blur-[150px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 8%, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-indigo) 8%, transparent)' }} />
        <div className="relative z-10">
          <Breadcrumbs />

          {/* Cover banner */}
          <div className="relative h-48 md:h-64 border-b border-border overflow-hidden" style={{ background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--color-accent-blue) 40%, transparent), color-mix(in srgb, var(--color-accent-indigo) 30%, transparent), var(--color-background))' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top right, color-mix(in srgb, var(--color-accent-blue) 12%, transparent), transparent 60%)` }} />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-10" />
          </div>

          <div className="max-w-7xl mx-auto px-4 pb-12 -mt-20 md:-mt-28 relative">
            {/* Profile header */}
            <div className="glass rounded-3xl border border-border-subtle p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Logo */}
                <div className="relative shrink-0">
                  {dp?.logo ? (
                    <div className="w-24 h-24 rounded-2xl p-0.5 bg-gradient-accent shadow-glow-accent">
                      <Image src={dp.logo} alt={dp.business_name} width={96} height={96} className="w-full h-full rounded-2xl object-cover border-2 border-background" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-gradient-accent flex items-center justify-center text-3xl font-black text-white shadow-glow-accent">
                      {dp?.business_name?.[0] || dealer?.name?.[0] || '?'}
                    </div>
                  )}
                  {dp?.is_verified && (
                    <span className="absolute -top-1 -right-1 w-7 h-7 bg-success rounded-xl flex items-center justify-center border-2 border-background shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">{dp?.business_name || dealer?.name || 'فروشنده'}</h1>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${isAgency ? 'bg-accent-indigo/15 text-accent-indigo border-accent-indigo/25' : 'bg-warning/15 text-warning border-warning/25'}`}>
                      {isAgency ? 'آژانس' : 'نمایندگی'}
                    </span>
                    <TrustBadge tier={tier} score={score} deals={12} verified={dp?.is_verified} />
                  </div>

                  {dp?.description && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl">{dp.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    {dealer?.city && (
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {dealer.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      عضویت از {dealer?.created_at ? formatDate(dealer.created_at) : '-'}
                    </span>
                    {dp?.address && (
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {dp.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 flex gap-2">
                  <AuthGate minimal message="برای ارسال پیام به فروشنده وارد حساب خود شوید">
                    <button
                      onClick={() => router.push(`/login?redirect=/dealers/${id}`)}
                      className="btn btn-primary text-sm"
                    >
                      ارسال پیام
                    </button>
                  </AuthGate>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatChartCard title="آگهی فعال" value={listings.filter((l) => l.status === 'published').length.toLocaleString('fa-IR')} chartData={[4, 6, 8, 5, 7, 9, 6, 8, 10, 12]} color="var(--color-accent-blue)" />
              <StatChartCard title="معاملات موفق" value="۱۲" chartData={[1, 2, 1, 3, 2, 4, 3, 5, 4, 6]} color="var(--color-success)" />
              <StatChartCard title="امتیاز" value="۸۶" trend={8} chartData={[60, 65, 72, 70, 78, 82, 86]} color="var(--color-warning)" />
              <StatChartCard title="سرعت پاسخگویی" value="۲ ساعت" trend={-15} chartData={[5, 4, 4, 3, 3, 2, 2]} color="var(--color-accent-indigo)" />
            </div>

            {/* Deals info bar */}
            {dp?.subscription_plan && (
              <div className="glass rounded-2xl border border-border-subtle px-5 py-3 mb-8 flex items-center gap-3 text-xs text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-blue shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <span>اشتراک <strong className="text-foreground">{dp.subscription_plan === 'professional' ? 'حرفه‌ای' : 'پایه'}</strong> — اعتبار تا {dp.subscription_expires_at ? formatDate(dp.subscription_expires_at) : '-'}</span>
                {dp.listings_limit && <span className="mr-auto">ظرفیت باقیمانده: <strong className="text-foreground">{(dp.listings_limit - listings.length).toLocaleString('fa-IR')}</strong> آگهی</span>}
              </div>
            )}

            {/* Listings */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                  <h2 className="text-lg font-black text-foreground">آگهی‌های فروشنده</h2>
                  <span className="text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">{listings.length.toLocaleString('fa-IR')} آگهی</span>
                </div>
              </div>

              {listings.length > 0 ? (
                <ListingGrid listings={listings} />
              ) : (
                <div className="glass rounded-3xl p-12 text-center border border-border-subtle">
                  <div className="mb-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                  <p className="text-muted-foreground text-sm">هیچ آگهی فعالی برای این فروشنده یافت نشد.</p>
                </div>
              )}
            </section>

            {/* Reviews */}
            <section className="mt-8">
              <AuthGate message="برای مشاهده و ثبت نظر درباره این فروشنده وارد حساب خود شوید">
                <DealerReviews dealerId={dealerId} />
              </AuthGate>
            </section>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
