'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useListing } from '@/hooks/useListings';
import { useStartConversation } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
const ReportModal = dynamic(() => import('@/components/common/ReportModal').then(mod => mod.ReportModal));
const FeaturedPurchaseModal = dynamic(() => import('@/components/payment/FeaturedPurchaseModal').then(mod => mod.FeaturedPurchaseModal));
import { ListingGallery } from '@/components/listing/ListingGallery';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SellerCard } from '@/components/listing/SellerCard';
const RelatedListings = dynamic(() => import('@/components/listing/RelatedListings').then(mod => mod.RelatedListings));
const RecentlyViewed = dynamic(() => import('@/components/common/RecentlyViewed').then(mod => mod.RecentlyViewed));
const PriceHistoryChart = dynamic(() => import('@/components/common/Charts').then(mod => mod.PriceHistoryChart));
const LoanCalculator = dynamic(() => import('@/components/common/LoanCalculator').then(mod => mod.LoanCalculator));
const DealerReviews = dynamic(() => import('@/components/common/DealerReviews').then(mod => mod.DealerReviews));
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { AuthGate } from '@/components/common/AuthGate';
const MapView = dynamic(() => import('@/components/listing/MapView').then(mod => mod.MapView), { ssr: false });
const CompatibleParts = dynamic(() => import('@/components/listing/CompatibleParts').then(mod => mod.CompatibleParts));
import { HealthScoreBadge } from '@/components/listing/HealthScoreBadge';
import { useServiceLogStore, calcHealthScore } from '@/store/serviceLogStore';
import { useEscrowDeals, useCreateEscrowDeal } from '@/hooks/useEscrow';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import { generatePriceHistory } from '@/lib/chartData';
import { ShareButton } from '@/components/listing/ShareButton';
import { FocusTrap } from '@/components/common/FocusTrap';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { toast } from '@/components/common/Toast';
import { formatDate, toPersianNumber } from '@/lib/utils';
import type { AttributeValue, ListingImage } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading, error } = useListing(slug);
  const { data: seller } = useQuery({
    queryKey: ['user-profile', listing?.seller_id],
    queryFn: async () => { const res = await api.get(`/users/${listing!.seller_id}/profile`); return res.data.data; },
    enabled: !!listing?.seller_id,
    retry: 2,
  });
  const isAuthenticated = useAuthStore((s) => !!s.token);
  const user = useAuthStore((s) => s.user);
  const startConversation = useStartConversation();
  const router = useRouter();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const addRecent = useRecentlyViewedStore((s) => s.addItem);

  const allServiceRecords = useServiceLogStore((s) => s.records);
  const { data: allDeals } = useEscrowDeals();
  const createDealMutation = useCreateEscrowDeal();

  const records = useMemo(() => allServiceRecords.filter((r) => r.listingId === (listing?.id || 0)), [allServiceRecords, listing?.id]);
  const healthScore = useMemo(() => calcHealthScore(records), [records]);
  const userDeals = useMemo(() => (allDeals ?? []).filter((d: { buyerId: string | number; sellerId: string | number; listingId: string | number }) => (d.buyerId === user?.id || d.sellerId === user?.id) && d.listingId === listing?.id), [allDeals, user?.id, listing?.id]);
  const priceHistory = useMemo(() => {
    const basePrice = typeof listing?.price === 'number' ? listing.price : 500000000;
    return generatePriceHistory(Math.round(basePrice / 1000000), 8, '');
  }, [listing?.price]);

  useEffect(() => {
    if (listing) addRecent(listing);
  }, [listing, addRecent]);

  const isOwner = listing?.seller_id && user?.id === listing.seller_id;

  const handleSendMessage = async () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!listing || !messageBody.trim()) return;
    try {
      const conv = await startConversation.mutateAsync({ listing_id: Number(listing.id), message: messageBody });
      setShowMessageModal(false);
      setMessageBody('');
      router.push(`/dashboard/messages/${conv.id}`);
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-8">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="aspect-[16/9] rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-xl" />
              <Skeleton className="h-6 w-1/2 rounded-xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <p className="text-destructive font-medium">آگهی یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 py-12 md:py-16 space-y-10">
        <Breadcrumbs />

        {/* ۱. گالری تصاویر (تمام عرض بالا) */}
        <div className="glass rounded-3xl p-2 md:p-3 border border-border-subtle shadow-xl">
          <ListingGallery images={listing.images || []} />
        </div>

        {/* ۲. اطلاعات اصلی آگهی (عنوان، قیمت، توضیحات، مشخصات) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* ستون چپ: عنوان، قیمت، توضیحات */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={listing.status} />
                <Link href={`/listings/${slug}/health`}>
                  <HealthScoreBadge score={healthScore} size="sm" />
                </Link>
                {listing.is_featured && (
                  <span className="bg-warning/10 text-warning border border-warning/20 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    ویژه
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tighter text-foreground leading-tight">{listing.title}</h1>
                <div className="flex items-center gap-1.5 shrink-0 pt-1">
                  <ShareButton title={listing.title} />
                  <FavoriteButton listingId={listing.id} size="md" />
                </div>
              </div>

              <div className="text-2xl md:text-3xl font-bold text-primary">
                <PriceDisplay price={listing.price} priceType={listing.price_type} />
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-border-subtle">
              <h3 className="font-bold mb-3 text-foreground text-sm flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                توضیحات
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap font-light">
                {listing.description}
              </p>
            </div>
          </div>

          {/* ستون راست: مشخصات فنی */}
          <div className="lg:col-span-1">
            {listing.attributes && listing.attributes.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-border-subtle sticky top-24">
                <h3 className="font-bold mb-4 text-foreground text-sm flex items-center gap-2 uppercase tracking-wider">
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  مشخصات فنی
                </h3>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {(listing.attributes as AttributeValue[]).map((attr) => (
                    <div key={attr.id} className="flex justify-between items-center py-2.5 px-3 bg-surface-2/50 rounded-xl border border-border-subtle">
                      <span className="text-muted-foreground text-xs">{attr.label}</span>
                      <span className="font-medium text-foreground text-xs">
                        {attr.type === 'boolean' ? (attr.value === '1' ? 'بله' : 'خیر') : attr.value}
                        {attr.unit && ` ${attr.unit}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ۳. موقعیت (نقشه) و اطلاعات فروشنده */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* موقعیت و نقشه */}
          <div className="glass rounded-2xl p-5 border border-border-subtle">
            <h3 className="font-bold mb-4 text-foreground text-sm flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              موقعیت
            </h3>
            <div className="text-sm space-y-2 mb-4">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">استان</span>
                <span className="font-medium text-foreground">{listing.province_name || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">شهر</span>
                <span className="font-medium text-foreground">{listing.city_name || '-'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">تاریخ انتشار</span>
                <span className="font-medium text-foreground">{formatDate(listing.published_at)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">بازدید</span>
                <span className="font-medium text-foreground">{toPersianNumber(listing.views)}</span>
              </div>
            </div>
            {(listing.province_name || listing.city_name) && (
              <MapView address={`${listing.province_name || ''} ${listing.city_name || ''}`} title={listing.title} className="h-40 w-full rounded-xl" />
            )}
          </div>

          {/* فروشنده */}
          <div className="glass rounded-2xl p-5 border border-border-subtle">
            <h3 className="font-bold mb-4 text-foreground text-sm flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              اطلاعات فروشنده
            </h3>
            {listing.seller_id && (
              <AuthGate minimal message="برای مشاهده اطلاعات فروشنده وارد حساب شوید">
                <SellerCard seller={seller} />
              </AuthGate>
            )}
          </div>
        </div>

        {/* ۴. دکمه‌های اکشن */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!isOwner && (
            <>
              <AuthGate minimal message="برای ارسال پیام وارد حساب شوید">
                <button onClick={() => setShowMessageModal(true)} disabled={startConversation.isPending} className="w-full btn btn-primary rounded-xl py-3.5">
                  ارسال پیام به فروشنده
                </button>
              </AuthGate>
              <AuthGate minimal message="برای خرید امن وارد حساب شوید">
                <button onClick={() => {
                  if (!isAuthenticated) { router.push('/login'); return; }
                  if (!listing.seller_id) return;
                  const hasDeal = userDeals.length > 0;
                  if (hasDeal) { router.push(`/dashboard/deals/${userDeals[0].id}`); return; }
                  createDealMutation.mutateAsync({
                    listing_id: listing.id, seller_id: listing.seller_id,
                    amount: typeof listing.price === 'number' ? listing.price : 0,
                  });
                  toast({ type: 'success', title: 'درخواست خرید امن ثبت شد' });
                  router.push('/dashboard/deals');
                }} className="w-full btn btn-glass rounded-xl py-3.5">
                  <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  خرید امن (اسکرو)
                </button>
              </AuthGate>
            </>
          )}

          {isOwner && !listing.is_featured && (
            <button onClick={() => setShowFeaturedModal(true)} className="w-full btn btn-warning rounded-xl py-3.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              ویژه کردن آگهی
            </button>
          )}

          <button onClick={() => setShowReportModal(true)} className={`w-full btn btn-ghost text-destructive border-destructive/20 hover:bg-destructive/5 rounded-xl py-3.5 ${isOwner ? 'md:col-span-2' : ''}`}>
            گزارش آگهی
          </button>
        </div>

        {/* ۵. ابزارها: تاریخچه قیمت + وام (انتقال یافته به زیر دکمه‌ها - طراحی دو پنجره‌ای) */}
        <ErrorBoundary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <ErrorBoundary>
              <div className="glass rounded-2xl p-6 border border-border-subtle h-full">
                <PriceHistoryChart data={priceHistory} />
              </div>
            </ErrorBoundary>
            <ErrorBoundary>
              <div className="glass rounded-2xl p-6 border border-border-subtle h-full">
                <LoanCalculator defaultPrice={typeof listing.price === 'number' ? listing.price : 500000000} />
              </div>
            </ErrorBoundary>
          </div>
        </ErrorBoundary>

        {/* ۶. آگهی‌های مرتبط */}
        {listing.category_id && (
          <RelatedListings categoryId={listing.category_id} excludeSlug={slug} />
        )}

        {/* ۷. نظرات فروشنده */}
        <div>
          <AuthGate message="برای مشاهده و ثبت نظر وارد حساب خود شوید">
            <ErrorBoundary>
              {listing.seller_id && <DealerReviews dealerId={parseInt(listing.seller_id) || 0} />}
            </ErrorBoundary>
          </AuthGate>
        </div>

        {/* ۸. بازدیدهای اخیر */}
        <ErrorBoundary>
          <RecentlyViewed />
        </ErrorBoundary>

        {/* ۹. قطعات و ادوات سازگار (آخرین پنجره) */}
        {listing.category_slug && (
          <CompatibleParts categorySlug={listing.category_slug} categoryName={listing.category_name ?? undefined} />
        )}
      </div>

      {showFeaturedModal && (
        <FeaturedPurchaseModal listingId={listing.id} listingTitle={listing.title} onClose={() => setShowFeaturedModal(false)} />
      )}
      {showReportModal && (
        <ReportModal listingId={listing.id} onClose={() => setShowReportModal(false)} onSuccess={() => {}} />
      )}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="ارسال پیام به فروشنده">
          <div className="absolute inset-0 bg-overlay backdrop-blur-md" onClick={() => setShowMessageModal(false)} />
          <FocusTrap>
            <div className="relative glass rounded-3xl p-6 w-full max-w-md shadow-2xl animate-scale-in border border-border-subtle">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">ارسال پیام به فروشنده</h3>
                <button onClick={() => setShowMessageModal(false)} className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: 'قیمت آخر', text: 'سلام. قیمت آخر این آگهی چند هست؟' },
                  { label: 'بازدید', text: 'سلام. برای بازدید چه زمانی می‌تونم بیام؟' },
                  { label: 'کارکرد', text: `سلام. ${listing.title} چند کیلومتر کار کرده؟` },
                ].map((tpl) => (
                  <button key={tpl.label} onClick={() => setMessageBody(tpl.text)} className="text-xs px-3 py-1.5 rounded-full bg-surface/40 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                    {tpl.label}
                  </button>
                ))}
              </div>
              <textarea value={messageBody} onChange={(e) => setMessageBody(e.target.value)} placeholder="پیام خود را بنویسید..." className="w-full px-4 py-3 glass-input rounded-xl min-h-[100px] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground resize-none" maxLength={1000} />
              <div className="flex gap-3">
                <button onClick={() => setShowMessageModal(false)} className="flex-1 btn btn-glass rounded-xl">انصراف</button>
                <button onClick={handleSendMessage} disabled={!messageBody.trim() || startConversation.isPending} className="flex-1 btn btn-primary rounded-xl">
                  {startConversation.isPending ? 'در حال ارسال...' : 'ارسال'}
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}

      {listing && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: listing.title,
            description: listing.description,
            image: (listing.images as ListingImage[])?.map((i) => i.url) || [],
            offers: { '@type': 'Offer', price: listing.price, priceCurrency: 'IRR', availability: listing.status === 'published' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut' },
            itemCondition: 'https://schema.org/UsedCondition',
            category: listing.category_name,
            areaServed: listing.province_name || 'Iran',
          }),
        }} />
      )}
    </div>
  );
}