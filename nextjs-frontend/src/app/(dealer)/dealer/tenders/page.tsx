'use client';

import Link from 'next/link';
import { useTenders } from '@/hooks/useTenders';
import { TenderCard } from '@/components/tender/TenderCard';
import type { Tender } from '@/store/tenderStore';
import { EmptyState } from '@/components/common/EmptyState';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';

export default function DealerTendersPage() {
  const { data: tenders } = useTenders();
  const tenderList = tenders ?? [];

  const available = tenderList.filter((t: Tender) => t.status === 'open');

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-foreground">مدیریت مناقصات</h1>
            <p className="text-sm text-muted-foreground mt-1">درخواست‌های بازار و پیشنهادات ارسالی شما</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'درخواست‌های فعال', value: available.length, color: 'text-primary' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-4 border border-border-subtle text-center">
                <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">درخواست‌های فعال بازار</h3>
            {available.length === 0 ? (
              <EmptyState
                title="درخواست جدیدی وجود ندارد"
                description="همه درخواست‌های فعال را پاسخ داده‌اید"
                action={<Link href="/tenders" className="btn btn-primary btn-sm">مشاهده همه درخواست‌ها</Link>}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {available.map((tender: Tender) => (
                  <TenderCard key={tender.id} tender={tender} showActions />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
