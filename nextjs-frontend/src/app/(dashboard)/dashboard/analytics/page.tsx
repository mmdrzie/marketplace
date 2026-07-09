'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { FadeIn } from '@/components/common/MotionDiv';
import { StatChartCard } from '@/components/common/Charts';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { cn, formatRelativeTime } from '@/lib/utils';
import { generateViewsSeries, generateMessagesSeries } from '@/lib/chartData';
import Image from 'next/image';
import type { Listing } from '@/types';

export default function AnalyticsPage() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data } = useQuery({
    queryKey: queryKeys.listings.my,
    queryFn: async () => {
      const res = await api.get('/listings', { params: { scope: 'me' } });
      return res.data;
    },
    staleTime: 15000,
    retry: 2,
  });

  const listings: Listing[] = data?.data ?? [];
  const selected = listings.find((l) => l.id === selectedId) || listings[0];

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const chartData = useMemo(() => ({
    views: generateViewsSeries(12 + (selectedId % 5) * 3, days),
    messages: generateMessagesSeries(3 + (selectedId % 3), days),
  }), [selectedId, days]);

  const views = chartData.views;
  const msgs = chartData.messages;
  const convRate = views.length ? Math.round((msgs.reduce((a, b) => a + b, 0) / views.reduce((a, b) => a + b, 0)) * 100) : 0;
  const totalViews = views.reduce((a, b) => a + b, 0);

  return (
    <FadeIn>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs />

        <div className="mb-8">
          <span className="text-accent-blue text-sm font-bold tracking-widest uppercase">ANALYTICS</span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mt-1">آمار و آنالیز آگهی‌ها</h1>
          <p className="text-muted-foreground text-sm mt-1">عملکرد آگهی‌هات رو با جزئیات ببین</p>
        </div>

        {/* Listing selector */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {listings.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedId(l.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all shrink-0',
                  selectedId === l.id
                      ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-surface-2 border-border-subtle text-muted-foreground hover:text-foreground',
              )}
            >
              {l.primary_image && <Image src={l.primary_image} alt="" width={20} height={16} className="w-5 h-4 rounded object-cover" />}
              <span className="truncate max-w-[120px]">{l.title}</span>
              <StatusBadge status={l.status} />
            </button>
          ))}
        </div>

        {/* Selected listing info */}
        {selected && (
          <div className="glass rounded-3xl p-5 border border-border-subtle mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{selected.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span><PriceDisplay price={selected.price} priceType={selected.price_type} /></span>
                    <span>{selected.city_name || selected.province_name}</span>
                    <span>{formatRelativeTime(selected.published_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-surface-2 rounded-xl p-1">
                {(['7d', '30d', '90d'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-3 py-1 rounded-lg text-[11px] font-medium transition-all',
                      period === p ? 'bg-primary/15 text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {p === '7d' ? '۷ روز' : p === '30d' ? '۳۰ روز' : '۹۰ روز'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatChartCard title="بازدید کل" value={totalViews.toLocaleString('fa-IR')} trend={15} chartData={views} color="var(--color-accent-blue)" />
          <StatChartCard title="پیام دریافتی" value={msgs.reduce((a, b) => a + b, 0).toLocaleString('fa-IR')} trend={8} chartData={msgs} color="var(--color-success)" />
          <StatChartCard title="نرخ تبدیل" value={`${convRate}%`} trend={-2} color="var(--color-warning)" />
          <StatChartCard title="میانگین روزانه" value={Math.round(totalViews / (period === '7d' ? 7 : period === '30d' ? 30 : 90)).toLocaleString('fa-IR')} color="var(--color-accent-indigo)" />
        </div>

        {/* Views chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 glass rounded-3xl p-6 border border-border-subtle">
            <h3 className="text-sm font-bold text-foreground mb-4">روند بازدید</h3>
            <div className="h-44 flex items-end gap-1.5">
              {views.map((v, i) => {
                const max = Math.max(...views);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-sm transition-all"
                      style={{ height: `${(v / max) * 100}%`, background: i === views.length - 1 ? 'var(--color-accent-blue)' : 'color-mix(in srgb, var(--color-accent-blue) 30%, transparent)' }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
              <span>بیشترین: {Math.max(...views).toLocaleString('fa-IR')}</span>
              <span>کمترین: {Math.min(...views).toLocaleString('fa-IR')}</span>
            </div>
          </div>

          {/* Conversion breakdown */}
          <div className="glass rounded-3xl p-6 border border-border-subtle">
            <h3 className="text-sm font-bold text-foreground mb-4">تجزیه و تحلیل</h3>
            <div className="space-y-4">
              {[
                { label: 'نرخ کلیک', value: '۱۲٪', desc: 'از نمایش تا کلیک' },
                { label: 'نرخ پاسخگویی', value: '۸۵٪', desc: 'پیام‌های پاسخ داده شده' },
                { label: 'مدت زمان پاسخ', value: '۱.۵ ساعت', desc: 'میانگین زمان پاسخ' },
                { label: 'ذخیره در علاقه‌مندی', value: '۳۴ بار', desc: 'تعداد کل ذخیره‌ها' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="glass rounded-3xl p-5 border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" /><path d="M20 12v2a8 8 0 0 1-16 0v-2" /></svg>
            <h4 className="text-sm font-bold text-foreground">بینش هوشمند</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            آگهی <strong className="text-foreground">{selected?.title}</strong> نسبت به آگهی‌های مشابه <strong className="text-success">۲۵٪ بازدید بیشتر</strong> داشته. بهترین زمان انتشار برای این دسته‌بندی <strong className="text-primary">ساعت ۱۰ تا ۱۴</strong> بوده. پیشنهاد می‌کنیم برای افزایش بازدید، تصاویر جدید آپلود کنید.
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
