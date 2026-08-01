'use client';

import { useMemo, useState, Suspense } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCatalog, useCatalogCategories } from '@/hooks/useCatalogs';
import type { CatalogCategory } from '@/components/catalog/CatalogSidebar';
import { CatalogFilterModal } from '@/components/catalog/CatalogFilterModal';
import { CatalogPartCard } from '@/components/catalog/CatalogPartCard';
import { TuningFilterChips } from '@/components/catalog/TuningFilterChips';
import { VehicleFilterModal, ENGINE_TYPES } from '@/components/parts/VehicleFilterModal';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { SkeletonListings } from '@/components/common/Skeleton';

const SORTS = [
  { value: 'name', label: 'نام قطعه' },
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
];

function flattenCategories(roots: CatalogCategory[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (nodes: CatalogCategory[] | undefined) => {
    if (!nodes) return;
    for (const n of nodes) {
      map.set(String(n.id), n.title);
      walk(n.children);
    }
  };
  walk(roots);
  return map;
}

function PartsListContent({ slug }: { slug: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  const cat = sp.get('cat');
  const brand = sp.get('brand');
  const model = sp.get('model');
  const engine = sp.get('engine');
  const year = sp.get('year');
  const q = sp.get('q');
  const sort = sp.get('sort') || 'name';

  const [filterOpen, setFilterOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.replace(`/catalog/${slug}/parts${p.toString() ? '?' + p.toString() : ''}`, { scroll: false });
  };

  const { data: catalog } = useCatalog(slug);
  const { data: categories } = useCatalogCategories(slug);
  const categoryTitles = useMemo(() => flattenCategories(categories || []), [categories]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['catalog-parts-infinite', slug, { cat, brand, model, year, q, sort }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number> = { page: pageParam, limit: 24, sort };
      if (cat) params.category = cat;
      if (brand) params.brand_id = brand;
      if (model) params.model_id = Number(model);
      if (year) params.year = Number(year);
      if (q) params.q = q;
      const res = await api.get(`/v2/catalogs/${slug}/parts`, { params });
      return res.data.data as { rows: any[]; total: number };
    },
    getNextPageParam: (last, allPages) => (allPages.length * 24 < last.total ? allPages.length + 1 : undefined),
    enabled: true,
  });

  const parts = useMemo(() => data?.pages.flatMap((p) => p.rows || []) || [], [data]);
  const total = data?.pages[0]?.total ?? parts.length;

  const activeCat = cat ? Number(cat) : null;

  const applyVehicleFilter = (brandId: string | null, modelId: number | null, engineType: string | null) => {
    const p = new URLSearchParams(sp.toString());
    if (brandId) p.set('brand', brandId); else p.delete('brand');
    if (modelId !== null && modelId !== undefined) p.set('model', String(modelId)); else p.delete('model');
    if (engineType) p.set('engine', engineType); else p.delete('engine');
    router.replace(`/catalog/${slug}/parts${p.toString() ? '?' + p.toString() : ''}`, { scroll: false });
  };

  const chips = [
    ...(cat && categoryTitles.get(cat) ? [{ label: categoryTitles.get(cat)!, onRemove: () => setParam('cat', null) }] : []),
    ...(brand ? [{ label: `برند: ${brand}`, onRemove: () => setParam('brand', null) }] : []),
    ...(model ? [{ label: `مدل: ${model}`, onRemove: () => { setParam('model', null); } }] : []),
    ...(engine ? [{ label: `موتور: ${ENGINE_TYPES.find((e) => e.value === engine)?.label || engine}`, onRemove: () => setParam('engine', null) }] : []),
    ...(year ? [{ label: `سال: ${year}`, onRemove: () => setParam('year', null) }] : []),
    ...(q ? [{ label: `"${q}"`, onRemove: () => setParam('q', null) }] : []),
  ];

  const catalogLabel = catalog?.label || slug;

  return (
    <div>
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
          {catalogLabel}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">همه قطعات</h1>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          با دکمه «فیلتر دسته‌بندی» گروه و نوع قطعه را انتخاب کنید یا با فیلتر برند و مدل جستجو را دقیق‌تر کنید
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Main */}
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
              {activeCat !== null && categoryTitles.get(String(activeCat)) && (
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
              {(brand || model || engine) && (
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
            <p className="text-sm text-muted-foreground">{total.toLocaleString('fa-IR')} قطعه یافت شد</p>
          </div>

          {isLoading ? (
            <SkeletonListings count={8} />
          ) : isError ? (
            <EmptyState title="خطا در دریافت قطعات" description="مجددا تلاش کنید" icon="search" />
          ) : parts.length === 0 ? (
            <EmptyState
              title="قطعه‌ای با این مشخصات یافت نشد"
              description="فیلترهای دیگری را امتحان کنید"
              icon="search"
              action={
                <button onClick={() => router.replace(`/catalog/${slug}/parts`)} className="btn btn-primary btn-sm">
                  شروع جستجوی جدید
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {parts.map((part: any, i: number) => <CatalogPartCard key={part.id} part={part} catalogSlug={slug} index={i} />)}
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
      </div>

      <CatalogFilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories || []}
        activeId={activeCat}
        onSelect={(id) => setParam('cat', id ? String(id) : null)}
      />

      <VehicleFilterModal
        open={vehicleOpen}
        onClose={() => setVehicleOpen(false)}
        initialBrandId={brand}
        initialModelId={model ? Number(model) : null}
        initialEngine={engine}
        onApply={applyVehicleFilter}
      />
    </div>
  );
}

export default function CatalogPartsPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loading /></div>}>
      <PartsListContent slug={slug} />
    </Suspense>
  );
}
