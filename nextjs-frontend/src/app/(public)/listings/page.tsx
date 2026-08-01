'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { GlassSelect } from '@/components/common/GlassSelect';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { FadeIn } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import { FilterButton } from '@/components/common/FilterButton';
import type { Category } from '@/types';
import { SkeletonListings } from '@/components/common/Skeleton';
import { getBrandsByCategory, getModelsByBrand } from '@/lib/taxonomy';

const CURRENT_YEAR = new Date().getFullYear() - 621;
const YEARS = Array.from({ length: 26 }, (_, i) => String(CURRENT_YEAR - i));

export default function AllListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const queryClient = useQueryClient();
  const [showFilter, setShowFilter] = useState(false);
  
  const sort = searchParams.get('sort') || 'newest';
  const provinceId = searchParams.get('province_id') || '';
  const categorySlug = searchParams.get('category_slug') || '';
  const brand = searchParams.get('brand') || '';
  const model = searchParams.get('model') || '';
  const yearFrom = searchParams.get('year_from') || '';
  const yearTo = searchParams.get('year_to') || '';
  const page = Number(searchParams.get('page')) || 1;

  const hasActiveFilters = searchParams.toString().length > 0;

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    router.push(pathname, { scroll: false });
    setShowFilter(false);
  }, [router, pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set('q', searchInput);
      else params.delete('q');
      params.set('page', '1');
      const currentQ = searchParams.get('q') || '';
      if (searchInput !== currentQ) {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, pathname, router, searchParams]);

  const { data: apiProvinces } = useQuery({
    queryKey: queryKeys.categories.provinces,
    queryFn: async () => { const res = await api.get('/provinces'); return res.data.data; },
    retry: 1,
    staleTime: 300000,
  });

  const { data: apiCategories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data; },
    retry: 1,
    staleTime: 300000,
  });

  const provinces = apiProvinces ?? [];
  const categories = apiCategories ?? [];

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.listings.allListings(page, searchParams.toString()),
    queryFn: async () => {
      const res = await api.get('/listings', {
        params: {
          q: searchParams.get('q') || undefined,
          sort: searchParams.get('sort') || 'newest',
          province_id: searchParams.get('province_id') || undefined,
          category: searchParams.get('category_slug') || undefined,
          brand: searchParams.get('brand') || undefined,
          model: searchParams.get('model') || undefined,
          year_from: searchParams.get('year_from') || undefined,
          year_to: searchParams.get('year_to') || undefined,
          page,
          per_page: 24,
        },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const listings = data?.data || [];
  const total = data?.meta?.total || 0;
  const lastPage = data?.meta?.last_page || 1;

  useEffect(() => {
    if (page < lastPage) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.listings.allListings(page + 1, searchParams.toString()),
        queryFn: async () => {
          const res = await api.get('/listings', { params: { ...Object.fromEntries(searchParams.entries()), page: page + 1, per_page: 24 } });
          return res.data;
        },
        staleTime: 30000,
      });
    }
  }, [page, lastPage, searchParams, queryClient]);

  const brands = getBrandsByCategory(categorySlug || undefined);
  const models = getModelsByBrand(brand, categorySlug || undefined);

  useEffect(() => {
    if (showFilter) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFilter]);

  return (
    <FadeIn>
      {/* افزودن overflow-x-hidden برای جلوگیری از اسکرول افقی در موبایل */}
      <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* بک‌گراند داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        {/* افزودن pt-24 برای فاصله از هدر ثابت سایت */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 md:pt-28 pb-12 md:pb-16 space-y-6 md:space-y-8">
          
          {/* هدر صفحه */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
                BROWSE LISTINGS
              </span>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground">
                همه آگهی‌ها
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-lg font-light">
                جستجو میان هزاران آگهی فعال و تخصصی
              </p>
            </div>
            <div className="glass rounded-2xl px-5 py-3 text-center shrink-0 border border-border-subtle self-start sm:self-end">
              <span className="text-xl md:text-3xl font-bold text-foreground tracking-tighter">{total.toLocaleString('fa-IR')}</span>
              <span className="text-[10px] md:text-[11px] text-muted-foreground block mt-0.5 uppercase tracking-widest">آگهی یافت شد</span>
            </div>
          </div>

          {/* Search + Filter button (mobile & desktop) */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="جستجو در آگهی‌ها..."
                className="w-full pr-10 pl-3 py-3 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
              />
            </div>
            <FilterButton
              onClick={() => setShowFilter(true)}
              count={hasActiveFilters ? searchParams.toString().split('&').filter(p => p.includes('=') && !p.startsWith('page')).length : 0}
              className="px-4 md:px-5 h-12"
            />
          </div>

          {/* Filter Popup (mobile & desktop) */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              >
                <div className="absolute inset-0 bg-overlay backdrop-blur-md" onClick={() => setShowFilter(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="relative w-full max-w-lg md:max-w-2xl max-h-[85dvh] rounded-2xl md:rounded-3xl glass border-border overflow-y-auto overscroll-contain shadow-2xl"
                >
                  {/* sticky header */}
                  <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-border bg-background/80 backdrop-blur-xl">
                    <span className="font-bold text-foreground">فیلترها</span>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="بستن"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* ردیف اول: سلکت‌های اصلی */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <GlassSelect
                        value={categorySlug}
                        onChange={(val) => { setParam('category_slug', val); }}
                        options={(categories as Category[])?.map((c) => ({ value: c.slug, label: c.name })) || []}
                        placeholder="همه دسته‌بندی‌ها"
                      />
                      <GlassSelect
                        value={provinceId}
                        onChange={(val) => { setParam('province_id', val); }}
                        options={(provinces as Array<{ id: number; name: string }>)?.map((p) => ({ value: String(p.id), label: p.name })) || []}
                        placeholder="همه استان‌ها"
                      />
                      <GlassSelect
                        value={sort}
                        onChange={(val) => { setParam('sort', val); }}
                        options={[
                          { value: 'newest', label: 'جدیدترین' },
                          { value: 'oldest', label: 'قدیمی‌ترین' },
                          { value: 'price_asc', label: 'ارزان‌ترین' },
                          { value: 'price_desc', label: 'گران‌ترین' },
                        ]}
                        placeholder="مرتب‌سازی"
                      />
                    </div>

                    {/* ردیف دوم: برند، مدل، سال ساخت */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border-subtle">
                      <SearchableSelect
                        value={brand}
                        onChange={(val) => { setParam('brand', val); setParam('model', ''); }}
                        options={brands.map((b) => ({ value: b, label: b }))}
                        placeholder="همه برندها"
                        searchPlaceholder="جستجوی برند..."
                      />
                      <SearchableSelect
                        value={model}
                        onChange={(val) => setParam('model', val)}
                        options={models.map((m) => ({ value: m, label: m }))}
                        placeholder="همه مدل‌ها"
                        searchPlaceholder="جستجوی مدل..."
                        disabled={!brand}
                      />
                      <GlassSelect
                        value={yearFrom}
                        onChange={(val) => setParam('year_from', val)}
                        options={YEARS.map((y) => ({ value: y, label: y }))}
                        placeholder="سال از"
                      />
                      <GlassSelect
                        value={yearTo}
                        onChange={(val) => setParam('year_to', val)}
                        options={YEARS.map((y) => ({ value: y, label: y }))}
                        placeholder="سال تا"
                      />
                    </div>
                  </div>

                  {/* sticky footer */}
                  <div className="sticky bottom-0 z-10 px-5 py-4 border-t border-border bg-background/80 backdrop-blur-xl flex items-center gap-3">
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-surface-2 transition-colors">
                        پاک کردن فیلترها
                      </button>
                    )}
                    <button onClick={() => setShowFilter(false)} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors">
                      نمایش {total.toLocaleString('fa-IR')} آگهی
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* نتایج جستجو */}
          {isLoading ? (
            <SkeletonListings count={8} />
          ) : listings.length > 0 ? (
            <StaggerContainer className="space-y-8">
              <ListingGrid listings={listings} />
              
              {lastPage > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8 flex-wrap" dir="ltr">
                  <button
                    onClick={() => setParam('page', String(Math.max(1, page - 1)))}
                    disabled={page <= 1}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed p-0 flex items-center justify-center"
                    aria-label="قبلی"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                  {Array.from({ length: Math.min(lastPage, 5) }).map((_, i) => {
                    const start = Math.max(1, Math.min(page - 2, lastPage - 4));
                    const p = start + i;
                    if (p > lastPage) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setParam('page', String(p))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 p-0 flex items-center justify-center ${
                          page === p ? 'btn btn-primary shadow-md shadow-primary/30' : 'btn btn-ghost hover:bg-surface-2'
                        }`}
                        aria-label={`صفحه ${p}`}
                        aria-current={page === p ? 'page' : undefined}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setParam('page', String(Math.min(lastPage, page + 1)))}
                    disabled={page >= lastPage}
                    className="w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 btn btn-ghost disabled:opacity-30 disabled:cursor-not-allowed p-0 flex items-center justify-center"
                    aria-label="بعدی"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                  </button>
                </div>
              )}
            </StaggerContainer>
          ) : (
            <div className="bg-surface/30 border border-border rounded-3xl py-16 md:py-24 flex flex-col items-center justify-center gap-4">
              <EmptyState icon="search" title="آگهی یافت نشد" description="لطفاً فیلترها یا عبارت جستجو را تغییر دهید" />
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn btn-primary px-6 py-2 text-sm">
                  پاک کردن فیلترها
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}