'use client';

import { useFavorites } from '@/hooks/useFavorites';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/common/EmptyState';

export default function FavoritesPage() {
  const { data, isLoading } = useFavorites();
  const listings = data?.data || [];

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8 animate-pulse">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-surface-2 rounded-xl"></div>
            <div className="h-4 w-64 bg-surface-2/70 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface/40 border border-border rounded-2xl aspect-[4/5]"></div>
            ))}
          </div>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8">
        
        {/* هدر صفحه */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              SAVED ITEMS
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">علاقه‌مندی‌ها</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base font-light">
              آگهی‌هایی که برای دسترسی سریع‌تر ذخیره کرده‌اید
            </p>
          </div>
        </div>

        {/* نمایش گرید یا حالت خالی */}
        {listings.length === 0 ? (
          <div className="glass rounded-3xl border border-border-subtle py-24 flex items-center justify-center">
            <EmptyState
              icon="favorite"
              title="لیست علاقه‌مندی‌های شما خالی است"
              description="با کلیک روی آیکون قلب در صفحه آگهی‌ها، آن‌ها را برای مشاهده بعدی ذخیره کنید"
            />
          </div>
        ) : (
          <div className="glass rounded-3xl p-4 md:p-6 border border-border-subtle">
            <ListingGrid listings={listings} />
          </div>
        )}
      </div>
    </div>
  );
}