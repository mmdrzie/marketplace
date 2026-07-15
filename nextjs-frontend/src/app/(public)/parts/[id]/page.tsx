'use client';

import { use } from 'react';
import Link from 'next/link';
import { usePart } from '@/hooks/useParts';

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

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: part, isLoading } = usePart(id);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">قطعه یافت نشد</h1>
          <Link href="/parts" className="text-primary hover:underline text-sm">بازگشت به catalog قطعات</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-24">
        <div className="mb-6">
          <Link href="/parts" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
            <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            بازگشت به قطعات
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass rounded-2xl p-8 border border-border-subtle flex items-center justify-center aspect-square">
            <svg className="h-24 w-24 text-muted-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>

          <div className="space-y-5">
            <div>
              <span className={`inline-block text-xs font-bold tracking-widest uppercase mb-2 border px-3 py-1 rounded-full ${(CATEGORY_BADGE_CLASS[part.category]?.className) || 'bg-surface-2/50 text-muted-foreground border-border'}`} style={CATEGORY_BADGE_CLASS[part.category]?.style}>
                {CATEGORY_BADGE_LABEL[part.category] || part.categoryLabel}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{part.name}</h1>
            </div>

            <div className="glass rounded-2xl p-5 border border-border-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <span className="text-sm text-muted-foreground">کد قطعه</span>
                <span className="text-sm font-bold text-foreground font-mono">{part.partNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <span className="text-sm text-muted-foreground">قیمت</span>
                <span className="text-xl font-black text-foreground">{part.price.toLocaleString('fa-IR')} <span className="text-xs text-muted-foreground font-normal">تومان</span></span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <span className="text-sm text-muted-foreground">وضعیت موجودی</span>
                <span className={`text-sm font-bold ${part.inStock ? 'text-success' : 'text-destructive'}`}>
                  {part.inStock ? 'موجود' : 'ناموجود'}
                </span>
              </div>
              {part.manufacturer && (
                <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                  <span className="text-sm text-muted-foreground">تولیدکننده</span>
                  <span className="text-sm font-bold text-foreground">{part.manufacturer}</span>
                </div>
              )}
              {part.warranty && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">گارانتی</span>
                  <span className="text-sm font-bold text-foreground">{part.warranty}</span>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-5 border border-border-subtle space-y-3">
              <h3 className="text-sm font-bold text-foreground">توضیحات</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
            </div>

            <div className="glass rounded-2xl p-5 border border-border-subtle space-y-3">
              <h3 className="text-sm font-bold text-foreground">مدل‌های سازگار</h3>
              <div className="flex flex-wrap gap-2">
                {part.compatibility.split(',').map((model: string) => (
                  <span key={model.trim()} className="text-xs bg-surface-2 border border-border px-3 py-1 rounded-full text-foreground">
                    {model.trim()}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(part.name)}`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              جستجوی آگهی‌های مرتبط با {part.name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
