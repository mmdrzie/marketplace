'use client';

import { useState, useCallback, Fragment, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { MOCK_CATEGORIES, MOCK_PROVINCES } from '@/lib/mockData';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { SortSelect } from '@/components/search/SortSelect';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { SmartAlert } from '@/components/common/SmartAlert';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';
import { ICON_PATHS } from '@/lib/icons';
import { SkeletonListings } from '@/components/common/Skeleton';

const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

type Filters = {
  category: string;
  province_id: string;
  city_id: string;
  sort: string;
  brand: string;
  model: string;
  year_from: string;
  year_to: string;
  price_min: string;
  price_max: string;
  attributeFilters: Record<string, string>;
};

const DEFAULT_FILTERS: Filters = {
  category: '', province_id: '', city_id: '', sort: 'newest',
  brand: '', model: '', year_from: '', year_to: '',
  price_min: '', price_max: '', attributeFilters: {},
};

function parseFiltersFromParams(sp: URLSearchParams): Filters {
  const attr: Record<string, string> = {};
  return {
    category: sp.get('category') || '',
    province_id: sp.get('province_id') || '',
    city_id: sp.get('city_id') || '',
    sort: sp.get('sort') || 'newest',
    brand: sp.get('brand') || '',
    model: sp.get('model') || '',
    year_from: sp.get('year_from') || '',
    year_to: sp.get('year_to') || '',
    price_min: sp.get('price_min') || '',
    price_max: sp.get('price_max') || '',
    attributeFilters: attr,
  };
}

function filtersToParams(filters: Filters, query: string, page: number): Record<string, unknown> {
  return {
    q: query || undefined,
    category: filters.category || undefined,
    province_id: filters.province_id || undefined,
    city_id: filters.city_id || undefined,
    brand: filters.brand || undefined,
    model: filters.model || undefined,
    year_from: filters.year_from || undefined,
    year_to: filters.year_to || undefined,
    price_min: filters.price_min || undefined,
    price_max: filters.price_max || undefined,
    sort: filters.sort,
    page,
    ...filters.attributeFilters,
  };
}

export default function SearchPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(sp.get('q') || '');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSearchSaved, setIsSearchSaved] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => parseFiltersFromParams(sp));
  const [page, setPage] = useState(Number(sp.get('page')) || 1);

  const debouncedQuery = useDebounce(query, 300);

  const { data: apiCategories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => (await api.get('/categories')).data.data,
    retry: 1, staleTime: 300000,
  });
  const { data: apiProvinces } = useQuery({
    queryKey: queryKeys.categories.provinces,
    queryFn: async () => (await api.get('/provinces')).data.data,
    retry: 1, staleTime: 300000,
  });

  const categories = apiCategories || MOCK_CATEGORIES;
  const provinces = apiProvinces || MOCK_PROVINCES;

  const searchParams = filtersToParams(filters, debouncedQuery, page);

  const { data, isLoading, isError } = useSearch(searchParams);
  const total = data?.meta?.total || 0;
  const lastPage = data?.meta?.last_page || 1;

  // Sync URL on filter/page/query change
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.province_id) params.set('province_id', filters.province_id);
    if (filters.city_id) params.set('city_id', filters.city_id);
    if (filters.sort !== 'newest') params.set('sort', filters.sort);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.model) params.set('model', filters.model);
    if (filters.year_from) params.set('year_from', filters.year_from);
    if (filters.year_to) params.set('year_to', filters.year_to);
    if (filters.price_min) params.set('price_min', filters.price_min);
    if (filters.price_max) params.set('price_max', filters.price_max);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
  }, [debouncedQuery, filters, page, router]);

  const updateFilters = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const categoryLabel = categories?.find(
    (c: { slug: string; name: string }) => c.slug === filters.category
  )?.name;

  const provinceLabel = provinces?.find(
    (p: { id: number; name: string }) => String(p.id) === filters.province_id
  )?.name;

  const activeFilters = [
    filters.brand && { key: 'brand', label: filters.brand },
    filters.model && { key: 'model', label: filters.model },
    filters.year_from && { key: 'year_from', label: `از ${filters.year_from}` },
    filters.year_to && { key: 'year_to', label: `تا ${filters.year_to}` },
    filters.price_min && { key: 'price_min', label: `قیمت از ${Number(filters.price_min).toLocaleString('fa-IR')}` },
    filters.price_max && { key: 'price_max', label: `قیمت تا ${Number(filters.price_max).toLocaleString('fa-IR')}` },
    filters.category && { key: 'category', label: categoryLabel || filters.category },
    filters.province_id && { key: 'province_id', label: provinceLabel || filters.province_id },
  ].filter(Boolean) as { key: string; label: string }[];

  const removeFilter = (key: string) => {
    updateFilters({ ...filters, [key]: '' });
  };

  const renderPagination = () => {
    if (lastPage <= 1) return null;
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - 2);
    const endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < lastPage) {
      if (endPage < lastPage - 1) pages.push('...');
      pages.push(lastPage);
    }
    return pages;
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] -z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              ADVANCED SEARCH
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">کاوش هوشمند در بازار</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base font-light">دقیق‌ترین ماشین‌آلات را با فیلترهای تخصصی پیدا کنید</p>
          </div>
          <button
            onClick={() => setIsSearchSaved(!isSearchSaved)}
            className={`btn ${isSearchSaved ? 'btn-primary' : 'btn-glass'} rounded-full flex items-center gap-2 shrink-0`}
          >
            <Icon d={ICON_PATHS.bell} className="w-4 h-4" />
            {isSearchSaved ? 'اعلان فعال شد' : 'ذخیره جستجو'}
          </button>
        </div>

        <div className="glass rounded-3xl p-3 mb-6 border border-border-subtle">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        <div className="mb-6"><SmartAlert /></div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Desktop Sidebar Filters */}
          <aside className="w-full md:w-80 shrink-0 hidden md:block">
            <div className="sticky top-24 glass rounded-3xl p-6 border border-border-subtle">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon d={ICON_PATHS.filter} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">فیلترهای پیشرفته</h3>
                  <p className="text-[11px] text-muted-foreground">نتایج را دقیق‌تر کنید</p>
                </div>
              </div>
              <FilterPanel
                filters={filters}
                onFilterChange={updateFilters}
                categories={categories}
                provinces={provinces}
              />
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">وارداتی</span>
                </div>
                <select
                  value={filters.attributeFilters.origin || ''}
                  onChange={(e) => updateFilters({ ...filters, attributeFilters: { ...filters.attributeFilters, origin: e.target.value } })}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="">همه خودروها</option>
                  <option value="وارداتی (طرح نوین)">وارداتی (طرح نوین)</option>
                  <option value="وارداتی (شمال)">وارداتی (شمال)</option>
                  <option value="وارداتی (منطقه آزاد)">وارداتی (منطقه آزاد)</option>
                  <option value="وارداتی (تهران)">وارداتی (تهران)</option>
                </select>
                <select
                  value={filters.attributeFilters.import_country || ''}
                  onChange={(e) => updateFilters({ ...filters, attributeFilters: { ...filters.attributeFilters, import_country: e.target.value } })}
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                >
                  <option value="">کشور مبدأ</option>
                  {['آلمان','ژاپن','کره جنوبی','چین','آمریکا','فرانسه','ایتالیا','انگلستان','سوئد','ترکیه','هند'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Main Results Area */}
          <div className="flex-1 min-w-0">

            {/* Results Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 glass rounded-2xl p-4 border border-border-subtle gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="md:hidden btn btn-glass btn-sm rounded-full"
                >
                  <Icon d={ICON_PATHS.filter} className="w-4 h-4 text-primary" />
                  فیلترها
                </button>
                <div>
                  <span className="text-xl md:text-2xl font-bold text-foreground tracking-tighter">{total.toLocaleString('fa-IR')}</span>
                  <span className="text-sm text-muted-foreground mr-1">آگهی یافت شد</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1 p-1 rounded-full bg-surface-2/50 border border-border-subtle">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Icon d={ICON_PATHS.grid} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Icon d={ICON_PATHS.list} className="w-4 h-4" />
                  </button>
                </div>
                <SortSelect
                  value={filters.sort}
                  onChange={(sort) => updateFilters({ ...filters, sort })}
                />
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {activeFilters.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => removeFilter(chip.key)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    {chip.label}
                    <Icon d={ICON_PATHS.close} className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={() => updateFilters(DEFAULT_FILTERS)}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2"
                >
                  حذف همه
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <SkeletonListings count={8} />
            ) : isError ? (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Icon d={ICON_PATHS.alert} className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">خطا در جستجو</h3>
                <p className="text-sm text-muted-foreground mb-4">مشکلی در دریافت نتایج پیش آمده است. دوباره تلاش کنید.</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                  تلاش مجدد
                </button>
              </div>
            ) : data?.data?.length > 0 ? (
              <Fragment>
                <div className={viewMode === 'list' ? 'flex flex-col gap-4' : ''}>
                  <ListingGrid listings={data.data} />
                </div>
                {lastPage > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12" dir="ltr">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center btn btn-glass disabled:opacity-30 disabled:cursor-not-allowed p-0"
                    >
                      <Icon d={ICON_PATHS.chevron_left} className="w-4 h-4" />
                    </button>
                    {renderPagination()?.map((p, i) => (
                      typeof p === 'number' ? (
                        <button
                          key={i}
                          onClick={() => setPage(p)}
                          className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 p-0 flex items-center justify-center ${
                            page === p ? 'btn btn-primary shadow-md shadow-primary/30' : 'btn btn-glass hover:bg-surface-2'
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={i} className="w-10 h-10 flex items-center justify-center text-muted-foreground">...</span>
                      )
                    ))}
                    <button
                      onClick={() => setPage(Math.min(lastPage, page + 1))}
                      disabled={page >= lastPage}
                      className="w-10 h-10 rounded-full flex items-center justify-center btn btn-glass disabled:opacity-30 disabled:cursor-not-allowed p-0"
                    >
                      <Icon d={ICON_PATHS.chevron_right} className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Fragment>
            ) : (
              <div className="bg-surface/30 border border-border rounded-3xl py-24 flex items-center justify-center">
                <EmptyState
                  icon="search"
                  title="نتیجه‌ای یافت نشد"
                  description="متن جستجو یا فیلترهای خود را تغییر دهید"
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilter && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 md:hidden"
            >
              <div className="absolute inset-0 bg-overlay backdrop-blur-md" onClick={() => setShowMobileFilter(false)} />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 bottom-0 w-80 max-w-[85%] glass border-l border-border p-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Icon d={ICON_PATHS.filter} className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-foreground">فیلترها</span>
                  </div>
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Icon d={ICON_PATHS.close} className="w-4 h-4" />
                  </button>
                </div>
                <FilterPanel
                  filters={filters}
                  onFilterChange={(newFilters) => { updateFilters(newFilters); setShowMobileFilter(false); }}
                  categories={categories}
                  provinces={provinces}
                />
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">وارداتی</span>
                  </div>
                  <select
                    value={filters.attributeFilters.origin || ''}
                    onChange={(e) => updateFilters({ ...filters, attributeFilters: { ...filters.attributeFilters, origin: e.target.value } })}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="">همه خودروها</option>
                    <option value="وارداتی (طرح نوین)">وارداتی (طرح نوین)</option>
                    <option value="وارداتی (شمال)">وارداتی (شمال)</option>
                    <option value="وارداتی (منطقه آزاد)">وارداتی (منطقه آزاد)</option>
                    <option value="وارداتی (تهران)">وارداتی (تهران)</option>
                  </select>
                  <select
                    value={filters.attributeFilters.import_country || ''}
                    onChange={(e) => updateFilters({ ...filters, attributeFilters: { ...filters.attributeFilters, import_country: e.target.value } })}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50"
                  >
                    <option value="">کشور مبدأ</option>
                    {['آلمان','ژاپن','کره جنوبی','چین','آمریکا','فرانسه','ایتالیا','انگلستان','سوئد','ترکیه','هند'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
