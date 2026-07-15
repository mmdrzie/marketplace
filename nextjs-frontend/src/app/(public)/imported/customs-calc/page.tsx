'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FEATURES } from '@/lib/features';
import { notFound } from 'next/navigation';
import { GlassSelect } from '@/components/common/GlassSelect';
import { StatChartCard } from '@/components/common/Charts';
import { ImportCostBreakdown } from '@/components/imported/ImportCostBreakdown';
import { IMPORT_COUNTRIES } from '@/types/imported';
import { cn } from '@/lib/utils';

const ENGINE_CC_OPTIONS = [
  { label: 'کمتر از ۱۰۰۰', value: 1000 },
  { label: '۱۰۰۰ تا ۱۵۰۰', value: 1500 },
  { label: '۱۵۰۰ تا ۲۰۰۰', value: 2000 },
  { label: '۲۰۰۰ تا ۲۵۰۰', value: 2500 },
  { label: '۲۵۰۰ تا ۳۰۰۰', value: 3000 },
  { label: 'بیشتر از ۳۰۰۰', value: 4000 },
];

const FUEL_TYPES = ['بنزین', 'گازوئیل', 'هیبرید', 'برقی'];

function calcDutyRate(cc: number, fuel: string, isNew: boolean): number {
  let rate = 0.40;
  if (cc > 2500) rate += 0.10;
  if (cc > 3000) rate += 0.15;
  if (fuel === 'گازوئیل') rate += 0.05;
  if (fuel === 'برقی') rate = 0.04;
  if (fuel === 'هیبرید') rate -= 0.05;
  if (!isNew) rate *= 0.85;
  return Math.max(0.04, rate);
}

export default function CustomsCalcPage() {
  if (!FEATURES.importedVehicles) notFound();
  const [form, setForm] = useState({
    country: 'آلمان',
    basePriceUSD: 30000,
    engineCC: 2000,
    fuelType: 'بنزین',
    isNew: true,
    importType: 'طرح نوین',
    exchangeRate: 68000,
  });

  const update = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const result = useMemo(() => {
    const { basePriceUSD, exchangeRate, engineCC, fuelType, isNew, importType } = form;
    const priceInRial = basePriceUSD * exchangeRate;
    const dutyRate = calcDutyRate(engineCC, fuelType, isNew);
    const customsDuty = Math.round(priceInRial * dutyRate);
    const vat = Math.round((priceInRial + customsDuty) * 0.10);
    const toll = Math.round(priceInRial * 0.04);
    const commercialProfit = Math.round(priceInRial * 0.20);
    const other = 30000000;
    const total = priceInRial + customsDuty + vat + toll + commercialProfit + other;
    const importTypeMultiplier = importType === 'منطقه آزاد' ? 0.7 : importType === 'شمال' ? 1.15 : 1;
    const adjustedTotal = Math.round(total * importTypeMultiplier);

    return {
      priceInRial,
      customsDuty: Math.round(customsDuty * importTypeMultiplier),
      vat: Math.round(vat * importTypeMultiplier),
      toll: Math.round(toll * importTypeMultiplier),
      commercialProfit: Math.round(commercialProfit * importTypeMultiplier),
      other,
      total: adjustedTotal,
      dutyRate,
      importTypeMultiplier,
    };
  }, [form]);

  const costItems = useMemo(() => [
    { label: 'قیمت پایه', amount: result.priceInRial, color: 'var(--color-primary)' },
    { label: 'تعرفه گمرکی', amount: result.customsDuty, color: 'var(--color-warning)' },
    { label: 'مالیات ارزش افزوده', amount: result.vat, color: 'var(--color-success)' },
    { label: 'عوارض', amount: result.toll, color: 'var(--color-destructive)' },
    { label: 'سود بازرگانی', amount: result.commercialProfit, color: 'var(--color-primary)' },
    { label: 'سایر هزینه‌ها', amount: result.other, color: 'var(--color-muted-foreground)' },
  ], [result]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto w-full px-4 py-12 md:py-20 space-y-16">
        <div className="mb-2">
          <Link href="/imported" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
            <svg className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            بازگشت به بازار واردات
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
            CUSTOMS CALCULATOR
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground mb-4 leading-tight">
            ماشین حساب هزینه واردات
          </h1>
          <p className="text-base text-muted-foreground font-light">محاسبه تقریبی تعرفه، مالیات و سایر هزینه‌های واردات خودروهای خارجی</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-start">
          {/* Form */}
          <div className="lg:col-span-3 glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm space-y-8">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              مشخصات خودرو
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">کشور مبدأ</label>
                <GlassSelect value={form.country} onChange={(v) => update({ country: v })} options={IMPORT_COUNTRIES.map((c: string) => ({ value: c, label: c }))} placeholder="کشور مبدأ" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">قیمت پایه (USD)</label>
                <input
                  type="number"
                  value={form.basePriceUSD}
                  onChange={(e) => update({ basePriceUSD: Math.max(1000, Number(e.target.value)) })}
                  className="w-full bg-surface-2/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">حجم موتور</label>
                <GlassSelect value={String(form.engineCC)} onChange={(v) => update({ engineCC: Number(v) })} options={ENGINE_CC_OPTIONS.map((o: { value: number; label: string }) => ({ value: String(o.value), label: o.label }))} placeholder="حجم موتور" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">نوع سوخت</label>
                <GlassSelect value={form.fuelType} onChange={(v) => update({ fuelType: v })} options={FUEL_TYPES.map((f: string) => ({ value: f, label: f }))} placeholder="نوع سوخت" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">وضعیت</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => update({ isNew: true })}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-full text-xs font-medium border transition-all',
                      form.isNew ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50'
                    )}
                  >
                    نو
                  </button>
                  <button
                    onClick={() => update({ isNew: false })}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-full text-xs font-medium border transition-all',
                      !form.isNew ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50'
                    )}
                  >
                    کارکرده
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">نوع واردات</label>
                <GlassSelect value={form.importType} onChange={(v) => update({ importType: v })} options={[
                  { value: 'طرح نوین', label: 'طرح نوین' },
                  { value: 'شمال', label: 'واردات شمال' },
                  { value: 'منطقه آزاد', label: 'منطقه آزاد' },
                ]} placeholder="نوع واردات" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground block uppercase tracking-wider font-medium">نرخ ارز (تومان / دلار)</label>
              <input
                type="number"
                value={form.exchangeRate}
                onChange={(e) => update({ exchangeRate: Math.max(10000, Number(e.target.value)) })}
                className="w-full bg-surface-2/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t border-border-subtle font-light">
              نرخ تعرفه گمرکی: <span className="font-bold text-foreground">{(result.dutyRate * 100).toFixed(0)}%</span>
              {form.importType !== 'طرح نوین' && (
                <span> · ضریب {form.importType}: <span className="font-bold text-foreground">{result.importTypeMultiplier}x</span></span>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="lg:col-span-2 space-y-8">
            <ImportCostBreakdown items={costItems} total={result.total} />

            <StatChartCard title="هزینه کل واردات" value={`${result.total.toLocaleString('fa-IR')} تومان`} className="glass rounded-3xl border border-border-subtle shadow-sm" />

            <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                جزئیات هزینه‌ها
              </h4>
              {costItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                  </div>
                  <span className="font-bold text-foreground text-xs">{item.amount.toLocaleString('fa-IR')} تومان</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}