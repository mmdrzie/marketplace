'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { FEATURES } from '@/lib/features';
import { notFound } from 'next/navigation';
import { ImportedBadge } from '@/components/imported/ImportedBadge';
import { PriceHistoryChart } from '@/components/common/Charts';
import { generateImportPriceTrend } from '@/lib/importChartData';
import { cn } from '@/lib/utils';

const TABS = [
  { slug: 'all', name: 'همه' },
  { slug: 'imported-suv', name: 'SUV' },
  { slug: 'imported-sedan', name: 'سواری' },
  { slug: 'imported-coupe', name: 'کوپه و اسپرت' },
  { slug: 'imported-truck', name: 'کامیون' },
  { slug: 'imported-pickup', name: 'وانت' },
  { slug: 'imported-motorcycle', name: 'موتورسیکلت' },
];

const GUIDE_ITEMS = [
  { title: 'مراحل واردات', desc: 'از ثبت سفارش تا ترخیص کالا از گمرک', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { title: 'قوانین و مقررات', desc: 'آخرین بخش‌نامه‌های واردات خودرو', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { title: 'محاسبه هزینه', desc: 'ماشین حساب تعرفه، مالیات و عوارض', icon: 'M3 3v18h18M7 14l4-4 4 4 6-6', href: '/imported/customs-calc' },
  { title: 'مشاوره تخصصی', desc: 'ارتباط با کارشناسان واردات', icon: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
];

export default function ImportedPage() {
  if (!FEATURES.importedVehicles) notFound();
  const [tab, setTab] = useState('all');

  const { data: listingsData } = useQuery({
    queryKey: ['imported-listings'],
    queryFn: async () => { const res = await api.get('/listings', { params: { scope: 'imported' } }); return res.data.data as any[]; },
    retry: 2,
  });
  const allListings: any[] = listingsData ?? [];

  const filtered = useMemo(() => {
    if (tab === 'all') return allListings;
    return allListings.filter((l) => l.category?.slug === tab);
  }, [tab, allListings]);

  const chartData = useMemo(() => generateImportPriceTrend(), []);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-20 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            IMPORTED VEHICLES
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-4 leading-tight">
            وسایل نقلیه وارداتی
          </h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
            خرید و فروش خودرو، کامیون، موتورسیکلت و ماشین‌آلات راهسازی وارداتی — با اطلاعات گمرکی کامل و شناسایی کشور مبدأ
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { label: 'کشور مبدأ فعال', value: '۱۴', icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M3 14h18M3 17h18' },
            { label: 'آگهی فعال', value: allListings.length.toLocaleString('fa-IR'), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
            { label: 'میانگین قیمت', value: '۸۹۰ میلیون', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' },
            { label: 'بیشترین برند', value: 'آلمان', icon: 'M3 21h18M3 10h18M3 7l9-4 9 4' },
          ].map((s) => (
            <div key={s.label} className="glass rounded-2xl p-5 border border-border-subtle text-center shadow-sm">
              <svg className="h-6 w-6 mx-auto text-primary mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={s.icon} />
              </svg>
              <p className="text-2xl font-bold text-foreground tracking-tighter">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-dropdown justify-center flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.slug}
              onClick={() => setTab(t.slug)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all shrink-0',
                tab === t.slug ? 'bg-primary text-primary-foreground border-transparent shadow-sm' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Listing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {(filtered as any[]).map((l: any, i: number) => {
            const countryAttr = (l.attributes as any[])?.find((a: any) => a.attribute_id === 201);
            const customsAttr = (l.attributes as any[])?.find((a: any) => a.attribute_id === 203);
            return (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/imported/${l.slug}`} className="block group h-full">
                  <div className="bg-surface/40 border border-border rounded-3xl p-6 hover:border-primary/40 hover:bg-surface hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="w-full aspect-video bg-surface-2/50 border border-border-subtle rounded-2xl flex items-center justify-center overflow-hidden mb-4">
                      <svg className="h-12 w-12 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="14" rx="2" /><path d="M21 17v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <ImportedBadge country={countryAttr?.value || null} customsStatus={customsAttr?.value || null} size="sm" />
                      {l.is_featured && (
                        <span className="text-[9px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20">VIP</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">{l.title}</h3>
                    <p className="text-[11px] text-muted-foreground mb-4 font-light">{l.province} — {l.city}</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-subtle">
                      <span className="text-base font-bold text-foreground tracking-tighter">{typeof l.price === 'number' ? l.price.toLocaleString('fa-IR') : '—'}<span className="text-[10px] text-muted-foreground font-normal mr-1">تومان</span></span>
                      <span className="text-[10px] text-muted-foreground">{l.views?.toLocaleString('fa-IR')} بازدید</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="pt-8">
          <PriceHistoryChart data={chartData} className="glass rounded-3xl border border-border-subtle shadow-sm" />
        </div>

        {/* Guide */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground mb-2">راهنمای واردات</h2>
            <p className="text-sm text-muted-foreground font-light">هرآنچه برای واردات خودرو باید بدانید</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GUIDE_ITEMS.map((g) => (
              <Link
                key={g.title}
                href={(g as { href?: string }).href || '#'}
                className={`group glass rounded-3xl p-6 border border-border-subtle hover:border-primary/40 hover:bg-surface transition-all duration-300 h-full ${(g as { href?: string }).href ? '' : 'cursor-default'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={g.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-light">{g.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Link to charts */}
        <div className="text-center pt-4">
          <Link
            href="/imported/charts"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 14l4-4 4 4 6-6" />
            </svg>
            داشبورد نمودارهای بازار واردات
          </Link>
        </div>
      </div>
    </div>
  );
}