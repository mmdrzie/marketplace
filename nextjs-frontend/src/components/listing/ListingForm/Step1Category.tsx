'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

// کامپوننت آیکون مدرن برای یکدست شدن استایل
const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

// آیکون‌های وکتور اختصاصی برای هر دسته (بدون ایموجی)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  car: <Icon><path d="M5 17H3v-3.5l2-4.5a2 2 0 0 1 1.8-1.2h8.4a2 2 0 0 1 1.8 1.2l2 4.5V17h-2" /><path d="M5 17h14" /><circle cx="7.5" cy="17" r="1.5" /><circle cx="16.5" cy="17" r="1.5" /></Icon>,
  truck: <Icon><path d="M3 6h11v9H3z" /><path d="M14 9h4l3 3v3h-7z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></Icon>,
  trailer: <Icon><rect x="2" y="6" width="13" height="10" rx="1" /><path d="M15 10h3l3 3v3h-6" /><circle cx="6" cy="18" r="1.5" /><circle cx="10" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></Icon>,
  pickup: <Icon><path d="M2 8h12v8H2z" /><path d="M14 11h3l4 3v2h-7z" /><circle cx="6.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" /></Icon>,
  loader: <Icon><rect x="3" y="14" width="8" height="5" rx="1" /><path d="M11 16h4l2-2v-3" /><path d="M13 11l3-4l4 1l-1 4" /><circle cx="5" cy="20" r="1" /><circle cx="9" cy="20" r="1" /></Icon>,
  excavator: <Icon><rect x="3" y="14" width="8" height="5" rx="1" /><path d="M11 16h4l2-2v-3" /><path d="M13 11l3-4l4 1l-1 4" /><circle cx="5" cy="20" r="1" /><circle cx="9" cy="20" r="1" /></Icon>,
  bulldozer: <Icon><rect x="3" y="14" width="8" height="5" rx="1" /><path d="M11 16h6l3-2v-2" /><circle cx="5" cy="20" r="1" /><circle cx="9" cy="20" r="1" /><circle cx="15" cy="20" r="1" /></Icon>,
  crane: <Icon><path d="M4 20V8l12-2v12" /><path d="M4 8h12" /><path d="M16 10h4v10h-4z" /><path d="M8 6V3" /></Icon>,
  tractor: <Icon><path d="M3 12h8v6H3z" /><path d="M11 14h4l3-4h3" /><circle cx="14" cy="17" r="3" /></Icon>,
  'combine-harvester': <Icon><rect x="2" y="12" width="12" height="6" rx="1" /><path d="M14 14h3l4-2v6" /><circle cx="5" cy="19" r="1" /><circle cx="10" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></Icon>,
  forklift: <Icon><path d="M4 20V8h4v12" /><path d="M8 10h6v6" /><circle cx="6" cy="21" r="1" /><circle cx="12" cy="21" r="1" /><path d="M14 14h4v6" /></Icon>,
  motorcycle: <Icon><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M15 6a5 5 0 0 0-5 5v5M5.5 17.5l4-6.5h5M10 11h4l3 6.5" /></Icon>,
  generator: <Icon><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M12 8l-2 4h4l-2 4" /></Icon>,
  bicycle: <Icon><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="18.5" cy="17.5" r="3.5" /><path d="M12 17.5L9 6h2l3 11.5M9 6H5M14.5 9H8" /></Icon>,
  default: <Icon><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 12h16M12 4v16" /></Icon>,
};

interface Step1CategoryProps {
  selected: number | null;
  onSelect: (categoryId: number) => void;
  disabled?: boolean;
}

export function Step1Category({ selected, onSelect, disabled }: Step1CategoryProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data as Category[]; },
    retry: 2,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">1</div>
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 1</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">انتخاب دسته‌بندی</h2>
          <p className="text-muted-foreground text-sm font-light">در حال بارگذاری...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-surface/40 border border-border-subtle animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-border-subtle" />
              <div className="h-4 w-20 rounded bg-border-subtle" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* هدر مرحله */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">1</div>
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 1</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">انتخاب دسته‌بندی</h2>
        <p className="text-muted-foreground text-sm font-light">نوع وسیله نقلیه یا ماشین‌آلات خود را برای ثبت آگهی انتخاب کنید.</p>
      </div>

      {/* گرید دسته‌بندی‌ها */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(categories ?? [])?.map((cat) => {
          const isSelected = selected === cat.id;
          return (
              <button
                  key={cat.id}
                  type="button"
                  onClick={() => { if (!disabled) onSelect(cat.id); }}
                  className={cn(
                    disabled && 'opacity-60 cursor-not-allowed',
                'relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border transition-all duration-300 group overflow-hidden backdrop-blur-sm',
                isSelected
                  ? 'bg-surface border-primary/40 shadow-sm'
                  : 'bg-surface/40 border-border-subtle hover:bg-surface hover:border-primary/30 hover:-translate-y-1'
              )}
            >
              {/* آیکون تیک در حالت انتخاب شده */}
              {isSelected && (
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-[0_0_8px_var(--color-primary)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}

              {/* هاله نوری پشت آیکون در حالت هاور یا انتخاب */}
              <div className={cn(
                'absolute w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none',
                isSelected ? 'bg-primary/20 opacity-100' : 'bg-primary/0 opacity-0 group-hover:opacity-100'
              )}></div>

              {/* محتوای کارت (آیکون وکتور) */}
              <div className={cn(
                'relative z-10 transition-all duration-300',
                isSelected ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-110'
              )}>
                {CATEGORY_ICONS[cat.slug] || CATEGORY_ICONS.default}
              </div>

              {/* نام دسته‌بندی */}
              <span className={cn(
                'relative z-10 font-medium text-sm transition-colors duration-300',
                isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}