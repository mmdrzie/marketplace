'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn, StaggerItem } from '@/components/common/MotionDiv';
import { SlideUp, StaggerContainer } from '@/components/common/MotionDiv.client';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const CAR_TYPES = ['سدان', 'شاسی‌بلند', 'هیبریدی', 'کامپکت', 'اسپرت'];
const FUEL_TYPES = ['بنزینی', 'دیزلی', 'گازسوز', 'برقی'];

interface Recommendation {
  name: string;
  reason: string;
  priceRange: string;
  match: number;
  bestFor: string;
}

// آیکون ماشین مینیمال
const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-3c-.3-.4-.8-.6-1.3-.6H8.5c-.5 0-1 .2-1.3.6L5 10l-2.5 1.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

function getRecommendations(budget: number, type: string, fuel: string, priority: string): Recommendation[] {
  const all: Recommendation[] = [
    { name: 'پراید ۱۳۱', reason: 'ارزان، قطعات فراوان، مصرف سوخت کم', priceRange: '۱۵۰-۲۰۰ میلیون', match: 0, bestFor: 'اولین ماشین' },
    { name: 'پژو ۲۰۶ تیپ ۲', reason: 'شاسی محکم، سواری نرم، بازار فروش خوب', priceRange: '۳۰۰-۴۵۰ میلیون', match: 0, bestFor: 'خانواده کوچک' },
    { name: 'سمند ال‌ایکس', reason: 'ارزان‌ترین سدان خانوادگی، فضای جادار', priceRange: '۲۵۰-۳۵۰ میلیون', match: 0, bestFor: 'خانواده' },
    { name: 'هایما S5', reason: 'شاسی‌بلند محبوب، کابین مدرن', priceRange: '۸۰۰-۱۱۰۰ میلیون', match: 0, bestFor: 'سبک زندگی مدرن' },
    { name: 'دنا پلاس', reason: 'پیشرانه قدرتمند، امکانات رفاهی کامل', priceRange: '۵۰۰-۷۵۰ میلیون', match: 0, bestFor: 'علاقه‌مندان به قدرت' },
    { name: 'تیبا صندوقدار', reason: 'اقتصادی، کم استهلاک، ارزان', priceRange: '۱۷۰-۲۳۰ میلیون', match: 0, bestFor: 'سفرهای روزانه' },
    { name: 'شاهین G', reason: 'مدرن‌ترین سدان داخلی، ایمنی بالا', priceRange: '۵۵۰-۷۰۰ میلیون', match: 0, bestFor: 'خانواده مدرن' },
    { name: 'کوییک R', reason: 'ارزان‌ترین شاسی‌بلند، اقتصادی', priceRange: '۲۵۰-۳۴۰ میلیون', match: 0, bestFor: 'بودجه محدود' },
    { name: 'نیسان تیانا', reason: 'سدان لوکس، سکوت کابین، راحتی', priceRange: '۱۲۰۰-۱۸۰۰ میلیون', match: 0, bestFor: 'لوکس اقتصادی' },
    { name: 'کیا اپتیما', reason: 'طراحی زیبا، امکانات عالی', priceRange: '۱۵۰۰-۲۵۰۰ میلیون', match: 0, bestFor: 'جوانان' },
  ];

  return all.map((car) => {
    let score = 0;
    if (budget <= 300 && car.priceRange.includes('۱۵۰')) score += 40;
    else if (budget <= 500 && (car.priceRange.includes('۳۰۰') || car.priceRange.includes('۲۵۰') || car.priceRange.includes('۱۷۰'))) score += 30;
    else if (budget <= 800 && (car.priceRange.includes('۵۰۰') || car.priceRange.includes('۵۵۰'))) score += 35;
    else if (budget <= 1500 && (car.priceRange.includes('۸۰۰') || car.priceRange.includes('۱۲۰۰'))) score += 30;
    else if (budget > 1500 && (car.priceRange.includes('۱۵۰۰') || car.priceRange.includes('۱۲۰۰'))) score += 30;
    else score += 10;

    if (type === 'همه' || car.bestFor.includes(type)) score += 20;
    if (priority === 'اقتصاد' && (car.reason.includes('اقتصاد') || car.reason.includes('ارزان'))) score += 20;
    if (priority === 'لوکس' && (car.reason.includes('لوکس') || car.reason.includes('مدرن'))) score += 20;
    if (priority === 'خانواده' && car.bestFor.includes('خانواده')) score += 20;
    if (priority === 'قدرت' && (car.reason.includes('قدرت') || car.reason.includes('پیشرانه'))) score += 20;

    return { ...car, match: Math.min(Math.round(score + Math.random() * 10), 98) };
  }).sort((a, b) => b.match - a.match).slice(0, 4);
}

function formatBudget(v: number) { return v.toLocaleString('fa-IR') + ' میلیون'; }

export default function CarMatchmakerPage() {
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(300);
  const [type, setType] = useState('همه');
  const [fuel, setFuel] = useState('همه');
  const [priority, setPriority] = useState('اقتصاد');
  const [results, setResults] = useState<Recommendation[]>([]);

  const handleMatch = () => {
    setResults(getRecommendations(budget, type, fuel, priority));
    setStep(2);
  };

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 py-12 md:py-16">
          <Breadcrumbs />

          <div className="mb-10 mt-4">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
              CAR FINDER
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">مشاور خرید خودرو</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light mt-2 max-w-xl">بگو چقدر بودجه داری و چی می‌خوای تا بهترین ماشین‌ها رو بهت پیشنهاد بدم</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="f1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <SlideUp>
                  <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle">
                    {/* Budget */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">بودجه</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-foreground tracking-tighter">{budget.toLocaleString('fa-IR')}</span>
                          <span className="text-[10px] text-muted-foreground">میلیون تومان</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">۵۰</span>
                        <input
                          type="range" min={50} max={5000} step={10}
                          value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-surface-2 accent-primary
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                            [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer"
                        />
                        <span className="text-[10px] text-muted-foreground">۵۰۰۰</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {[100, 300, 500, 800, 1500, 3000].map((v) => (
                          <button
                            key={v}
                            onClick={() => setBudget(v)}
                            className={cn(
                              'flex-1 py-1.5 rounded-full text-[10px] font-medium border transition-all',
                              budget === v ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:bg-surface-2'
                            )}
                          >
                            {v.toLocaleString('fa-IR')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type */}
                    <div className="mb-8">
                      <label className="text-[11px] text-muted-foreground mb-3 block uppercase tracking-wider font-medium">نوع خودرو</label>
                      <div className="flex flex-wrap gap-2">
                        {['همه', ...CAR_TYPES].map((t) => (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={cn(
                              'px-4 py-2 rounded-full text-xs font-medium border transition-all',
                              type === t ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fuel */}
                    <div className="mb-8">
                      <label className="text-[11px] text-muted-foreground mb-3 block uppercase tracking-wider font-medium">سوخت</label>
                      <div className="flex flex-wrap gap-2">
                        {['همه', ...FUEL_TYPES].map((f) => (
                          <button
                            key={f}
                            onClick={() => setFuel(f)}
                            className={cn(
                              'px-4 py-2 rounded-full text-xs font-medium border transition-all',
                              fuel === f ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2'
                            )}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="mb-8">
                      <label className="text-[11px] text-muted-foreground mb-3 block uppercase tracking-wider font-medium">اولویت اصلی</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'اقتصاد', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>, desc: 'مقرون به صرفه' },
                          { id: 'خانواده', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>, desc: 'فضا و ایمنی' },
                          { id: 'قدرت', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /><path d="M19 17h-2M7 17H5M3 11l2-4h12l3 4v4h-2" /></svg>, desc: 'پیشرانه قوی' },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPriority(p.id)}
                            className={cn(
                              'p-4 rounded-2xl border text-center transition-all',
                              priority === p.id ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface/40 border-border text-muted-foreground hover:text-foreground hover:bg-surface-2'
                            )}
                          >
                            <div className="mb-2 flex justify-center">{p.icon}</div>
                            <div className="text-xs font-bold">{p.id}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{p.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleMatch} className="w-full btn btn-primary text-sm rounded-xl py-3">
                      پیدا کردن ماشین مناسب من
                    </button>
                  </div>
                </SlideUp>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="f2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <SlideUp>
                  <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle mb-8 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground tracking-tight">بهترین گزینه‌ها برای تو</h2>
                          <p className="text-xs text-muted-foreground font-light">براساس بودجه {formatBudget(budget)}، نوع {type} و اولویت {priority}</p>
                        </div>
                      </div>
                      <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        ویرایش
                      </button>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                      {results.map((car) => (
                        <StaggerItem key={car.name}>
                          <div className="bg-surface/40 border border-border rounded-2xl p-5 hover:border-primary/30 transition-all h-full">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                                  <CarIcon />
                                </div>
                                <div>
                                  <h3 className="text-sm font-bold text-foreground">{car.name}</h3>
                                  <p className="text-[11px] text-muted-foreground">{car.priceRange}</p>
                                </div>
                              </div>
                              <div className="text-left shrink-0">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${car.match}%` }} />
                                  </div>
                                  <span className="text-[10px] font-bold text-primary">{car.match}%</span>
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-0.5">میزان تطابق</p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-light">{car.reason}</p>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-subtle">
                              <span className="text-[11px] text-muted-foreground">
                                <span className="font-medium text-foreground">مناسب برای: </span>{car.bestFor}
                              </span>
                              <Link
                                href={`/search?q=${encodeURIComponent(car.name)}`}
                                className="text-[11px] font-bold text-primary transition-colors"
                              >
                                دیدن آگهی‌ها ←
                              </Link>
                            </div>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>

                  <button onClick={() => setStep(1)} className="text-xs text-muted-foreground hover:text-foreground mx-auto block transition-colors">
                    شروع مجدد با اطلاعات جدید
                  </button>
                </SlideUp>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FadeIn>
  );
}