'use client';

import { useState, useMemo } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn, SlideUp } from '@/components/common/MotionDiv';
import { ModernLineChart } from '@/components/common/Charts';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const BRANDS: Record<string, string[]> = {
  'خودرو': ['پراید', 'پژو', 'سمند', 'رانا', 'دنا', 'تیبا', 'ساینا', 'کوییک', 'شاهین', 'اطلس', 'هایما', 'کیا', 'هیوندای', 'تویوتا', 'نیسان', 'ب ام و', 'مرسدس', 'آئودی'],
  'کامیون': ['بنز', 'اسکانیا', 'ولوو', 'مان', 'ایویکو', 'فوتون', 'هوو'],
  'وانت': ['نیسان', 'کاپرا', 'فوتون', 'ایسوزو'],
  'موتورسیکلت': ['هوندا', 'یاماها', 'کاوازاکی', 'سوزوکی', 'باجاج', 'ویسپا'],
};

const CONDITION = ['عالی', 'خیلی خوب', 'خوب', 'متوسط', 'نیاز به تعمیر'];

interface FormData {
  category: string;
  brand: string;
  year: number;
  mileage: number;
  condition: string;
  hasServiceHistory: boolean;
  isPainted: boolean;
}

const CURRENT_YEAR = 1405;
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];

function estimatePrice(data: FormData): number {
  let base = 0;
  const basePrices: Record<string, number> = {
    'پراید': 200, 'پژو': 350, 'سمند': 320, 'رانا': 380, 'دنا': 550,
    'تیبا': 180, 'ساینا': 220, 'کوییک': 250, 'شاهین': 600, 'اطلس': 400,
    'هایما': 900, 'کیا': 1200, 'هیوندای': 1500, 'تویوتا': 2000,
    'نیسان': 280, 'ب ام و': 3000, 'مرسدس': 4000, 'آئودی': 3500,
    'بنز': 2500, 'اسکانیا': 3500, 'ولوو': 3000, 'مان': 2800,
    'هوندا': 80, 'یاماها': 120, 'سوزوکی': 60, 'باجاج': 90,
    'کاپرا': 250, 'فوتون': 350, 'ایسوزو': 400,
  };
  base = basePrices[data.brand] || 300;
  const age = CURRENT_YEAR - data.year;
  const yearFactor = Math.max(0.3, 1 - age * 0.06);
  const mileageFactor = Math.max(0.4, 1 - (data.mileage / 200000) * 0.6);
  const condFactors: Record<string, number> = { 'عالی': 1.15, 'خیلی خوب': 1.05, 'خوب': 1, 'متوسط': 0.85, 'نیاز به تعمیر': 0.6 };
  const condFactor = condFactors[data.condition] || 1;
  let price = base * yearFactor * mileageFactor * condFactor;
  if (data.hasServiceHistory) price *= 1.05;
  if (data.isPainted) price *= 0.92;
  return Math.round(price);
}

function format(v: number) { return (v * 1000000).toLocaleString('fa-IR'); }
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export default function PriceEstimatorPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    category: '', brand: '', year: CURRENT_YEAR - 3, mileage: 50000,
    condition: 'خوب', hasServiceHistory: true, isPainted: false,
  });
  const [estimate, setEstimate] = useState<number | null>(null);

  const update = (patch: Partial<FormData>) => setForm((prev) => ({ ...prev, ...patch }));

  const handleEstimate = () => {
    const result = estimatePrice(form);
    setEstimate(result);
    setStep(3);
  };

  const years = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - i);

  const lowEstimate = estimate ? Math.round(estimate * 0.9) : 0;
  const highEstimate = estimate ? Math.round(estimate * 1.1) : 0;
  
  const trendData = useMemo(() => {
    if (!estimate) return [];
    return Array.from({ length: 6 }, (_, i) => estimate - i * 5 + Math.floor((seededRandom(estimate + i * 137) * 2 - 1) * 10));
  }, [estimate]);

  const factors = estimate ? [
    { label: 'سن خودرو', desc: `${CURRENT_YEAR - form.year} سال`, impact: -((CURRENT_YEAR - form.year) * 6) },
    { label: 'کارکرد', desc: `${form.mileage.toLocaleString('fa-IR')} km`, impact: -Math.round((form.mileage / 200000) * 60) },
    { label: 'وضعیت بدنه', desc: form.condition, impact: form.condition === 'عالی' ? 15 : form.condition === 'خیلی خوب' ? 5 : form.condition === 'متوسط' ? -15 : -40 },
    { label: 'سرویس دوره‌ای', desc: form.hasServiceHistory ? 'دارد' : 'ندارد', impact: form.hasServiceHistory ? 5 : -5 },
    { label: 'رنگ شدگی', desc: form.isPainted ? 'دارد' : 'ندارد', impact: form.isPainted ? -8 : 0 },
  ] : [];
  const maxImpact = Math.max(...factors.map(f => Math.abs(f.impact)), 1);

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 py-12 md:py-16">
          <Breadcrumbs />

          <div className="mb-12 mt-4">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              PRICE ESTIMATOR PRO
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">موتور برآورد قیمت</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light mt-2 max-w-xl">تحلیل هوشمند محدوده قیمت بر اساس هزاران آگهی فعال و وضعیت بازار</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-16">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all shadow-sm',
                  step === s ? 'bg-primary text-primary-foreground border-transparent' :
                  step > s ? 'bg-success/10 border-success/30 text-success' :
                  'bg-surface/40 border-border text-muted-foreground'
                )}>
                  {step > s ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : s}
                </div>
                <span className={cn('text-xs', step === s ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                  {s === 1 ? 'مدل' : s === 2 ? 'مشخصات' : 'تحلیل'}
                </span>
                {s < 3 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select brand */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SlideUp>
                  <div className="glass rounded-3xl p-8 md:p-10 border border-border-subtle shadow-xl">
                    <h2 className="text-lg font-bold text-foreground mb-2 tracking-tight">برند ماشینتو انتخاب کن</h2>
                    <p className="text-xs text-muted-foreground mb-8 font-light">بعداً می‌تونیم سال و کارکرد رو هم بپرسیم</p>

                    <div className="flex items-center gap-3 mb-8 overflow-x-auto scrollbar-dropdown pb-2">
                      {Object.keys(BRANDS).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => update({ category: cat, brand: '' })}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium border transition-all shrink-0',
                            form.category === cat ? 'bg-primary text-primary-foreground border-transparent shadow-sm' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50'
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {form.category && (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {BRANDS[form.category].map((b) => (
                          <button
                            key={b}
                            onClick={() => update({ brand: b })}
                            className={cn(
                              'px-3 py-3 rounded-xl text-xs font-medium border transition-all',
                              form.brand === b ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-2/50 border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                            )}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end mt-10">
                      <button onClick={() => setStep(2)} disabled={!form.brand} className="btn btn-primary text-sm rounded-xl disabled:opacity-40">
                        ادامه
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    </div>
                  </div>
                </SlideUp>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SlideUp>
                  <div className="glass rounded-3xl p-8 md:p-10 border border-border-subtle shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3.8c0-.5-.3-.9-.8-1L17 10l-2.7-3.6A2 2 0 0 0 12.5 6H5.2c-.8 0-1.5.5-1.8 1.2L2 10.8c-.1.3-.2.7-.2 1V16c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2.5" /><circle cx="17" cy="17" r="2.5" /></svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground tracking-tight">{form.brand}</h2>
                        <p className="text-xs text-muted-foreground font-light">جزئیات ماشینت رو وارد کن</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-3 block uppercase tracking-wider">سال ساخت</label>
                        <select value={form.year} onChange={(e) => update({ year: Number(e.target.value) })} className="w-full bg-surface-2/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-colors">
                          {years.map((y) => (<option key={y} value={y}>{y}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground mb-3 block uppercase tracking-wider">کارکرد (کیلومتر)</label>
                        <input type="number" value={form.mileage} onChange={(e) => update({ mileage: Number(e.target.value) })} className="w-full bg-surface-2/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition-colors" min={0} max={500000} />
                        <input type="range" min={0} max={300000} step={5000} value={form.mileage} onChange={(e) => update({ mileage: Number(e.target.value) })} className="w-full h-1.5 mt-4 rounded-full appearance-none cursor-pointer bg-surface-2 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[11px] text-muted-foreground mb-3 block uppercase tracking-wider">وضعیت بدنه و موتور</label>
                        <div className="flex flex-wrap gap-3">
                          {CONDITION.map((c) => (
                            <button key={c} onClick={() => update({ condition: c })} className={cn('px-4 py-2 rounded-full text-xs font-medium border transition-all', form.condition === c ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2/50')}>{c}</button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-surface-2/30 border border-border-subtle hover:bg-surface-2/50 transition-colors">
                          <input type="checkbox" checked={form.hasServiceHistory} onChange={(e) => update({ hasServiceHistory: e.target.checked })} className="w-4 h-4 rounded border-border bg-surface-2 accent-primary" />
                          <span className="text-xs text-foreground">سرویس دوره‌ای منظم داشته</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-surface-2/30 border border-border-subtle hover:bg-surface-2/50 transition-colors">
                          <input type="checkbox" checked={form.isPainted} onChange={(e) => update({ isPainted: e.target.checked })} className="w-4 h-4 rounded border-border bg-surface-2 accent-primary" />
                          <span className="text-xs text-foreground">رنگ شدگی داشته</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-10">
                      <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← مرحله قبل</button>
                      <button onClick={handleEstimate} className="btn btn-primary text-sm rounded-xl">محاسبه قیمت</button>
                    </div>
                  </div>
                </SlideUp>
              </motion.div>
            )}

            {/* Step 3: Advanced Analytics Results (Corrected Spacing on SlideUp) */}
            {step === 3 && estimate !== null && (
              <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {/* فاصله‌گذاری عمودی دقیقاً روی این کلاس اعمال شده است */}
                <SlideUp className="space-y-16 md:space-y-20">
                  
                  {/* 1. Price Range Card */}
                  <div className="glass rounded-3xl p-8 md:p-10 border border-border-subtle shadow-xl overflow-hidden">
                    <div className="flex items-center gap-3 mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground tracking-tight">گزارش تحلیل قیمت {form.brand}</h2>
                        <p className="text-xs text-muted-foreground font-light">براساس داده‌های بازار و الگوریتم‌های پیش‌بینی</p>
                      </div>
                    </div>

                    <div className="py-6">
                      <div className="flex justify-between items-end mb-4">
                        <div className="text-center w-1/3">
                          <p className="text-[10px] text-warning uppercase tracking-wider mb-1">حداقل قیمت</p>
                          <p className="text-lg font-bold text-warning">{format(lowEstimate)}</p>
                        </div>
                        <div className="text-center w-1/3">
                          <p className="text-[10px] text-primary uppercase tracking-wider mb-1">قیمت منصفانه</p>
                          <p className="text-3xl font-bold text-primary">{format(estimate)}</p>
                        </div>
                        <div className="text-center w-1/3">
                          <p className="text-[10px] text-success uppercase tracking-wider mb-1">حداکثر قیمت</p>
                          <p className="text-lg font-bold text-success">{format(highEstimate)}</p>
                        </div>
                      </div>

                      <div className="relative h-2 bg-surface-2 rounded-full overflow-hidden border border-border-subtle">
                        <div className="absolute inset-y-0 right-[10%] left-[10%] bg-gradient-to-l from-success/40 via-primary/50 to-warning/40 rounded-full"></div>
                        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 translate-x-1/2 w-1 h-4 bg-warning rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-5 bg-primary rounded-full shadow-[0_0_8px_var(--color-primary)]"></div>
                        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 -translate-x-1/2 w-1 h-4 bg-success rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Grid for Analytics (فاصله افقی دقیقاً اینجا اعمال شده است) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-stretch">
                    
                    {/* Factor Analysis (Diverging Bars) */}
                    <div className="glass rounded-3xl p-8 md:p-10 border border-border-subtle shadow-xl overflow-hidden flex flex-col">
                      <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-4 bg-primary rounded-full"></span>
                        تحلیل عوامل مؤثر
                      </h3>
                      <p className="text-[11px] text-muted-foreground mb-10 font-light">تأثیر هر مشخصه بر قیمت نهایی خودرو</p>
                      
                      <div className="space-y-8 pt-2 flex-1">
                        {factors.map((f) => (
                          <div key={f.label} className="flex items-center gap-4">
                            <div className="w-24 text-left shrink-0">
                              <p className="text-[11px] text-foreground font-medium truncate">{f.label}</p>
                              <p className="text-[9px] text-muted-foreground truncate">{f.desc}</p>
                            </div>
                            <div className="flex-1 relative h-1.5 flex items-center justify-center bg-surface-2/40 rounded-full overflow-hidden min-w-0">
                              <div className="absolute top-0 bottom-0 w-px bg-border left-1/2 -translate-x-1/2 z-10"></div>
                              {f.impact < 0 && (
                                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 h-1.5 rounded-l-full bg-destructive/60" style={{width: `${(Math.abs(f.impact)/maxImpact)*50}%`}} />
                              )}
                              {f.impact >= 0 && (
                                <div className="absolute top-1/2 right-1/2 -translate-y-1/2 h-1.5 rounded-r-full bg-success/60" style={{width: `${(f.impact/maxImpact)*50}%`}} />
                              )}
                            </div>
                            <span className={cn('w-12 text-left text-[10px] font-bold shrink-0', f.impact >= 0 ? 'text-success' : 'text-destructive')}>
                              {f.impact > 0 ? '+' : ''}{f.impact}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Trend Chart (Real Chart Window) */}
                    <div className="glass rounded-3xl p-8 md:p-10 border border-border-subtle shadow-xl overflow-hidden flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                            روند بازار ۶ ماه گذشته
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-light mt-1">تغییرات قیمت این مدل در ماه‌های اخیر</p>
                        </div>
                        <span className={cn('text-xs font-medium px-2 py-1 rounded-full shrink-0', trendData[trendData.length-1] >= trendData[0] ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                          {trendData[trendData.length-1] >= trendData[0] ? 'صعودی' : 'نزولی'}
                        </span>
                      </div>

                      <div className="relative w-full h-48 min-w-0 mt-auto">
                        <ModernLineChart data={trendData} labels={MONTHS.map(m => m.slice(0, 4))} color="var(--color-primary)" height={192} />
                      </div>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4">
                    <button onClick={() => setStep(2)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      ← ویرایش اطلاعات
                    </button>
                    <button onClick={() => { setStep(1); setEstimate(null); }} className="btn btn-primary text-sm rounded-xl">
                      تحلیل ماشین جدید
                    </button>
                  </div>
                </SlideUp>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FadeIn>
  );
}