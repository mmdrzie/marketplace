'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useEscrowStore } from '@/store/escrowStore';
import type { DealStatus } from '@/store/escrowStore';
import { TransactionCard } from '@/components/escrow/TransactionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';

const TABS: { key: DealStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'همه' },
  { key: 'pending_payment', label: 'در انتظار پرداخت' },
  { key: 'payment_held', label: 'وجه بلوکه شده' },
  { key: 'under_review', label: 'در حال بررسی' },
  { key: 'released', label: 'آزادسازی شده' },
  { key: 'cancelled', label: 'لغو شده' },
];

export default function DealsPage() {
  const { user } = useAuthStore();
  const deals = useEscrowStore((s) => s.deals);
  const [tab, setTab] = useState<DealStatus | 'all'>('all');

  const userDeals = deals.filter((d) => d.buyerId === user?.id || d.sellerId === user?.id);
  const filtered = tab === 'all' ? userDeals : userDeals.filter((d) => d.status === tab);

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 py-12 md:py-16">
          <div className="mb-8">
            <Breadcrumbs />
          </div>

          {/* هدر صفحه */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm shadow-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                SECURE DEALS
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">معاملات امن</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base font-light">
                پیگیری معاملات از طریق سیستم پرداخت امن (اسکرو)
              </p>
            </div>
          </div>

          {/* تب‌های فیلتر (Pill Design) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-10 scrollbar-dropdown">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  tab === t.key
                    ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                    : 'bg-surface/40 text-muted-foreground border-border hover:text-foreground hover:bg-surface-2/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* لیست معاملات یا حالت خالی */}
          {filtered.length === 0 ? (
            <div className="glass rounded-3xl border border-border-subtle py-24 flex items-center justify-center shadow-sm">
              <EmptyState
                title="معامله‌ای یافت نشد"
                description={tab === 'all' ? 'هنوز معامله‌ای ثبت نکرده‌اید' : 'معامله‌ای با این وضعیت وجود ندارد'}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((deal) => (
                <TransactionCard key={deal.id} deal={deal} isBuyer={deal.buyerId === user?.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}