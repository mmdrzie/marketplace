'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParts } from '@/hooks/useParts';
import { CATEGORY_PARTS_LABELS, CATEGORY_PARTS_MAP } from '@/store/partStore';

const CATEGORY_LIST = Object.keys(CATEGORY_PARTS_LABELS).filter((k) => k !== 'sedan');
const CATEGORY_NAMES: Record<string, string> = {
  car: 'خودرو سواری',
  truck: 'کامیون',
  trailer: 'تریلی',
  pickup: 'وانت',
  loader: 'لودر',
  excavator: 'بیل مکانیکی',
  bulldozer: 'بولدوزر',
  crane: 'جرثقیل',
  tractor: 'تراکتور',
  'combine-harvester': 'کمباین',
  forklift: 'لیفتراک',
  motorcycle: 'موتورسیکلت',
  generator: 'ژنراتور',
  bicycle: 'دوچرخه',
};



const CATEGORY_BADGE_CLASS: Record<string, { className: string; style?: React.CSSProperties }> = {
  original: { className: 'bg-primary/10 text-primary border-primary/20' },
  aftermarket: { className: 'bg-warning/10 text-warning border-warning/20' },
  attachment: { className: 'bg-success/10 text-success border-success/20' },
  consumable: { className: 'text-accent-blue border-accent-blue-border', style: { backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' } },
};

const CATEGORY_BADGE_LABEL: Record<string, string> = {
  original: 'قطعه اصلی',
  aftermarket: 'تأمینی',
  attachment: 'ادوات',
  consumable: 'مصرفی',
};

export default function PartsPage() {
  const { data: parts, isLoading, error } = useParts();
  const partList = useMemo(() => parts ?? [], [parts]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  const filtered = useMemo(() => {
    let result = partList;
    if (activeCategory) {
      const allowedIds = new Set(CATEGORY_PARTS_MAP[activeCategory] || []);
      result = result.filter((p: { id: number }) => allowedIds.has(p.id));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p: { name: string; partNumber: string; compatibility: string; description: string }) =>
          p.name.includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.compatibility.toLowerCase().includes(q) ||
          p.description.includes(q)
      );
    }
    return result;
  }, [partList, search, activeCategory]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
            PARTS &amp; ATTACHMENTS
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-4 leading-tight">
            قطعات یدکی و ادوات
          </h1>
          <p className="text-lg text-muted-foreground font-light leading-relaxed">
            جستجوی قطعات و ادوات سازگار با انواع خودرو، ماشین‌آلات سنگین و کشاورزی
          </p>
        </div>

        <div className="relative max-w-md mx-auto">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی قطعه بر اساس نام، کد یا مدل سازگار..."
            className="w-full bg-surface/60 border border-border rounded-2xl py-3 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${!activeCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}`}
          >
            همه قطعات
          </button>
          {CATEGORY_LIST.map((slug) => (
            <button
              key={slug}
              onClick={() => setActiveCategory(activeCategory === slug ? '' : slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${activeCategory === slug ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}`}
            >
              {CATEGORY_NAMES[slug]}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl p-4 border border-border-subtle motion-safe:animate-pulse">
                <div className="w-full aspect-square bg-surface-2 rounded-xl mb-3" />
                <div className="h-3 w-16 bg-surface-2 rounded-full mb-2" />
                <div className="h-4 w-3/4 bg-surface-2 rounded-lg mb-1" />
                <div className="h-3 w-1/2 bg-surface-2 rounded-lg mb-3" />
                <div className="h-4 w-1/3 bg-surface-2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            </div>
            <p className="text-destructive font-medium">خطا در بارگذاری قطعات</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            <p className="text-muted-foreground">قطعه‌ای با این مشخصات یافت نشد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((part: { id: number; category: string; categoryLabel: string; name: string; description: string; price: number; compatibility: string; inStock: boolean }, i: number) => (
              <div
                key={part.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 0.03}s`, animationFillMode: 'both' }}
              >
                <Link href={`/parts/${part.id}`} className="block group">
                  <div className="glass rounded-2xl p-4 border border-border-subtle hover:border-primary/20 hover:-translate-y-1 transition-all duration-200">
                    <div className="w-full aspect-square bg-surface-2 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      <svg className="h-10 w-10 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    </div>
                    <span className={`inline-block text-[9px] font-bold tracking-widest uppercase mb-1.5 border px-2 py-0.5 rounded-full ${(CATEGORY_BADGE_CLASS[part.category]?.className) || 'bg-surface-2/50 text-muted-foreground border-border'}`} style={CATEGORY_BADGE_CLASS[part.category]?.style}>
                      {CATEGORY_BADGE_LABEL[part.category] || part.categoryLabel}
                    </span>
                    <h4 className="text-sm font-bold text-foreground leading-tight mb-0.5 group-hover:text-primary transition-colors">{part.name}</h4>
                    <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-1">{part.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-foreground">{part.price.toLocaleString('fa-IR')}<span className="text-[9px] text-muted-foreground font-normal mr-0.5">تومان</span></span>
                      <span className="text-[8px] text-muted-foreground" title="مدل‌های سازگار">{part.compatibility.slice(0, 18)}{part.compatibility.length > 18 ? '...' : ''}</span>
                    </div>
                    {!part.inStock && (
                      <span className="inline-block mt-2 text-[9px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">ناموجود</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
