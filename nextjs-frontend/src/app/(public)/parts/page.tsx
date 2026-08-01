'use client';

import { useMemo, useState, Suspense } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useStores } from '@/hooks/usePartsV2';
import { PartCard } from '@/components/parts/PartCard';
import { StoreCard } from '@/components/store/StoreCard';
import { PartsCategoryFilterModal } from '@/components/parts/PartsCategoryFilterModal';
import { PartsVehicleFilterModal } from '@/components/parts/PartsVehicleFilterModal';
import { TuningFilterChips } from '@/components/catalog/TuningFilterChips';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { SkeletonListings } from '@/components/common/Skeleton';

type Step = 'entry' | 'stores' | 'results';

const SORTS = [
  { value: 'name', label: 'نام قطعه' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
];

interface PartCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  parent_id?: number | null;
  children?: PartCategory[];
}

function flattenCategories(roots: PartCategory[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (nodes: PartCategory[] | undefined) => {
    if (!nodes) return;
    for (const n of nodes) {
      map.set(String(n.id), n.name);
      walk(n.children);
    }
  };
  walk(roots);
  return map;
}

function buildParams(sp: URLSearchParams): { step: Step; cat: string | null; brand: string | null; model: string | null; year: string | null; q: string | null; sort: string } {
  const m = sp.get('mode') as Step | null;
  return {
    step: m && ['entry', 'stores', 'results'].includes(m) ? m : 'entry',
    cat: sp.get('cat'),
    brand: sp.get('brand'),
    model: sp.get('model'),
    year: sp.get('year'),
    q: sp.get('q'),
    sort: sp.get('sort') || 'name',
  };
}

function PartsContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const { step, cat, brand, model, year, q, sort } = useMemo(() => buildParams(sp), [sp]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const go = (mode: Step, extra?: Record<string, string>) => {
    const p = new URLSearchParams();
    p.set('mode', mode);
    if (extra) for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
    const s = p.toString();
    router.push(`/parts${s ? '?' + s : ''}`, { scroll: false });
  };

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.replace(`/parts?${p.toString()}`, { scroll: false });
  };

  const { data: stores, isError: storesError } = useStores();
  const storeList = stores ?? [];

  const { data: categories } = useQuery({
    queryKey: ['parts-categories-tree'],
    queryFn: async () => {
      const res = await api.get('/v2/parts/categories');
      return (res.data?.data || res.data || []) as PartCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
  const categoryTitles = useMemo(() => flattenCategories(categories || []), [categories]);
  const activeCatId = cat ? Number(cat) : null;

  const { data: brands } = useQuery({
    queryKey: ['vehicle-brands'],
    queryFn: async () => {
      const res = await api.get('/v2/vehicles/brands');
      return (res.data?.data || res.data || []) as { id: number; name: string }[];
    },
    staleTime: 10 * 60 * 1000,
  });
  const brandNameById = useMemo(() => {
    if (!brands) return {};
    return Object.fromEntries(brands.map(b => [String(b.id), b.name]));
  }, [brands]);

  const { data: models } = useQuery({
    queryKey: ['vehicle-models', brand],
    queryFn: async () => {
      if (!brand) return [];
      const res = await api.get('/v2/vehicles/models', { params: { brand_id: brand } });
      return (res.data?.data || res.data || []) as { id: number; name: string }[];
    },
    enabled: !!brand,
    staleTime: 10 * 60 * 1000,
  });
  const modelNameById = useMemo(() => {
    if (!models) return {};
    return Object.fromEntries(models.map(m => [String(m.id), m.name]));
  }, [models]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['v2-parts-infinite', { cat, brand, model, year, q }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number> = { page: pageParam, limit: 24 };
      if (q) params.q = q;
      if (cat) params.category_id = Number(cat);
      if (brand) params.brand_id = brand;
      if (model) params.model_id = Number(model);
      if (year) params.year = Number(year);
      const res = await api.get('/v2/parts', { params });
      return (res.data?.data || res.data || []) as any[];
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.length === 24 ? allPages.length + 1 : undefined),
    enabled: step === 'results',
  });

  const parts = useMemo(() => data?.pages.flatMap((p) => p || []) || [], [data]);

  const sortedParts = useMemo(() => {
    const list = [...parts];
    if (sort === 'newest') list.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
    else if (sort === 'price_asc') list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sort === 'price_desc') list.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    return list;
  }, [parts, sort]);

  const applyVehicleFilter = (brandId: string | null, modelId: number | null, yearVal: number | null) => {
    const p = new URLSearchParams(sp.toString());
    if (brandId) p.set('brand', brandId); else p.delete('brand');
    if (modelId !== null && modelId !== undefined) p.set('model', String(modelId)); else p.delete('model');
    if (yearVal !== null && yearVal !== undefined) p.set('year', String(yearVal)); else p.delete('year');
    router.replace(`/parts?${p.toString()}`, { scroll: false });
  };

  const chips = [
    ...(cat && categoryTitles.get(cat) ? [{ label: categoryTitles.get(cat)!, onRemove: () => setParam('cat', null) }] : []),
    ...(brand ? [{ label: brandNameById[brand] || `برند: ${brand}`, onRemove: () => { setParam('brand', null); setParam('model', null); setParam('year', null); } }] : []),
    ...(model ? [{ label: modelNameById[model] || `مدل: ${model}`, onRemove: () => { setParam('model', null); setParam('year', null); } }] : []),
    ...(year ? [{ label: `سال: ${year}`, onRemove: () => setParam('year', null) }] : []),
    ...(q ? [{ label: `"${q}"`, onRemove: () => setParam('q', null) }] : []),
  ];

  const renderEntry = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
          PARTS &amp; ACCESSORIES
        </span>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground mb-4 leading-tight">قطعات یدکی و ادوات</h1>
        <p className="text-base text-muted-foreground font-light leading-relaxed">از کجا می‌خواهید شروع کنید؟</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <button onClick={() => go('stores')} className="btn btn-glass btn-xl h-auto min-h-[120px] flex-col text-center gap-2 py-6 group whitespace-normal">
          <svg className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          <span className="text-lg font-bold">فروشگاه‌ها</span>
          <span className="text-xs text-muted-foreground font-normal leading-relaxed max-w-[220px]">مشاهده فروشگاه‌های معتبر قطعات یدکی و مرور محصولات</span>
        </button>
        <button onClick={() => go('results')} className="btn btn-glass btn-xl h-auto min-h-[120px] flex-col text-center gap-2 py-6 group whitespace-normal">
          <svg className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
          <span className="text-lg font-bold">لیست قطعات</span>
          <span className="text-xs text-muted-foreground font-normal leading-relaxed max-w-[220px]">مشاهده لیست کامل قطعات با فیلتر دسته‌بندی، برند و مدل</span>
        </button>
      </div>
    </>
  );

  const renderStores = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">فروشگاه‌های قطعات یدکی</h2>
        <p className="text-sm text-muted-foreground mt-1">انتخاب فروشگاه برای مشاهده محصولات</p>
      </div>
      {storesError ? (
        <EmptyState title="خطا در دریافت فروشگاه‌ها" description="مجددا تلاش کنید" icon="search" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {storeList.map((store: any) => <StoreCard key={store.user_id} store={store} />)}
        </div>
      )}
      {!storesError && storeList.length === 0 && <EmptyState title="هیچ فروشگاه فعالی یافت نشد" icon="default" />}
    </>
  );

  const renderResults = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
          PARTS &amp; ACCESSORIES
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">همه قطعات</h1>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          با دکمه «فیلتر دسته‌بندی» گروه و نوع قطعه را انتخاب کنید یا با فیلتر برند و مدل جستجو را دقیق‌تر کنید
        </p>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            type="text"
            defaultValue={q || ''}
            onChange={(e) => setParam('q', e.target.value || null)}
            placeholder="جستجوی قطعه بر اساس نام، کد یا OEM..."
            className="w-full bg-surface/60 border border-border rounded-2xl py-3.5 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
          />
        </div>

        {/* Filter buttons + sort */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="relative flex items-center gap-2 bg-surface/60 border border-border rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            فیلتر دسته‌بندی
            {activeCatId !== null && (
              <span className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                ۱
              </span>
            )}
          </button>

          <button
            onClick={() => setVehicleOpen(true)}
            className="relative flex items-center gap-2 bg-surface/60 border border-border rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 13v3c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            فیلتر خودرو
            {(brand || model || year) && (
              <span className="absolute -top-2 -left-2 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                ۱
              </span>
            )}
          </button>

          <div className="relative mr-auto shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 bg-surface/60 border border-border rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
            >
              بر اساس
              <svg className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${sortOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                <div className="absolute left-0 top-full mt-2 z-40 glass rounded-2xl border border-border shadow-xl p-1.5 min-w-[180px] animate-scale-in">
                  {SORTS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => { setParam('sort', s.value); setSortOpen(false); }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-colors ${sort === s.value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-surface-2/60'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {chips.length > 0 && <TuningFilterChips chips={chips} />}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{parts.length.toLocaleString('fa-IR')} قطعه یافت شد</p>
        </div>

        {isLoading ? (
          <SkeletonListings count={8} />
        ) : isError ? (
          <EmptyState title="خطا در دریافت قطعات" description="مجددا تلاش کنید" icon="search" />
        ) : sortedParts.length === 0 ? (
          <EmptyState
            title="قطعه‌ای با این مشخصات یافت نشد"
            description="فیلترهای دیگری را امتحان کنید"
            icon="search"
            action={
              <button onClick={() => router.replace('/parts?mode=results')} className="btn btn-primary btn-sm">
                شروع جستجوی جدید
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedParts.map((part: any, i: number) => <PartCard key={part.id} part={part} index={i} />)}
            </div>
            {hasNextPage && (
              <div className="text-center pt-6">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="btn btn-glass btn-lg"
                >
                  {isFetchingNextPage ? 'در حال بارگذاری...' : 'مشاهده بیشتر'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <PartsCategoryFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        activeId={activeCatId}
        onSelect={(id) => setParam('cat', id ? String(id) : null)}
      />

      <PartsVehicleFilterModal
        open={vehicleOpen}
        onClose={() => setVehicleOpen(false)}
        initialBrandId={brand}
        initialModelId={model ? Number(model) : null}
        initialYear={year ? Number(year) : null}
        onApply={applyVehicleFilter}
      />
    </>
  );

  const renderBreadcrumb = () => {
    if (step === 'entry') return null;
    const crumbs: { label: string; mode: Step }[] = [{ label: 'خانه قطعات', mode: 'entry' }];
    if (step === 'stores') crumbs.push({ label: 'فروشگاه‌ها', mode: 'stores' });
    else if (step === 'results') crumbs.push({ label: 'همه قطعات', mode: 'results' });
    return (
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8" aria-label="مسیر راهنما">
        {crumbs.map((c, i) => (
          <span key={c.mode} className="flex items-center gap-1.5">
            {i > 0 && <svg className="h-3 w-3 shrink-0 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>}
            {i < crumbs.length - 1 ? (
              <button onClick={() => go(c.mode)} className="hover:text-primary transition-colors">{c.label}</button>
            ) : (
              <span className="text-foreground font-bold">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  };

  const showBack = step !== 'entry';

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-24">
      <div className="flex items-start justify-between gap-3 lg:block">
        {renderBreadcrumb()}
        {showBack && (
          <button
            onClick={() => go('entry')}
            className="btn-icon lg:absolute lg:-left-16 lg:top-1/2 lg:-translate-y-1/2 z-40 w-12 h-12"
            aria-label="بازگشت"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 lg:w-5 lg:h-5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>
      {step === 'entry' && renderEntry()}
      {step === 'stores' && renderStores()}
      {step === 'results' && renderResults()}
    </div>
  );
}

export default function PartsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loading /></div>}>
      <PartsContent />
    </Suspense>
  );
}
