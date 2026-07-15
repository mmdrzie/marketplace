'use client';

import { useState } from 'react';
import { useMyListings } from '@/hooks/useListings';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import Link from 'next/link';

const STATUS_TABS = [
  { value: '', label: 'همه' },
  { value: 'active', label: 'فعال' },
  { value: 'pending', label: 'در انتظار' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'sold', label: 'فروخته شده' },
  { value: 'archived', label: 'آرشیو' },
];

export default function MyListingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, error } = useMyListings();
  const allListings = data?.data || [];
  
  const listings = statusFilter
    ? allListings.filter((l: { status: string }) => l.status === statusFilter)
    : allListings;

  const statusCounts = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === '' ? allListings.length : allListings.filter((l: { status: string }) => l.status === tab.value).length,
  }));

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8 motion-safe:animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="h-8 w-48 bg-surface-2 rounded-xl"></div>
              <div className="h-4 w-64 bg-surface-2/70 rounded-lg"></div>
            </div>
            <div className="h-12 w-40 bg-surface-2 rounded-xl"></div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-surface-2 rounded-full" />
            ))}
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

  if (error) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          </div>
          <p className="text-destructive font-medium">خطا در بارگذاری آگهی‌ها</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
              MY LISTINGS
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">آگهی‌های من</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light">
              مدیریت، ویرایش و رهگیری آگهی‌های فعال شما در یک جا
            </p>
          </div>
          <Link href="/dashboard/listings/new" className="inline-flex items-center justify-center gap-2 px-6 py-3 btn btn-primary rounded-xl shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            ثبت آگهی جدید
          </Link>
        </div>

        {/* تب‌های فیلتر وضعیت (Pill Design) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-dropdown">
          {statusCounts.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 border ${
                statusFilter === tab.value
                  ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                  : 'bg-surface/40 text-muted-foreground border-border hover:text-foreground hover:bg-surface-2/50'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                statusFilter === tab.value
                  ? 'bg-foreground/10 text-primary-foreground'
                  : 'bg-surface-2 text-muted-foreground'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* نمایش آگهی‌ها یا حالت خالی */}
        {listings.length === 0 && !isLoading ? (
          <div className="glass rounded-3xl border border-border-subtle py-24 flex items-center justify-center">
            <EmptyState
              icon="listing"
              title={statusFilter ? 'آگهی‌ای با این وضعیت وجود ندارد' : 'هنوز آگهی ثبت نکرده‌اید'}
              description={statusFilter ? 'فیلتر دیگری را انتخاب کنید' : 'اولین آگهی خود را ثبت کنید و به هزاران خریدار در سراسر ایران دسترسی پیدا کنید'}
              action={!statusFilter ? (
                <Link href="/dashboard/listings/new" className="inline-flex items-center justify-center gap-2 px-6 py-3 btn btn-primary rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  ثبت اولین آگهی
                </Link>
              ) : undefined}
            />
          </div>
        ) : (
          <div className="glass rounded-3xl p-4 md:p-6 border border-border-subtle">
            <ListingGrid listings={listings} showStatus />
          </div>
        )}
      </div>
    </div>
  );
}