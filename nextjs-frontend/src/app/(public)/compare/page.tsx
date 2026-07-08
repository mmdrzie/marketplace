'use client';

import Link from 'next/link';
import { useCompareStore } from '@/store/compareStore';
import type { CompareItem } from '@/store/compareStore';
import { EmptyState } from '@/components/common/EmptyState';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { RadarChart } from '@/components/compare/RadarChart';
import { SpecComparisonGrid } from '@/components/compare/SpecComparisonGrid';
import { PriceDepreciationChart } from '@/components/compare/PriceDepreciationChart';
import { toast } from '@/components/common/Toast';

// Theme-aware colors for charts
const CHART_COLORS = [
  'var(--color-primary)', 
  'var(--color-success)', 
  'var(--color-warning)', 
  'var(--color-destructive)', 
  'var(--color-primary)'
];

function extractNumericAttrs(items: CompareItem[]) {
  const attrMap: Record<string, { label: string; values: (number | null)[] }> = {};
  items.forEach((item, idx) => {
    if (item.attributes) {
      item.attributes.forEach((a) => {
        const cleaned = a.value.replace(/[,،\s]/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num) && isFinite(num)) {
          if (!attrMap[a.name]) attrMap[a.name] = { label: a.label || a.name, values: items.map(() => null) };
          attrMap[a.name].values[idx] = num;
        }
      });
    }
  });
  return Object.entries(attrMap)
    .filter(([, v]) => v.values.every((x) => x !== null))
    .map(([key, v]) => ({ key, label: v.label, values: v.values as number[] }));
}

function bestItem(items: CompareItem[]) {
  return items.reduce((best, item) => {
    if (!best || (typeof item.price === 'number' && typeof best.price === 'number' && item.price < best.price)) return item;
    return best;
  }, null as CompareItem | null);
}

export default function ComparePage() {
  const { items, removeItem, clearAll } = useCompareStore();

  const numericAttrs = extractNumericAttrs(items);

  const radarSeries = numericAttrs.length >= 3 ? items.map((item, idx) => {
    const values = numericAttrs.map((attr) => attr.values[idx]);
    const maxVals = numericAttrs.map((attr) => Math.max(...attr.values, 1));
    return {
      label: item.title.length > 12 ? item.title.slice(0, 12) + '...' : item.title,
      data: values.map((v, i) => (v / maxVals[i]) * 100),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    };
  }) : [];

  const depreciationItems = items
    .filter((i) => typeof i.price === 'number')
    .map((i, idx) => ({
      id: i.id,
      title: i.title,
      price: i.price as number,
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
          <Breadcrumbs />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 mt-4">
            <div>
              <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm shadow-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                COMPARE LISTINGS
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">مقایسه آگهی‌ها</h1>
            </div>
            {items.length > 0 && (
              <button 
                onClick={() => { clearAll(); toast({ type: 'info', title: 'همه موارد از مقایسه حذف شدند' }); }} 
                className="text-xs text-destructive hover:bg-destructive/5 px-4 py-2 rounded-full border border-destructive/20 transition-all"
              >
                پاک کردن همه
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="glass rounded-3xl p-8 border border-border-subtle flex items-center justify-center min-h-[400px]">
              <EmptyState
                title="موردی برای مقایسه وجود ندارد"
                description="از دکمه مقایسه روی کارت آگهی‌ها استفاده کن."
                action={<Link href="/listings" className="btn btn-primary rounded-xl">مشاهده آگهی‌ها</Link>}
              />
            </div>
          ) : (
            <div className="space-y-10 md:space-y-12">
              
              {/* Radar Chart Section */}
              {radarSeries.length >= 2 && (
                <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm overflow-hidden">
                  <h3 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    مقایسه فنی (رادار)
                  </h3>
                  <div className="flex justify-center">
                    <RadarChart
                      series={radarSeries}
                      categories={numericAttrs.map((a) => a.label)}
                      size={320}
                      className="mx-auto"
                    />
                  </div>
                </div>
              )}

              {/* Depreciation Chart Section */}
              {depreciationItems.length >= 2 && (
                <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm overflow-hidden">
                  <h3 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-4 bg-primary rounded-full"></span>
                    نمودار استهلاک قیمت
                  </h3>
                  <PriceDepreciationChart items={depreciationItems} />
                </div>
              )}

              {/* Spec Grid Section */}
              <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  جدول مشخصات
                </h3>
                <SpecComparisonGrid items={items} onRemove={removeItem} />
              </div>

              {/* Smart Suggestion Section */}
              <div className="glass rounded-3xl p-6 md:p-8 border border-primary/20 text-center overflow-hidden relative shadow-sm">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[100px] bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                    پیشنهاد هوشمند
                  </h4>
                  <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                    از بین آیتم‌های انتخاب شده، <span className="font-bold text-foreground">{bestItem(items)?.title || 'هیچکدام'}</span> از نظر قیمت به صرفه‌ترین گزینه است.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}