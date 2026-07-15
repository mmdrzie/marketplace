'use client';

import { useState } from 'react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { GlassSelect } from '@/components/common/GlassSelect';
import { ModernLineChart } from '@/components/common/Charts';
import { cn } from '@/lib/utils';

interface CarSpec {
  name: string;
  year: string;
  engine: string;
  power: number;
  fuel: string;
  transmission: string;
  acceleration: number;
  consumption: number;
  length: number;
  width: number;
  weight: number;
  trunk: number;
  maintenance: number;
  price: string;
  pros: string[];
  cons: string[];
  rating: number;
  salesData: number[];
}

const CARS: Record<string, CarSpec> = {
  'پراید ۱۳۱': {
    name: 'پراید ۱۳۱', year: '۱۳۷۲-اکنون', engine: 'میلر M15', power: 69,
    fuel: 'بنزینی', transmission: 'دستی ۵ دنده', acceleration: 14, consumption: 6.5,
    length: 4115, width: 1622, weight: 990, trunk: 250, maintenance: 15,
    price: '۱۵۰-۲۰۰ میلیون',
    pros: ['قطعات فراوان', 'مصرف سوخت کم', 'قیمت مناسب', 'تعمیرات ارزان'],
    cons: ['ایمنی پایین', 'طراحی قدیمی', 'کمبود آپشن', 'استهلاک بالا'],
    rating: 65, salesData: [180, 195, 210, 190, 220, 240, 230, 250, 235, 260, 245, 280],
  },
  'پژو ۲۰۶': {
    name: 'پژو ۲۰۶', year: '۱۳۸۰-اکنون', engine: 'TU5', power: 88,
    fuel: 'بنزینی', transmission: 'دستی ۵ دنده / اتوماتیک', acceleration: 11.5, consumption: 7.2,
    length: 3835, width: 1673, weight: 1050, trunk: 245, maintenance: 25,
    price: '۳۰۰-۴۵۰ میلیون',
    pros: ['شاسی محکم', 'سواری نرم', 'بازار فروش خوب', 'طراحی جوان‌پسند'],
    cons: ['استهلاک گیربکس', 'قطعات گران', 'کمبود فضای عقب', 'مصرف سوخت متوسط'],
    rating: 78, salesData: [160, 175, 190, 170, 200, 220, 210, 240, 225, 250, 235, 260],
  },
  'سمند': {
    name: 'سمند', year: '۱۳۸۱-اکنون', engine: 'EF7', power: 113,
    fuel: 'بنزینی', transmission: 'دستی ۵ دنده', acceleration: 10.5, consumption: 8.5,
    length: 4500, width: 1720, weight: 1200, trunk: 440, maintenance: 30,
    price: '۲۵۰-۳۵۰ میلیون',
    pros: ['فضای جادار', 'ارزان‌ترین سدان', 'موتور پرقدرت', 'خانوادگی'],
    cons: ['کیفیت مونتاژ', 'طراحی ساده', 'مصرف بالا', 'عدم آپشن'],
    rating: 70, salesData: [140, 155, 170, 150, 180, 200, 190, 215, 200, 225, 210, 240],
  },
  'هایما S5': {
    name: 'هایما S5', year: '۱۳۹۶-اکنون', engine: '۱.۸ لیتر توربو', power: 160,
    fuel: 'بنزینی', transmission: 'اتوماتیک ۶ دنده', acceleration: 8.5, consumption: 8.2,
    length: 4450, width: 1835, weight: 1450, trunk: 400, maintenance: 60,
    price: '۸۰۰-۱۱۰۰ میلیون',
    pros: ['شاسی‌بلند محبوب', 'کابین مدرن', 'امکانات کامل', 'طراحی جذاب'],
    cons: ['قیمت بالا', 'قطعات گران', 'مصرف سوخت', 'خدمات محدود'],
    rating: 82, salesData: [80, 95, 110, 90, 120, 140, 130, 155, 140, 165, 150, 180],
  },
  'دنا پلاس': {
    name: 'دنا پلاس', year: '۱۳۹۴-اکنون', engine: 'EF7 TC', power: 150,
    fuel: 'بنزینی', transmission: 'دستی ۵ دنده', acceleration: 9, consumption: 7.8,
    length: 4530, width: 1740, weight: 1250, trunk: 430, maintenance: 45,
    price: '۵۰۰-۷۵۰ میلیون',
    pros: ['پیشرانه توربو', 'امکانات رفاهی', 'طراحی مدرن', 'قیمت مناسب'],
    cons: ['کیفیت قطعات', 'خدمات محدود', 'استهلاک توربو', 'فروش کند'],
    rating: 75, salesData: [60, 75, 90, 70, 100, 120, 110, 135, 120, 145, 130, 160],
  },
  'تیبا': {
    name: 'تیبا', year: '۱۳۹۴-اکنون', engine: 'M15', power: 72,
    fuel: 'بنزینی', transmission: 'دستی ۵ دنده', acceleration: 13.5, consumption: 6.8,
    length: 3900, width: 1655, weight: 1020, trunk: 280, maintenance: 18,
    price: '۱۷۰-۲۳۰ میلیون',
    pros: ['اقتصادی', 'کم استهلاک', 'ارزان', 'قطعات فراوان'],
    cons: ['ایمنی پایین', 'طراحی نه چندان جذاب', 'کیفیت داخلی', 'کمبود آپشن'],
    rating: 60, salesData: [200, 220, 240, 210, 250, 270, 260, 290, 275, 300, 285, 320],
  },
};

const ALL_NAMES = Object.keys(CARS);
const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const SPEC_LABELS: Record<string, string> = {
  year: 'سال تولید', engine: 'پیشرانه', fuel: 'سوخت', transmission: 'گیربکس',
};

const NUMERIC_SPECS: { key: keyof CarSpec; label: string; unit: string; invert?: boolean }[] = [
  { key: 'power', label: 'قدرت موتور', unit: 'اسب بخار' },
  { key: 'acceleration', label: 'شتاب ۰-۱۰۰', unit: 'ثانیه', invert: true },
  { key: 'consumption', label: 'مصرف ترکیکی', unit: 'لیتر', invert: true },
  { key: 'length', label: 'طول', unit: 'میلی‌متر' },
  { key: 'width', label: 'عرض', unit: 'میلی‌متر' },
  { key: 'weight', label: 'وزن', unit: 'کیلوگرم' },
  { key: 'trunk', label: 'حجم صندوق', unit: 'لیتر' },
  { key: 'maintenance', label: 'هزینه نگهداری سالانه', unit: 'میلیون تومان', invert: true },
];

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2-3c-.3-.4-.8-.6-1.3-.6H8.5c-.5 0-1 .2-1.3.6L5 10l-2.5 1.1C1.7 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);

export default function CarVsCarPage() {
  const [car1, setCar1] = useState('پراید ۱۳۱');
  const [car2, setCar2] = useState('پژو ۲۰۶');

  const c1 = CARS[car1];
  const c2 = CARS[car2];

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-6xl mx-auto w-full px-4 py-12 md:py-16">
          <Breadcrumbs />

          <div className="mb-10 mt-4">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
              CAR VS CAR
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">مقایسه تخصصی خودروها</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light mt-2 max-w-xl">دو مدل ماشین را انتخاب کن و مشخصات فنی، ابعاد و هزینه‌های نگهداری آن‌ها را کنار هم ببین</p>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-10">
            <div className="md:col-span-2">
              <label className="text-[11px] text-muted-foreground mb-2 block uppercase tracking-wider">خودرو اول</label>
              <GlassSelect value={car1} onChange={setCar1} options={ALL_NAMES.filter((n: string) => n !== car2).map((n: string) => ({ value: n, label: n }))} placeholder="انتخاب خودرو" />
            </div>
            <div className="text-center text-muted-foreground pb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] text-muted-foreground mb-2 block uppercase tracking-wider">خودرو دوم</label>
              <GlassSelect value={car2} onChange={setCar2} options={ALL_NAMES.filter((n: string) => n !== car1).map((n: string) => ({ value: n, label: n }))} placeholder="انتخاب خودرو" />
            </div>
          </div>

          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[c1, c2].map((car, idx) => (
              <div key={idx} className="glass rounded-3xl p-6 border border-border-subtle text-center overflow-hidden">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-surface-2/50 border border-border flex items-center justify-center">
                  <CarIcon />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{car.name}</p>
                <div className="text-2xl font-bold text-foreground tracking-tighter">{car.price}</div>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className={cn('w-2 h-2 rounded-full', s <= Math.round(car.rating / 20) ? 'bg-primary' : 'bg-surface-2')} />
                  ))}
                  <span className="text-[10px] text-muted-foreground mr-1">{car.rating}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Visual Bar Comparison */}
          <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle mb-8 overflow-hidden">
            <h3 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              مقایسه بصری مشخصات
            </h3>
            <div className="space-y-8">
              {NUMERIC_SPECS.map((spec) => {
                const v1 = c1[spec.key] as number;
                const v2 = c2[spec.key] as number;
                const max = Math.max(v1, v2) * 1.1;
                
                const w1 = spec.invert ? (v2 / max) * 100 : (v1 / max) * 100;
                const w2 = spec.invert ? (v1 / max) * 100 : (v2 / max) * 100;

                return (
                  <div key={spec.key as string}>
                    <div className="text-center mb-3 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{spec.label}</div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex-1 flex items-center gap-3 flex-row-reverse">
                        <span className="text-xs font-medium text-foreground w-14 text-left shrink-0">{v1.toLocaleString('fa-IR')}</span>
                        <div className="flex-1 h-2 bg-surface-2/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${w1}%`, marginLeft: 'auto' }} />
                        </div>
                      </div>

                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-surface-2/50 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${w2}%` }} />
                        </div>
                        <span className="text-xs font-medium text-foreground w-14 text-right shrink-0">{v2.toLocaleString('fa-IR')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Specs Table */}
          <div className="glass rounded-3xl border border-border-subtle overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right p-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">مشخصات</th>
                  <th className="text-center p-4 font-bold text-foreground">{car1}</th>
                  <th className="text-center p-4 text-[10px] text-muted-foreground uppercase tracking-wider w-10">برتری</th>
                  <th className="text-center p-4 font-bold text-foreground">{car2}</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(SPEC_LABELS) as (keyof CarSpec)[]).map((key) => (
                  <tr key={key} className="border-b border-border-subtle last:border-0 hover:bg-surface-2/20">
                    <td className="p-4 text-muted-foreground text-xs">{SPEC_LABELS[key]}</td>
                    <td className="p-4 text-center font-medium text-foreground">{c1[key]}</td>
                    <td className="text-center text-muted-foreground">=</td>
                    <td className="p-4 text-center font-medium text-foreground">{c2[key]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sales Trend Charts (با تم شیشه‌ای یکپارچه) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[c1, c2].map((car, idx) => (
              <div key={idx} className="glass rounded-3xl p-6 border border-border-subtle overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">روند فروش {car.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-light mt-1">تعداد فروش در ۱۲ ماه گذشته</p>
                  </div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                    مجموع: {car.salesData.reduce((a, b) => a + b, 0).toLocaleString('fa-IR')} دستگاه
                  </span>
                </div>
                
                {/* فضای چارت با بک‌گراند بسیار ظریف و شیشه‌ای */}
                <div className="relative flex-1 w-full min-h-[16rem]">
                  <ModernLineChart 
                    data={car.salesData} 
                    labels={MONTHS.map(m => m.slice(0, 4))} 
                    color="var(--color-primary)" 
                    height={260} 
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pros/Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[c1, c2].map((car) => (
              <div key={car.name} className="glass rounded-3xl p-6 border border-border-subtle">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">{car.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">نقاط قوت</span>
                  </div>
                  {car.pros.map((p) => (
                    <p key={p} className="text-xs text-muted-foreground pr-6 font-light">• {p}</p>
                  ))}
                  
                  <div className="flex items-center gap-2 text-destructive mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    <span className="text-[11px] font-bold uppercase tracking-wider">نقاط ضعف</span>
                  </div>
                  {car.cons.map((c) => (
                    <p key={c} className="text-xs text-muted-foreground pr-6 font-light">• {c}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <div className="glass rounded-3xl p-6 md:p-8 border border-primary/20 text-center overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[100px] bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="relative z-10">
              <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2 justify-center uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                جمع‌بندی هوشمند
              </h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
                {c1.rating > c2.rating
                  ? `${car1} با امتیاز ${c1.rating} نسبت به ${car2} (${c2.rating}) انتخاب بهتری است. `
                  : `${car2} با امتیاز ${c2.rating} نسبت به ${car1} (${c1.rating}) انتخاب بهتری است. `
                }
                این مقایسه بر اساس مشخصات فنی، ابعاد، هزینه‌های نگهداری و روند بازار انجام شده است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}