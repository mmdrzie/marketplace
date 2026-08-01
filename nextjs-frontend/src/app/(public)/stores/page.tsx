'use client';

import { useState, useEffect } from 'react';
import { useStores } from '@/hooks/usePartsV2';
import { StoreCard } from '@/components/store/StoreCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonListings } from '@/components/common/Skeleton';

export default function StoresPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: stores, isLoading, isError } = useStores(debouncedSearch || undefined);
  const storeList = stores ?? [];

  return (
    <div>
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
          PARTS STORES
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">فروشگاه‌های قطعات یدکی</h1>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          فروشگاه‌های معتبر قطعات یدکی را مرور کنید یا با جستجو فروشگاه مورد نظر خود را پیدا کنید
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md mx-auto">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی فروشگاه..."
            className="w-full bg-surface/60 border border-border rounded-2xl py-3.5 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
          />
        </div>

        {isError ? (
          <EmptyState
            icon="search"
            title="خطا در دریافت اطلاعات"
            description="مشکلی پیش آمده است. لطفاً دوباره تلاش کنید."
          />
        ) : isLoading ? (
          <div className="pt-6"><SkeletonListings count={6} /></div>
        ) : storeList.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              icon="search"
              title="هیچ فروشگاه‌ای یافت نشد"
              description="فروشگاهی با این مشخصات وجود ندارد."
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{storeList.length.toLocaleString('fa-IR')} فروشگاه</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeList.map((store: any, i: number) => (
                <StoreCard key={store.user_id || store.store_slug} store={store} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
