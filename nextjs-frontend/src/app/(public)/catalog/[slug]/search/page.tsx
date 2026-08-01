'use client';

import { useMemo, Suspense } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCatalog, useCatalogCategories } from '@/hooks/useCatalogs';
import { TuningGroupSelector } from '@/components/catalog/TuningGroupSelector';
import { CatalogPartCard } from '@/components/catalog/CatalogPartCard';
import { TuningFilterChips } from '@/components/catalog/TuningFilterChips';
import { VehicleSelector } from '@/components/parts/VehicleSelector';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { SkeletonListings } from '@/components/common/Skeleton';

type Step = 'vehicle' | 'group' | 'results';

const VALID_STEPS = ['vehicle', 'group', 'results'];

function buildParams(sp: URLSearchParams): { step: Step; brand: string | null; model: string | null; year: string | null; cat: string | null; q: string | null } {
  const m = sp.get('mode');
  return {
    step: m && VALID_STEPS.includes(m) ? (m as Step) : 'vehicle',
    brand: sp.get('brand'),
    model: sp.get('model'),
    year: sp.get('year'),
    cat: sp.get('cat'),
    q: sp.get('q'),
  };
}

function WizardContent({ slug }: { slug: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { step, brand, model, year, cat, q } = useMemo(() => buildParams(sp), [sp]);

  const { data: catalog } = useCatalog(slug);

  const go = (mode: Step, extra?: Record<string, string | null>) => {
    const p = new URLSearchParams();
    p.set('mode', mode);
    if (brand) p.set('brand', brand);
    if (model) p.set('model', model);
    if (year) p.set('year', year);
    if (cat) p.set('cat', cat);
    if (q) p.set('q', q);
    if (extra) for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v); else p.delete(k);
    router.push(`/catalog/${slug}/search?${p.toString()}`, { scroll: false });
  };

  const { data: categories } = useCatalogCategories(slug);

  const categoryTitles = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: any[] | undefined) => {
      if (!nodes) return;
      for (const n of nodes) {
        map.set(String(n.id), n.title);
        walk(n.children);
      }
    };
    walk(categories || []);
    return map;
  }, [categories]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['catalog-search-infinite', slug, { brand, model, year, cat, q }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string | number> = { page: pageParam, limit: 24 };
      if (cat) params.category = cat;
      if (brand) params.brand_id = brand;
      if (model) params.model_id = Number(model);
      if (year) params.year = Number(year);
      if (q) params.q = q;
      const res = await api.get(`/v2/catalogs/${slug}/parts`, { params });
      return res.data.data as { rows: any[]; total: number };
    },
    getNextPageParam: (last, allPages) => (allPages.length * 24 < last.total ? allPages.length + 1 : undefined),
    enabled: step === 'results',
  });

  const parts = useMemo(() => data?.pages.flatMap((p) => p.rows || []) || [], [data]);
  const total = data?.pages[0]?.total ?? parts.length;

  const catalogLabel = catalog?.label || slug;

  const goBack = () => {
    const backMap: Record<Step, Step | null> = { vehicle: null, group: 'vehicle', results: 'group' };
    const prev = backMap[step];
    if (!prev) router.push(`/catalog/${slug}`);
    else go(prev);
  };

  const renderBreadcrumb = () => {
    if (step === 'vehicle') return null;
    const crumbs: { label: string; mode: Step }[] = [{ label: `جستجوی ${catalogLabel}`, mode: 'vehicle' }];
    if (step === 'group') crumbs.push({ label: 'انتخاب گروه', mode: 'group' });
    else if (step === 'results') crumbs.push({ label: 'نتایج', mode: 'results' });
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

  const renderVehicle = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">برند و مدل خودرو</h2>
        <p className="text-sm text-muted-foreground">مرحله ۱ — خودروی خود را انتخاب کنید</p>
      </div>
      <div className="max-w-md mx-auto space-y-4">
        <VehicleSelector
          onSelect={(bId, mId, y) => go('group', { brand: bId, model: mId !== null ? String(mId) : null, year: y !== null ? String(y) : null })}
          initialBrandId={brand || undefined}
          initialModelId={model ? Number(model) : undefined}
          initialYear={year ? Number(year) : undefined}
        />
        <button
          onClick={() => go('group')}
          disabled={!brand}
          className="w-full py-3 btn btn-primary rounded-xl disabled:opacity-40 text-sm font-bold"
        >
          ادامه
        </button>
      </div>
    </>
  );

  const renderGroup = () => (
    <>
      <div className="text-center max-w-xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-foreground mb-2">گروه قطعه</h2>
        <p className="text-sm text-muted-foreground">مرحله ۲ — گروه موردنظر را انتخاب کنید</p>
      </div>
      <div className="max-w-4xl mx-auto">
        <TuningGroupSelector
          categories={categories || []}
          onSelectGroup={(id, title) => go('results', { cat: String(id) })}
          onSelectType={(id) => go('results', { cat: String(id) })}
        />
      </div>
    </>
  );

  const renderResults = () => (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xl">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
          <input
            type="text"
            defaultValue={q || ''}
            onChange={(e) => go('results', { q: e.target.value || null })}
            placeholder="جستجو در نتایج..."
            className="w-full bg-surface/60 border border-border rounded-2xl py-3 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
          />
        </div>
        <button onClick={() => go('vehicle')} className="btn btn-ghost btn-sm shrink-0">تغییر خودرو</button>
        <button onClick={() => go('group')} className="btn btn-ghost btn-sm shrink-0">تغییر گروه</button>
      </div>

      <TuningFilterChips
        chips={[
          ...(brand ? [{ label: `برند: ${brand}`, onRemove: () => go('vehicle') }] : []),
          ...(model ? [{ label: `مدل: ${model}`, onRemove: () => go('vehicle') }] : []),
          ...(year ? [{ label: `سال: ${year}`, onRemove: () => go('vehicle') }] : []),
          ...(cat && categoryTitles.get(cat) ? [{ label: categoryTitles.get(cat)!, onRemove: () => go('group') }] : []),
          ...(q ? [{ label: `"${q}"`, onRemove: () => go('results', { q: null }) }] : []),
        ]}
      />

      <div className="flex items-center justify-between mt-4 mb-4">
        <p className="text-sm text-muted-foreground">{total.toLocaleString('fa-IR')} قطعه سازگار یافت شد</p>
      </div>

      {isLoading ? (
        <SkeletonListings count={8} />
      ) : isError ? (
        <EmptyState title="خطا در دریافت قطعات" description="مجددا تلاش کنید" icon="search" />
      ) : parts.length === 0 ? (
        <EmptyState
          title="قطعه‌ای با این مشخصات یافت نشد"
          description="خودرو یا گروه دیگری را انتخاب کنید"
          icon="search"
          action={<button onClick={() => go('vehicle')} className="btn btn-primary btn-sm">انتخاب خودروی دیگر</button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {parts.map((part: any, i: number) => <CatalogPartCard key={part.id} part={part} catalogSlug={slug} index={i} />)}
          </div>
          {hasNextPage && (
            <div className="text-center pt-6">
              <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn btn-glass btn-lg">
                {isFetchingNextPage ? 'در حال بارگذاری...' : 'مشاهده بیشتر'}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        {renderBreadcrumb()}
        <button onClick={goBack} className="btn-icon w-12 h-12 shrink-0" aria-label="مرحله قبل">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 lg:w-5 lg:h-5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      {step === 'vehicle' && renderVehicle()}
      {step === 'group' && renderGroup()}
      {step === 'results' && renderResults()}
    </div>
  );
}

export default function CatalogSearchPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loading /></div>}>
      <WizardContent slug={slug} />
    </Suspense>
  );
}
