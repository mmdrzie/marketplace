'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FEATURES } from '@/lib/features';
import { StatChartCard, PriceHistoryChart, MiniDonut } from '@/components/common/Charts';
import { FuelChart } from '@/components/fleet/FuelChart';
import {
  generateImportPriceTrend,
  generateCountryShare,
  generateCustomsVolumeByMonth,
  generateSegmentDistribution,
  generateTopModels,
  generateImportForecast,
} from '@/lib/importChartData';
import { cn } from '@/lib/utils';

const BRANDS = ['BMW', 'Toyota', 'Mercedes', 'Hyundai', 'Porsche'];

export default function ImportedChartsPage() {
  if (!FEATURES.importedVehicles) notFound();
  const [brand, setBrand] = useState('BMW');

  const priceTrend = useMemo(() => generateImportPriceTrend(brand), [brand]);
  const countryShare = useMemo(() => generateCountryShare(), []);
  const customsVolumes = useMemo(() => generateCustomsVolumeByMonth(), []);
  const segments = useMemo(() => generateSegmentDistribution(), []);
  const topModels = useMemo(() => generateTopModels(10), []);
  const forecast = useMemo(() => generateImportForecast(), []);
  const totalVolume = useMemo(() => customsVolumes.reduce((s, m) => s + m.volume, 0), [customsVolumes]);
  const totalRevenue = useMemo(() => customsVolumes.reduce((s, m) => s + m.revenue, 0), [customsVolumes]);
  const avgPrice = useMemo(() => Math.round(topModels.reduce((s, m) => s + m.avgPrice, 0) / topModels.length), [topModels]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-20 space-y-16">
        <div className="mb-2">
          <Link href="/imported" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
            <svg className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            بازگشت به بازار واردات
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            IMPORT MARKET DASHBOARD
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground mb-4 leading-tight">
            داشبورد بازار واردات
          </h1>
          <p className="text-base text-muted-foreground font-light">تحلیل بازار خودروهای وارداتی — قیمت‌ها، حجم و پیش‌بینی</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatChartCard title="میانگین قیمت" value={`${avgPrice.toLocaleString('fa-IR')} $`} trend={7.2} chartData={[8, 9, 7, 10, 11, 9, 12, 14, 13, 15, 16, 18]} color="var(--color-primary)" />
          <StatChartCard title="حجم واردات (ماه)" value={(totalVolume / 12).toLocaleString('fa-IR')} trend={5.8} chartData={customsVolumes.map((m) => m.volume)} color="var(--color-primary)" />
          <StatChartCard title="تغییر سالانه" value="+۱۲.۴٪" trend={12.4} chartData={[5, 6, 7, 8, 9, 10, 11, 12]} color="var(--color-success)" />
          <StatChartCard title="برندهای فعال" value={`${BRANDS.length}+`} chartData={[3, 4, 5, 5, 6, 7, 7, 8]} color="var(--color-warning)" />
        </div>

        {/* Brand selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-dropdown flex-wrap justify-center">
          {BRANDS.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all shrink-0',
                brand === b ? 'bg-primary text-primary-foreground border-transparent shadow-sm' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50'
              )}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Price trend + Country share */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <PriceHistoryChart data={priceTrend} />
          </div>
          <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
            <h4 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              سهم کشورهای مبدأ
            </h4>
            <div className="grid grid-cols-2 gap-6">
              {countryShare.map((c) => (
                <div key={c.country} className="flex items-center gap-3">
                  <MiniDonut value={c.share} max={100} size={40} strokeWidth={4} color={c.color} label={`${c.share}%`} />
                  <div>
                    <p className="text-xs font-bold text-foreground">{c.country}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{c.volume.toLocaleString('fa-IR')} دستگاه</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customs volume + Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm overflow-hidden">
             <h4 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              حجم ترخیص گمرکی
            </h4>
            <FuelChart data={customsVolumes.map((m) => ({ month: m.month, consumption: m.volume, cost: m.revenue * 1000000 }))} />
          </div>
          <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
            <h4 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              تفکیک سگمنت
            </h4>
            <div className="flex flex-col gap-5">
              {segments.map((s) => (
                <div key={s.segment}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-foreground font-medium">{s.segment}</span>
                    <span className="text-muted-foreground">{s.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-2/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.percentage}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top models + Forecast */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
            <h4 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              ۱۰ مدل پرفروش وارداتی
            </h4>
            <div className="space-y-5">
              {topModels.map((m, i) => {
                const maxCount = Math.max(...topModels.map((t) => t.count));
                return (
                  <div key={m.model} className="flex items-center gap-4 text-xs">
                    <span className="w-5 text-center font-bold text-primary/70">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5">
                        <span className="font-bold text-foreground truncate">{m.model}</span>
                        <span className="text-muted-foreground shrink-0 mr-2">{m.count.toLocaleString('fa-IR')}</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-2/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${(m.count / maxCount) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-muted-foreground shrink-0 w-16 text-left">${m.avgPrice.toLocaleString('fa-IR')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
            <h4 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              پیش‌بینی ۵ ساله واردات
            </h4>
            <div className="space-y-6">
              {forecast.map((f) => {
                const maxUpper = Math.max(...forecast.map(x => x.upper));
                return (
                  <div key={f.year} className="text-xs">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-foreground">{f.year}</span>
                      <span className="text-muted-foreground">{f.volume.toLocaleString('fa-IR')} دستگاه</span>
                    </div>
                    <div className="relative w-full h-5 bg-surface-2/50 rounded-full overflow-hidden border border-border-subtle">
                      <div
                        className="absolute top-0 bottom-0 rounded-full bg-primary/40 transition-all duration-500"
                        style={{
                          left: `${(f.lower / maxUpper) * 100}%`,
                          width: `${((f.upper - f.lower) / maxUpper) * 100}%`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] text-foreground font-medium">
                        {f.lower.toLocaleString('fa-IR')} — {f.upper.toLocaleString('fa-IR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center pt-4">
          <Link
            href="/imported/customs-calc"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            ماشین حساب هزینه واردات
          </Link>
        </div>
      </div>
    </div>
  );
}