'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useListing } from '@/hooks/useListings';
import { ListingGallery } from '@/components/listing/ListingGallery';
import { RelatedListings } from '@/components/listing/RelatedListings';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import { ShareButton } from '@/components/listing/ShareButton';
import { FadeIn } from '@/components/common/MotionDiv';
import { Skeleton } from '@/components/common/Skeleton';

const PRICE_LABELS: Record<string, string> = {
  fixed: 'قیمت ثابت',
  negotiable: 'توافقی',
  auction: 'حراج',
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  published: { label: 'منتشر شده', className: 'bg-success/10 text-success border-success/30' },
  pending: { label: 'در انتظار تایید', className: 'bg-warning/10 text-warning border-warning/30' },
  draft: { label: 'پیش‌نویس', className: 'bg-surface-2 text-muted-foreground border-border' },
  sold: { label: 'فروخته شده', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  rejected: { label: 'رد شده', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  archived: { label: 'بایگانی', className: 'bg-surface-2 text-muted-foreground border-border' },
};

function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR');
}

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: listing, isLoading, isError, refetch } = useListing(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 space-y-8">
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-[4/3] rounded-3xl" />
              <Skeleton className="h-8 w-3/4 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">خطا در بارگذاری آگهی</p>
          <button onClick={() => refetch()} className="btn btn-primary">
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">آگهی یافت نشد</p>
          <button onClick={() => router.push('/listings')} className="btn btn-primary">
            بازگشت به لیست
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_MAP[listing.status] || STATUS_MAP.draft;

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 md:pt-28 pb-12 md:pb-16">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/listings" className="btn btn-ghost btn-sm">
              <svg className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              همه آگهی‌ها
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">{listing.title}</span>
          </div>

          {/* Main grid: gallery + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left: Gallery + Details */}
            <div className="lg:col-span-2 space-y-8">

              {/* Gallery */}
              <ListingGallery images={listing.images || []} />

              {/* Title + actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-black text-foreground">{listing.title}</h1>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusStyle.className}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  {listing.category_name && (
                    <p className="text-sm text-muted-foreground mt-2">{listing.category_name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <FavoriteButton listingId={listing.id} size="md" />
                  <ShareButton title={listing.title} url={`/listings/${slug}`} />
                </div>
              </div>

              {/* Price */}
              <div className="glass rounded-3xl p-6 border border-border-subtle">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-black text-foreground tracking-tighter">
                    {formatPrice(listing.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">تومان</span>
                  <span className="text-xs bg-surface-2 px-2 py-0.5 rounded-full text-muted-foreground border border-border-subtle">
                    {PRICE_LABELS[listing.price_type] || listing.price_type}
                  </span>
                </div>
                {listing.published_at && (
                  <p className="text-xs text-muted-foreground mt-3">
                    تاریخ انتشار: {new Date(listing.published_at).toLocaleDateString('fa-IR')}
                  </p>
                )}
              </div>

              {/* Description */}
              {listing.description && (
                <div className="glass rounded-3xl p-6 border border-border-subtle">
                  <h2 className="text-sm font-bold text-foreground mb-4">توضیحات</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Attributes */}
              {listing.attributes && listing.attributes.length > 0 && (
                <div className="glass rounded-3xl p-6 border border-border-subtle">
                  <h2 className="text-sm font-bold text-foreground mb-4">مشخصات</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.attributes.map((attr) => (
                      <div key={attr.id} className="bg-surface-2/50 rounded-2xl px-4 py-3 border border-border-subtle">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{attr.label || attr.name}</p>
                        <p className="text-sm font-bold text-foreground mt-1">
                          {attr.value}
                          {attr.unit && <span className="text-xs text-muted-foreground font-normal mr-1">{attr.unit}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {(listing.province_name || listing.city_name) && (
                <div className="glass rounded-3xl p-6 border border-border-subtle">
                  <h2 className="text-sm font-bold text-foreground mb-4">موقعیت</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{[listing.province_name, listing.city_name].filter(Boolean).join('، ')}</span>
                  </div>
                </div>
              )}

              {/* Health link */}
              <Link
                href={`/listings/${slug}/health`}
                className="glass rounded-3xl p-6 border border-border-subtle block hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center group-hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12l2 2 4-4" /><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">سلامت و سابقه ماشین</p>
                      <p className="text-xs text-muted-foreground">مشاهده سرویس‌ها و تعمیرات</p>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </div>
              </Link>
            </div>

            {/* Right: Seller + Sticky sidebar */}
            <div className="space-y-6">
              {/* Seller Info */}
              {listing.seller_name && (
                <div className="glass rounded-3xl p-6 border border-border-subtle">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-foreground text-sm">اطلاعات فروشنده</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center text-xl font-black text-white shrink-0">
                      {listing.seller_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{listing.seller_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">فروشنده</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Info */}
              <div className="glass rounded-3xl p-6 border border-border-subtle space-y-4">
                <h3 className="text-sm font-bold text-foreground">اطلاعات آگهی</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">شناسه</span>
                    <span className="text-foreground font-medium">{listing.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">وضعیت</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.className}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  {listing.views !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">بازدید</span>
                      <span className="text-foreground font-medium">{listing.views.toLocaleString('fa-IR')}</span>
                    </div>
                  )}
                  {listing.is_featured && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ویژه</span>
                      <span className="text-warning">بله</span>
                    </div>
                  )}
                  {listing.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">انقضا</span>
                      <span className="text-foreground font-medium">{new Date(listing.expires_at).toLocaleDateString('fa-IR')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related Listings */}
          {listing.category_id && (
            <RelatedListings categoryId={listing.category_id} excludeSlug={slug} />
          )}
        </div>
      </div>
    </FadeIn>
  );
}
