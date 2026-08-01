'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/hooks/usePartsV2';
import { StoreHeader } from '@/components/store/StoreHeader';
import { PartCard } from '@/components/parts/PartCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading, LoadingPage } from '@/components/common/Loading';
import { SkeletonListings } from '@/components/common/Skeleton';

export default function StorePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: store, isLoading, isError } = useStore(slug);
  const [search, setSearch] = useState('');

  const filteredInventory = useMemo(() => {
    if (!store?.inventory) return [];
    if (!search.trim()) return store.inventory;
    const q = search.trim().toLowerCase();
    return store.inventory.filter((item: any) =>
      item.part_name?.toLowerCase().includes(q) ||
      item.part_number?.toLowerCase().includes(q) ||
      item.oem_number?.toLowerCase().includes(q)
    );
  }, [store, search]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          icon="search"
          title="خطا در دریافت اطلاعات"
          description="مشکلی پیش آمده است. لطفاً دوباره تلاش کنید."
        />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          icon="search"
          title="فروشگاه یافت نشد"
          description="فروشگاه مورد نظر وجود ندارد."
        />
      </div>
    );
  }

  return (
    <div>
      <StoreHeader store={store} />

      <div className="mt-8">
        <div className="relative max-w-md mb-4">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در قطعات این فروشگاه..."
            className="w-full bg-surface/60 border border-border rounded-2xl py-3.5 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{filteredInventory.length.toLocaleString('fa-IR')} قطعه</p>
        </div>

        {filteredInventory.length === 0 ? (
          <EmptyState
            icon="search"
            title="قطعه‌ای یافت نشد"
            description="هیچ قطعه‌ای با این مشخصات در فروشگاه وجود ندارد."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredInventory.map((item: any, i: number) => (
              <PartCard
                key={item.id}
                part={{
                  id: item.part_id,
                  name: item.part_name,
                  part_number: item.part_number,
                  oem_number: item.oem_number,
                  category_label: item.category_name,
                  price: item.price,
                  images: item.images,
                  _store_count: 1,
                }}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
