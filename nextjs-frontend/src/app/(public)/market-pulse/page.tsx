'use client';

import { useState, useRef } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { StatChartCard, MiniSparkline, ModernLineChart, ModernBarChart } from '@/components/common/Charts';
import { cn } from '@/lib/utils';
import { generatePriceSeries, generateVolumeSeries } from '@/lib/chartData';

const CATEGORY_ICONS: Record<string, { icon: string; viewBox?: string }> = {
  car: { icon: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2m10 0v-5m-10 5v-5m-4 0h18M7 17a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z" },
  truck: { icon: "M10 17h4V5H2v12h3m10 0v-5h4l3 3v2h-3m-10 0a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" },
  pickup: { icon: "M20 8h-3V4H3v12h2m13 0h2v-5l-2-2h-3l-2-2H8 M7 17a2 2 0 11-4 0 2 2 0 014 0z M19 17a2 2 0 11-4 0 2 2 0 014 0z" },
  motorcycle: { icon: "M3 14a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zm-7-3l3-5h4l2 3m-7 4h6" },
  tractor: { icon: "M3 4h9v7H3zM12 11h4l3 3v3h-7zM6 18a2 2 0 100-4 2 2 0 000 4zm10 0a3 3 0 100-6 3 3 0 000 6z" },
  excavator: { icon: "M2 20h20M4 20V8h12v12M16 20v-6h4v6M8 12h4M8 16h4 M3 12l4-4 5 5-4 4z" },
};

const CATEGORIES = [
  { slug: 'car', name: 'خودرو', color: 'var(--color-primary)' },
  { slug: 'truck', name: 'کامیون', color: 'var(--color-warning)' },
  { slug: 'pickup', name: 'وانت', color: 'var(--color-success)' },
  { slug: 'motorcycle', name: 'موتورسیکلت', color: 'var(--color-primary)' },
  { slug: 'tractor', name: 'تراکتور', color: 'var(--color-destructive)' },
  { slug: 'excavator', name: 'بیل مکانیکی', color: 'var(--color-warning)' },
];

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const BASE_PRICES: Record<string, number> = {
  car: 420, truck: 1850, pickup: 280, motorcycle: 65, tractor: 780, excavator: 3200,
};

const BASE_VOLUMES: Record<string, number> = {
  car: 180, truck: 45, pickup: 90, motorcycle: 120, tractor: 30, excavator: 18,
};

function formatPrice(v: number) {
  return (v * 1000000).toLocaleString('fa-IR');
}

export default function MarketPulsePage() {
  const [active, setActive] = useState('car');
  const [marketData, setMarketData] = useState<Record<string, { prices: number[]; volumes: number[]; avg: number; total: number; change: number }>>({});
  const initializedRef = useRef<boolean | null>(null);

  if (initializedRef.current == null) {
    initializedRef.current = true;
    const result: Record<string, { prices: number[]; volumes: number[]; avg: number; total: number; change: number }> = {};
    for (const slug of CATEGORIES.map((c) => c.slug)) {
      const baseP = BASE_PRICES[slug] || 500;
      const baseV = BASE_VOLUMES[slug] || 50;
      const prices = generatePriceSeries(baseP, 12, { volatility: 0.07, trend: 0.03 });
      const volumes = generateVolumeSeries(baseV, 12, { volatility: 0.18, seasonality: true });
      const avg = prices[prices.length - 1];
      const total = volumes.reduce((a, b) => a + b, 0);
      const change = Math.round(((prices[11] - prices[0]) / prices[0]) * 100 * 10) / 10;
      result[slug] = { prices, volumes, avg, total, change };
    }
    setMarketData(result);
  }

  const data = marketData[active];
  const cat = CATEGORIES.find((c) => c.slug === active)!;

  if (!data) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="follow-the-leader text-primary"><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
          <Breadcrumbs />

          <div className="mb-8 mt-4">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              MARKET PULSE
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">بازار یاب</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light mt-2 max-w-xl">نمودار و آمار لحظه‌ای بازار خودرو و ماشین‌آلات — روند قیمت‌ها و حجم معاملات</p>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-dropdown">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all shrink-0',
                  active === c.slug
                    ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                    : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50',
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d={CATEGORY_ICONS[c.slug]?.icon || ''} /></svg>
                <span>{c.name}</span>
              </button>
            ))}
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatChartCard title="میانگین قیمت" value={formatPrice(data.avg)} trend={data.change} chartData={data.prices} color={cat.color} />
            <StatChartCard title="تعداد آگهی" value={data.total.toLocaleString('fa-IR')} chartData={data.volumes} color={cat.color} />
            <StatChartCard title="بیشترین قیمت" value={formatPrice(Math.max(...data.prices))} chartData={data.prices.slice(-3)} color={cat.color} />
            <StatChartCard title="کمترین قیمت" value={formatPrice(Math.min(...data.prices))} chartData={data.prices.slice(0, 3)} color={cat.color} />
          </div>

          {/* Main chart area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Modern Line Chart */}
            <div className="lg:col-span-2 bg-surface/40 border border-border rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  روند قیمت {cat.name}
                </h3>
                <span className="text-[11px] text-muted-foreground">آخرین ۱۲ ماه</span>
              </div>
              <ModernLineChart data={data.prices} labels={MONTHS.map(m => m.slice(0, 4))} color={cat.color} height={260} />
            </div>

            {/* Modern Bar Chart */}
            <div className="bg-surface/40 border border-border rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-foreground mb-6 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                حجم آگهی‌ها
              </h3>
              <ModernBarChart data={data.volumes} labels={MONTHS.map(m => m.slice(0, 3))} color={cat.color} height={260} />
              <p className="text-[11px] text-muted-foreground mt-4 text-center">
                بیشترین آگهی: {Math.max(...data.volumes)} — در {MONTHS[data.volumes.indexOf(Math.max(...data.volumes))]}
              </p>
            </div>
          </div>

          {/* Category overview cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((c) => {
              const d = marketData[c.slug];
              return (
                <button
                  key={c.slug}
                  onClick={() => setActive(c.slug)}
                  className={cn(
                    'bg-surface/40 border border-border rounded-2xl p-4 text-center transition-all text-left backdrop-blur-sm',
                    active === c.slug ? 'ring-1 ring-primary/30 border-primary/30' : 'hover:border-primary/40 hover:bg-surface',
                  )}
                >
                  <div className="w-10 h-10 mb-2 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d={CATEGORY_ICONS[c.slug]?.icon || ''} /></svg>
                  </div>
                  <p className="text-xs font-bold text-foreground">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">میانگین</p>
                  <p className="text-sm font-black text-foreground">{(d.avg * 1000000).toLocaleString('fa-IR').slice(0, 8)}</p>
                  <div className="mt-2 h-6">
                    <MiniSparkline data={d.prices} color={c.color} height={24} />
                  </div>
                  <span className={cn('text-[10px] font-bold mt-1 block', d.change >= 0 ? 'text-success' : 'text-destructive')}>
                    {d.change > 0 ? '+' : ''}{d.change}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}