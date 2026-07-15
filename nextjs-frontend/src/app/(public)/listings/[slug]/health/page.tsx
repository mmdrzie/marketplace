'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useListing } from '@/hooks/useListings';
import { useServiceLogStore, calcHealthScore } from '@/store/serviceLogStore';
import { HealthScoreBadge } from '@/components/listing/HealthScoreBadge';
import { ServiceLogTimeline } from '@/components/listing/ServiceLogTimeline';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';

export default function ListingHealthPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading } = useListing(slug);
  const allServiceRecords = useServiceLogStore((s) => s.records);
  const records = useMemo(() => allServiceRecords.filter((r) => r.listingId === (listing?.id || 0)), [allServiceRecords, listing?.id]);
  const score = useMemo(() => calcHealthScore(records), [records]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="motion-safe:animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded-2xl w-48" />
          <div className="h-64 bg-surface rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted-foreground">
        آگهی یافت نشد
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[100px] -z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-primary/8 rounded-full blur-[80px] -z-0 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/listings/${slug}`}
              className="btn btn-ghost btn-sm"
            >
              <svg className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              بازگشت
            </Link>
          </div>

          <div className="glass rounded-2xl p-6 border border-border-subtle mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-black text-foreground">سلامت و سابقه ماشین</h1>
                <p className="text-sm text-muted-foreground mt-1">{listing.title}</p>
              </div>
              <HealthScoreBadge score={score} size="lg" />
            </div>
          </div>

          {records.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-border-subtle mb-6">
              <h3 className="text-sm font-bold text-foreground mb-4">خلاصه سلامت</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-2xl font-black text-success">{records.filter((r) => r.type === 'maintenance' || r.type === 'oil_change' || r.type === 'inspection').length}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">سرویس‌ها</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-warning">{records.filter((r) => r.type === 'repair' || r.type === 'part_replacement').length}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">تعمیرات</p>
                </div>
                <div>
                  <span className="text-2xl font-black text-destructive">{records.filter((r) => r.type === 'accident').length}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">حوادث</p>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5 border border-border-subtle">
            <h3 className="text-sm font-bold text-foreground mb-4">تاریخچه خدمات</h3>
            <ServiceLogTimeline records={records} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
