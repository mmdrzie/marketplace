'use client';

import { useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loading } from '@/components/common/Loading';

type Step = 'entry' | 'category' | 'insurer' | 'form';

const INSURANCE_CATEGORIES = [
  { slug: 'third-party', name: 'بیمه شخص ثالث', desc: 'بیمه مسئولیت مدنی و جانی در برابر اشخاص ثالث', icon: 'users' },
  { slug: 'body', name: 'بیمه بدنه', desc: 'بیمه خسارت بدنه خودرو در برابر تصادف، سرقت و آتش‌سوزی', icon: 'car' },
  { slug: 'motorcycle', name: 'بیمه موتورسیکلت', desc: 'بیمه شخص ثالث و بدنه مخصوص موتورسیکلت', icon: 'motorcycle' },
  { slug: 'machinery', name: 'بیمه ماشین‌آلات', desc: 'بیمه ماشین‌آلات راه‌سازی، کشاورزی و صنعتی', icon: 'construction' },
  { slug: 'cargo', name: 'بیمه بار و حمل', desc: 'بیمه بارنامه و محموله‌های حمل و نقل', icon: 'truck' },
];

const INSURANCE_COMPANIES = [
  { slug: 'iran', name: 'بیمه ایران', desc: 'قدیمی‌ترین بیمه کشور', color: 'bg-blue-600' },
  { slug: 'asia', name: 'بیمه آسیا', desc: 'بیمه‌گر بزرگ خصوصی', color: 'bg-green-600' },
  { slug: 'dana', name: 'بیمه دانا', desc: 'بیمه‌گر معتبر کشور', color: 'bg-purple-600' },
  { slug: 'alborz', name: 'بیمه البرز', desc: 'بیمه‌گر پیشرو', color: 'bg-red-600' },
  { slug: 'parsian', name: 'بیمه پارسیان', desc: 'بیمه‌گر خصوصی معتبر', color: 'bg-amber-600' },
  { slug: 'pasargad', name: 'بیمه پاسارگاد', desc: 'بیمه‌گر گروه پاسارگاد', color: 'bg-teal-600' },
  { slug: 'razi', name: 'بیمه رازی', desc: 'بیمه‌گر خوش‌نام', color: 'bg-indigo-600' },
  { slug: 'saman', name: 'بیمه سامان', desc: 'بیمه‌گر گروه سامان', color: 'bg-cyan-600' },
  { slug: 'sarmad', name: 'بیمه سرمد', desc: 'بیمه‌گر خصوصی', color: 'bg-pink-600' },
  { slug: 'karafarin', name: 'بیمه کارآفرین', desc: 'بیمه‌گر گروه کارآفرین', color: 'bg-orange-600' },
  { slug: 'kowsar', name: 'بیمه کوثر', desc: 'بیمه‌گر معتبر', color: 'bg-emerald-600' },
  { slug: 'moallem', name: 'بیمه معلم', desc: 'بیمه‌گر فرهنگیان', color: 'bg-sky-600' },
  { slug: 'mellat', name: 'بیمه ملت', desc: 'بیمه‌گر گروه ملت', color: 'bg-violet-600' },
  { slug: 'novin', name: 'بیمه نوین', desc: 'بیمه‌گر خصوصی نوین', color: 'bg-rose-600' },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'third-party': <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M12 22v4M24 22v4M36 22v4" /><path d="M4 18h40v20a2 2 0 01-2 2H6a2 2 0 01-2-2V18z" /><path d="M4 18l6-10h28l6 10" /><circle cx="16" cy="30" r="2" /><circle cx="32" cy="30" r="2" /></svg>,
  'body': <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M6 30h36l-3-12a4 4 0 00-4-3H13a4 4 0 00-4 3L6 30z" /><circle cx="13" cy="32" r="4" /><circle cx="35" cy="32" r="4" /><path d="M8 26l1-4h30l1 4" /></svg>,
  'motorcycle': <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><circle cx="13" cy="34" r="5" /><circle cx="37" cy="34" r="5" /><path d="M13 34l8-20h10l4 20" /><path d="M31 14h10" /><path d="M37 34l-6-20" /></svg>,
  'machinery': <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M2 36h44" /><path d="M8 36V18a4 4 0 014-4h4l4 8" /><rect x="24" y="14" width="10" height="14" rx="1" /><path d="M34 14h8v22" /><circle cx="14" cy="36" r="3" /><circle cx="38" cy="36" r="3" /><path d="M8 26h8" /></svg>,
  'cargo': <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M2 30h30V14a2 2 0 00-2-2H8a2 2 0 00-2 2v16z" /><path d="M32 30h8l6-8v-4a2 2 0 00-2-2h-12v14z" /><circle cx="11" cy="34" r="4" /><circle cx="33" cy="34" r="4" /></svg>,
};

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

function buildParams(sp: URLSearchParams): { step: Step; category: string | null; insurer: string | null } {
  const m = sp.get('mode') as Step | null;
  return {
    step: m && ['entry', 'category', 'insurer', 'form'].includes(m) ? m : 'entry',
    category: sp.get('cat'),
    insurer: sp.get('insurer'),
  };
}

function InsuranceContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { step, category, insurer } = useMemo(() => buildParams(sp), [sp]);

  const [name, setName] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [usage, setUsage] = useState('');
  const [prevDiscount, setPrevDiscount] = useState('');
  const [insuranceTerm, setInsuranceTerm] = useState('1');
  const [franchise, setFranchise] = useState('');

  const go = (mode: Step, extra?: Record<string, string>) => {
    const p = new URLSearchParams();
    p.set('mode', mode);
    if (extra) for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    const s = p.toString();
    router.push(`/insurance${s ? '?' + s : ''}`, { scroll: false });
  };

  const goBack = () => {
    const backMap: Record<Step, Step | null> = { entry: null, category: 'entry', insurer: 'category', form: 'insurer' };
    const prev = backMap[step];
    if (!prev) return;
    const extra: Record<string, string> = {};
    if (prev === 'insurer' && insurer) extra.insurer = insurer;
    if ((prev === 'insurer' || prev === 'category') && category) extra.cat = category;
    if (prev === 'category' && category) extra.cat = category;
    go(prev, extra);
  };

  const renderBreadcrumb = () => {
    if (step === 'entry') return null;
    const crumbs: { label: string; mode: Step }[] = [{ label: 'خانه بیمه', mode: 'entry' }];
    if (step === 'category') crumbs.push({ label: 'نوع بیمه', mode: 'category' });
    else if (step === 'insurer') crumbs.push({ label: 'شرکت بیمه', mode: 'insurer' });
    else if (step === 'form') crumbs.push({ label: 'فرم بیمه', mode: 'form' });
    return (
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8" aria-label="مسیر راهنما">
        {crumbs.map((c, i) => (
          <span key={c.mode} className="flex items-center gap-1.5">
            {i > 0 && <svg className="h-3 w-3 shrink-0 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>}
            {i < crumbs.length - 1 ? (
              <button onClick={() => { const e: Record<string, string> = {}; if (category) e.cat = category; if (insurer) e.insurer = insurer; go(c.mode, e); }} className="hover:text-primary transition-colors">{c.label}</button>
            ) : (
              <span className="text-foreground font-bold">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  };

  const renderEntry = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
          INSURANCE
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-4 leading-tight">بیمه خودرو و ماشین‌آلات</h1>
        <p className="text-base text-muted-foreground font-light leading-relaxed">مقایسه و خرید آنلاین بیمه از معتبرترین شرکت‌های بیمه کشور</p>
      </div>
      <div className="max-w-md mx-auto">
        <button onClick={() => go('category')} className="w-full glass rounded-2xl p-8 border border-border-subtle hover:border-primary/20 hover:-translate-y-1 transition-all text-right group">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
            <SvgIcon className="h-7 w-7 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></SvgIcon>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2 text-center">شروع خرید بیمه</h2>
          <p className="text-sm text-muted-foreground leading-relaxed text-center">نوع بیمه، خودرو و شرکت بیمه‌گر خود را انتخاب کنید</p>
        </button>
      </div>
    </>
  );

  const renderCategory = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">نوع بیمه</h2>
        <p className="text-sm text-muted-foreground">یکی از انواع بیمه را انتخاب کنید</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {INSURANCE_CATEGORIES.map((cat) => (
          <button key={cat.slug} onClick={() => go('insurer', { cat: cat.slug })} className="glass rounded-2xl p-6 border border-border-subtle hover:border-primary/20 hover:-translate-y-1 transition-all text-center group">
            <div className="flex justify-center mb-3 text-primary/70 group-hover:text-primary transition-colors">{CATEGORY_ICONS[cat.slug]}</div>
            <h3 className="font-bold text-foreground mb-1 text-sm">{cat.name}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.desc}</p>
          </button>
        ))}
      </div>
    </>
  );

  const renderInsurer = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">شرکت بیمه‌گر</h2>
        <p className="text-sm text-muted-foreground">شرکت بیمه مورد نظر خود را انتخاب کنید</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
        {INSURANCE_COMPANIES.map((comp) => (
          <button key={comp.slug} onClick={() => { const e: Record<string, string> = { insurer: comp.slug }; if (category) e.cat = category; go('form', e); }} className="glass rounded-2xl p-4 border border-border-subtle hover:border-primary/20 hover:-translate-y-1 transition-all text-center group">
            <div className={`w-10 h-10 rounded-xl ${comp.color} mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <span className="text-white text-xs font-bold">{comp.name.slice(0, 4)}</span>
            </div>
            <h3 className="font-bold text-foreground text-sm mb-1">{comp.name}</h3>
            <p className="text-[10px] text-muted-foreground">{comp.desc}</p>
          </button>
        ))}
      </div>
    </>
  );

  const renderForm = () => {
    const companyName = INSURANCE_COMPANIES.find(c => c.slug === insurer)?.name || 'شرکت بیمه‌گر';
    const catName = INSURANCE_CATEGORIES.find(c => c.slug === category)?.name || '';

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    };

    const inputClass = 'w-full bg-surface/60 border border-border rounded-xl py-3 px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm';
    const labelClass = 'text-sm font-medium text-foreground';
    const sectionClass = 'glass rounded-2xl p-6 md:p-8 border border-border-subtle';

    return (
      <>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">فرم خرید بیمه</h2>
          <p className="text-sm text-muted-foreground">اطلاعات خود را وارد کنید تا پیشنهاد قیمت دریافت کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3 px-4 py-3 glass rounded-xl border border-border-subtle">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{catName}</span>
              <span className="opacity-40">|</span>
              <span>{companyName}</span>
            </div>
            <button type="button" onClick={() => go('entry')} className="text-xs text-primary hover:underline">تغییر</button>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <SvgIcon className="h-4 w-4 text-primary"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></SvgIcon>
              </div>
              <h3 className="font-bold text-foreground">اطلاعات شخصی</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>نام و نام خانوادگی</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="مثال: علی محمدی" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>کد ملی</label>
                <input type="text" value={nationalCode} onChange={e => setNationalCode(e.target.value)} placeholder="۱۰ رقمی" className={inputClass} maxLength={10} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>شماره موبایل</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="مثال: ۰۹۱۲۱۲۳۴۵۶۷" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>تاریخ تولد</label>
                <input type="text" value={birthDate} onChange={e => setBirthDate(e.target.value)} placeholder="مثال: ۱۳۷۰/۰۱/۰۱" className={inputClass} />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <SvgIcon className="h-4 w-4 text-primary"><path d="M6 30h36l-3-12a4 4 0 00-4-3H13a4 4 0 00-4 3L6 30z" /><circle cx="13" cy="32" r="4" /><circle cx="35" cy="32" r="4" /></SvgIcon>
              </div>
              <h3 className="font-bold text-foreground">اطلاعات وسیله نقلیه</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>برند</label>
                <select value={brand} onChange={e => setBrand(e.target.value)} className={inputClass}>
                  <option value="" disabled>انتخاب برند</option>
                  <option value="پراید">پراید</option>
                  <option value="پژو">پژو</option>
                  <option value="سمند">سمند</option>
                  <option value="رانا">رانا</option>
                  <option value="تیبا">تیبا</option>
                  <option value="کوییک">کوییک</option>
                  <option value="دنا">دنا</option>
                  <option value="هایما">هایما</option>
                  <option value="کیا">کیا</option>
                  <option value="هیوندای">هیوندای</option>
                  <option value="تویوتا">تویوتا</option>
                  <option value="بنز">بنز</option>
                  <option value="بی‌ام‌و">بی‌ام‌و</option>
                  <option value="other">سایر</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>مدل</label>
                <select value={model} onChange={e => setModel(e.target.value)} className={inputClass}>
                  <option value="" disabled>انتخاب مدل</option>
                  <option value="111">۱۱۱</option>
                  <option value="131">۱۳۱</option>
                  <option value="132">۱۳۲</option>
                  <option value="141">۱۴۱</option>
                  <option value="151">۱۵۱</option>
                  <option value="405">۴۰۵</option>
                  <option value="206">۲۰۶</option>
                  <option value="207">۲۰۷</option>
                  <option value="سورن">سورن</option>
                  <option value="پارس">پارس</option>
                  <option value="other">سایر</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>سال ساخت</label>
                <select value={year} onChange={e => setYear(e.target.value)} className={inputClass}>
                  <option value="" disabled>انتخاب سال</option>
                  {Array.from({ length: 30 }, (_, i) => 1370 + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-1.5">
                <label className={labelClass}>نوع استفاده</label>
                <select value={usage} onChange={e => setUsage(e.target.value)} className={inputClass}>
                  <option value="" disabled>انتخاب کنید</option>
                  <option value="personal">شخصی</option>
                  <option value="taxi">تاکسی</option>
                  <option value="rental">اجاره‌ای</option>
                  <option value="governmental">دولتی</option>
                </select>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <SvgIcon className="h-4 w-4 text-primary"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></SvgIcon>
              </div>
              <h3 className="font-bold text-foreground">مشخصات بیمه‌ای</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>درصد تخفیف عدم خسارت</label>
                <select value={prevDiscount} onChange={e => setPrevDiscount(e.target.value)} className={inputClass}>
                  <option value="" disabled>انتخاب کنید</option>
                  <option value="0">بدون تخفیف</option>
                  <option value="10">۱۰٪</option>
                  <option value="20">۲۰٪</option>
                  <option value="30">۳۰٪</option>
                  <option value="40">۴۰٪</option>
                  <option value="50">۵۰٪</option>
                  <option value="60">۶۰٪</option>
                  <option value="70">۷۰٪</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>مدت بیمه نامه</label>
                <select value={insuranceTerm} onChange={e => setInsuranceTerm(e.target.value)} className={inputClass}>
                  <option value="1">یک ساله</option>
                  <option value="2">دو ساله</option>
                </select>
              </div>
              {category === 'body' && (
                <div className="space-y-1.5">
                  <label className={labelClass}>درصد فرانشیز</label>
                  <select value={franchise} onChange={e => setFranchise(e.target.value)} className={inputClass}>
                    <option value="" disabled>انتخاب کنید</option>
                    <option value="0">بدون فرانشیز</option>
                    <option value="10">۱۰٪</option>
                    <option value="20">۲۰٪</option>
                    <option value="30">۳۰٪</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => go('insurer', { ...(category ? { cat: category } : {}) })} className="btn btn-ghost py-3 px-6 rounded-xl text-sm">
              مرحله قبل
            </button>
            <button type="submit" className="flex-1 py-3 btn btn-primary rounded-xl text-sm font-bold">
              دریافت پیشنهاد قیمت
            </button>
          </div>
        </form>
      </>
    );
  };

  const showBack = step !== 'entry';

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-24">
      <div className="flex items-start justify-between gap-3">
        {renderBreadcrumb()}
        {showBack && (
          <button
            onClick={goBack}
            className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl glass border border-border-subtle hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary transition-all shadow-lg backdrop-blur-md shrink-0"
            aria-label="مرحله قبل"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 lg:w-5 lg:h-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>
      {step === 'entry' && renderEntry()}
      {step === 'category' && renderCategory()}
      {step === 'insurer' && renderInsurer()}
      {step === 'form' && renderForm()}
    </div>
  );
}

export default function InsurancePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loading /></div>}>
      <InsuranceContent />
    </Suspense>
  );
}