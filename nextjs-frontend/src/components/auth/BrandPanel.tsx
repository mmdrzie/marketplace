'use client';

import Link from 'next/link';
import { Car, Newspaper, Store, Tag, Users } from 'lucide-react';
import { useBrandStats, useLatestListings, useLatestNews, useLatestPrices } from '@/hooks/useBrandPanel';
import { formatPrice } from '@/lib/utils';
import { toPersianNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

function PanelSkeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-lg bg-brand-panel-foreground/10 animate-shimmer', className)} aria-hidden="true" />;
}

function StatsWidget() {
  const { data, isLoading } = useBrandStats();
  const counters = data?.counters;
  const items = [
    { icon: Car, label: 'آگهی فعال', value: counters?.activeListings },
    { icon: Store, label: 'کسب‌وکار معتبر', value: counters?.approvedDealers },
    { icon: Users, label: 'کاربران', value: counters?.totalUsers },
    { icon: Users, label: 'کاربران آنلاین', value: counters?.activeUsers },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="rounded-2xl border border-brand-panel-foreground/10 bg-brand-panel-foreground/5 backdrop-blur-sm p-4 transition-all hover:border-brand-panel-foreground/20 hover:bg-brand-panel-foreground/10"
        >
          <div className="flex items-center gap-2 text-[11px] text-brand-panel-foreground/60">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{label}</span>
          </div>
          {isLoading || value === undefined ? (
            <PanelSkeleton className="h-7 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-bold tracking-tighter tabular-nums text-brand-panel-foreground mt-1.5">
              {toPersianNumber(value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function MiniList({ items, icon }: { items: React.ReactNode[]; icon: React.ReactNode }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug">
          <span className="mt-0.5 text-brand-panel-foreground/40 shrink-0">{icon}</span>
          <span className="min-w-0 flex-1 text-brand-panel-foreground/85 line-clamp-2">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LatestListingsWidget() {
  const { data, isLoading } = useLatestListings();
  const listings = data ?? [];
  return (
    <div className="rounded-2xl border border-brand-panel-foreground/10 bg-brand-panel-foreground/5 backdrop-blur-sm p-4 min-h-[108px]">
      <p className="text-[11px] font-medium text-brand-panel-foreground/60 mb-3 flex items-center gap-1.5">
        <Car className="h-3.5 w-3.5" aria-hidden="true" /> آخرین آگهی‌ها
      </p>
      {isLoading ? (
        <div className="space-y-2.5">
          <PanelSkeleton className="h-4 w-full" />
          <PanelSkeleton className="h-4 w-4/5" />
          <PanelSkeleton className="h-4 w-3/5" />
        </div>
      ) : listings.length === 0 ? (
        <p className="text-xs text-brand-panel-foreground/50">آگهی‌ای ثبت نشده است</p>
      ) : (
        <MiniList
          icon={<Car className="h-3 w-3" aria-hidden="true" />}
          items={listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.slug}`} className="hover:text-amber-bright transition-colors">
              {l.title}
            </Link>
          ))}
        />
      )}
    </div>
  );
}

function LatestPricesWidget() {
  const { data, isLoading } = useLatestPrices();
  const listings = data ?? [];
  return (
    <div className="rounded-2xl border border-brand-panel-foreground/10 bg-brand-panel-foreground/5 backdrop-blur-sm p-4 min-h-[108px]">
      <p className="text-[11px] font-medium text-brand-panel-foreground/60 mb-3 flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5" aria-hidden="true" /> آخرین قیمت‌ها
      </p>
      {isLoading ? (
        <div className="space-y-2.5">
          <PanelSkeleton className="h-4 w-full" />
          <PanelSkeleton className="h-4 w-4/5" />
          <PanelSkeleton className="h-4 w-3/5" />
        </div>
      ) : listings.length === 0 ? (
        <p className="text-xs text-brand-panel-foreground/50">قیمتی ثبت نشده است</p>
      ) : (
        <MiniList
          icon={<Tag className="h-3 w-3" aria-hidden="true" />}
          items={listings.map((l) => (
            <Link key={l.id} href={`/listings/${l.slug}`} className="flex items-baseline justify-between gap-2 hover:text-amber-bright transition-colors">
              <span className="min-w-0 truncate">{l.title}</span>
              <span className="text-amber-bright/90 tabular-nums shrink-0 text-xs">{formatPrice(l.price)}</span>
            </Link>
          ))}
        />
      )}
    </div>
  );
}

function LatestNewsWidget() {
  const { data, isLoading } = useLatestNews();
  const news = data ?? [];
  return (
    <div className="rounded-2xl border border-brand-panel-foreground/10 bg-brand-panel-foreground/5 backdrop-blur-sm p-4 min-h-[108px]">
      <p className="text-[11px] font-medium text-brand-panel-foreground/60 mb-3 flex items-center gap-1.5">
        <Newspaper className="h-3.5 w-3.5" aria-hidden="true" /> آخرین اخبار
      </p>
      {isLoading ? (
        <div className="space-y-2.5">
          <PanelSkeleton className="h-4 w-full" />
          <PanelSkeleton className="h-4 w-4/5" />
          <PanelSkeleton className="h-4 w-3/5" />
        </div>
      ) : news.length === 0 ? (
        <p className="text-xs text-brand-panel-foreground/50">خبری منتشر نشده است</p>
      ) : (
        <MiniList
          icon={<Newspaper className="h-3 w-3" aria-hidden="true" />}
          items={news.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="hover:text-amber-bright transition-colors">
              {n.title}
            </Link>
          ))}
        />
      )}
    </div>
  );
}

export function BrandPanel() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-brand-panel text-brand-panel-foreground">
      {/* گرید پیکسل */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '56px 56px' }}
        aria-hidden="true"
      />
      {/* هاله کهربایی */}
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full blur-[140px] bg-amber-bright/15 pointer-events-none shadow-amber motion-safe:animate-pulse-slow" aria-hidden="true" />
      <div className="absolute bottom-1/3 right-1/4 w-[380px] h-[380px] rounded-full blur-[120px] bg-primary/20 pointer-events-none motion-safe:animate-pulse-slow [animation-delay:2s]" aria-hidden="true" />
      {/* موتیف جاده */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-vignette to-transparent pointer-events-none" aria-hidden="true" />
      <div
        className="absolute bottom-0 inset-x-0 h-2 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0 24px, transparent 24px 48px)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col justify-between gap-10 p-14 xl:p-16">
        <header className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-sm tracking-tighter">TD</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Team Decision</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-bold tracking-tighter leading-tight">
            بازارگاه خودرو
            <br />
            <span className="text-amber-bright">و ماشین‌آلات</span>
          </h2>
          <p className="text-base text-brand-panel-foreground/60 leading-relaxed max-w-md font-light">
            خرید، فروش و جستجوی انواع خودرو، ماشین‌آلات راه‌سازی، کشاورزی و تجهیزات صنعتی با امنیت و سرعت بالا.
          </p>
        </header>

        <StatsWidget />

        <footer className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <LatestListingsWidget />
          <LatestPricesWidget />
          <LatestNewsWidget />
        </footer>
      </div>
    </div>
  );
}
