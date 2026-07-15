'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTenders } from '@/hooks/useTenders';
import { TenderCard } from '@/components/tender/TenderCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { SkeletonListings } from '@/components/common/Skeleton';
import { TENDER_TYPE_LABELS } from '@/store/tenderStore';

export default function TendersPage() {
  const { data: tenders, isLoading, error } = useTenders();
  const tenderList = tenders ?? [];
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const open = tenderList.filter((t: { status: string }) => t.status === 'open');
  const other = tenderList.filter((t: { status: string }) => t.status !== 'open');

  const filtered = [...open, ...other].filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] -z-0 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 8%, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] rounded-full blur-[80px] -z-0 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-indigo) 8%, transparent)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-block text-[10px] font-bold tracking-widest text-primary uppercase mb-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                TENDER & RENTAL
              </span>
              <h1 className="text-2xl md:text-4xl font-black text-foreground">نیازسنجی بازار</h1>
              <p className="text-muted-foreground mt-1 text-sm">درخواست‌های اجاره، خرید و قرارداد ماشین‌آلات</p>
            </div>
            <Link href="/tenders/new" className="btn btn-primary shrink-0">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              ثبت درخواست جدید
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            {[{ key: 'all', label: 'همه' } as const, ...Object.entries(TENDER_TYPE_LABELS).map(([k, l]) => ({ key: k, label: l }))].map((t) => (
              <button
                key={t.key}
                onClick={() => setFilterType(t.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === t.key ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
            <div className="mr-auto w-full sm:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو..."
                className="w-full sm:w-48 px-3 py-1.5 glass-input rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {isLoading ? (
            <SkeletonListings count={6} />
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              </div>
              <p className="text-destructive font-medium">خطا در بارگذاری درخواست‌ها</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="درخواستی یافت نشد"
              description="هیچ درخواست مناقصه‌ای با این فیلترها وجود ندارد"
              action={<Link href="/tenders/new" className="btn btn-primary">ثبت درخواست جدید</Link>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((tender) => (
                <TenderCard key={tender.id} tender={tender} />
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
