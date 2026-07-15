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
import { FadeIn } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import type { Category } from '@/types';
import { HEAVY_BRANDS } from '@/lib/brands';
import { SkeletonListings } from '@/components/common/Skeleton';

const BRANDS = HEAVY_BRANDS;

const MODELS_BY_BRAND: Record<string, string[]> = {
  'کوماتسو': ['PC200', 'PC300', 'PC400', 'PC600', 'PC1250', 'D65', 'D85', 'D155', 'D375', 'WA380', 'WA470', 'WA600', 'WA900', 'GD511', 'HM400'],
  'کاترپیلار': ['320D', '330D', '336D', '345D', '365C', '390F', 'D6', 'D8', 'D9', 'D10', 'D11', '950', '966', '980', '988', '992', '140', '16', '725', '740', '777', '789'],
  'هیتاچی': ['ZX135', 'ZX200', 'ZX330', 'ZX470', 'ZX650', 'ZX890', 'EX1200', 'ZW180', 'ZW220', 'ZW310', 'ZW370'],
  'ولوو': ['EC200', 'EC350', 'EC480', 'EC700', 'EC950', 'L60', 'L90', 'L120', 'L180', 'L220', 'G720', 'A25', 'A40', 'A60'],
  'JCB': ['3CX', '4CX', 'JS200', 'JS240', 'JS330', 'JS370', '426', '436', '531', '540'],
  'لیبهر': ['R914', 'R924', 'R936', 'R944', 'R954', 'R966', 'PR724', 'PR754', 'PR776', 'L524', 'L538', 'L556', 'L580'],
  'سانی': ['SY135', 'SY215', 'SY335', 'SY485', 'SY750', 'SY980', 'STC250', 'SRT55', 'SRT95'],
  'XCMG': ['XE60', 'XE215', 'XE335', 'XE470', 'XE900', 'XE3000', 'LW300', 'LW500', 'LW800', 'GR215', 'GR300'],
  'SDLG': ['LG918', 'LG936', 'LG956', 'LG958', 'LG968', 'G9138', 'G9190'],
  'لونگ‌گونگ': ['ZL50', 'CDM855', 'LG8160', 'LG8200', 'ZL30'],
  'دووسان': ['DX225', 'DX300', 'DX380', 'DX420', 'DX480', 'DX520', 'DL200', 'DL300', 'DL420'],
  'هیوندای': ['R210', 'R305', 'R380', 'R480', 'R520', 'R800', 'R1400', 'HL760', 'HL960', 'HL980'],
  'بیلاروس': ['500', '800', '900', '82.1', '1221', '1502'],
  'تراکتور ایران': ['IT285', 'IT399', 'IT450', 'IT620', 'IT850', 'IT900', 'IT1100', 'IT1300'],
  'جان دیر': ['5045', '5075', '5090', '5100', '6125', '6145', '6195', '3150', '624', '644'],
  'مسی فرگوسن': ['285', '375', '399', '485', '4690', '5450', '5630', '5650'],
  'نیوهلند': ['8040', '8050', '9070', 'TT175', 'T6020', 'T6030', 'T7070', 'T7060'],
  'کیس': ['CX75', 'CX210', 'CX350', 'CX490', '845', '750', '1150', '1650'],
  'اسکانیا': ['P360', 'G440', 'G460', 'R420', 'R500', 'R620', 'S730', '113'],
  'ولوو تراکس': ['FH440', 'FH460', 'FH500', 'FH540', 'FH16', 'FM420', 'FM460', 'FM540', 'FMX'],
  'مان': ['TGS 18.440', 'TGS 26.440', 'TGS 33.480', 'TGX 18.480', 'TGX 26.500', 'TGX 18.640'],
  'رنو تراکس': ['K440', 'T460', 'T520', 'K520', 'C460', 'C520', 'Magnum 520'],
  'بنز': ['Actros 1840', 'Actros 2640', 'Actros 3340', 'Actros 4148', 'Atego 1518', 'Axor 1835', '1923', 'Unimog U400', 'Zetros'],
  'فوتون': ['Auman', 'BJ3253', 'BJ3313', 'Foton Lovol'],
  'کامیونت': ['NPR', 'NQR', 'FVR', 'FTR', 'Giga', 'Forward'],
  'هینو': ['300', '500', '700', 'Dutro', 'Profia'],
};

const CURRENT_YEAR = new Date().getFullYear() - 621;
const YEARS = Array.from({ length: 26 }, (_, i) => String(CURRENT_YEAR - i));

export default function AllListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const queryClient = useQueryClient();
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const sort = searchParams.get('sort') || 'newest';
  const provinceId = searchParams.get('province_id') || '';
  const categorySlug = searchParams.get('category_slug') || '';
  const brand = searchParams.get('brand') || '';
  const model = searchParams.get('model') || '';
  const yearFrom = searchParams.get('year_from') || '';
  const yearTo = searchParams.get('year_to') || '';
  const page = Number(searchParams.get('page')) || 1;

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

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

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        {/* بک‌گراند داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-20 space-y-8">
          
          {/* هدر صفحه */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
                BROWSE LISTINGS
              </span>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
                همه آگهی‌ها
              </h1>
              <p className="text-muted-foreground mt-2 text-base md:text-lg font-light">
                جستجو میان هزاران آگهی فعال و تخصصی
              </p>
            </div>
            <div className="glass rounded-2xl px-6 py-3 text-center shrink-0 border border-border-subtle">
              <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tighter">{total.toLocaleString('fa-IR')}</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5 uppercase tracking-widest">آگهی یافت شد</span>
            </div>
          </div>

          {/* Mobile: filter button */}
          <div className="md:hidden flex gap-3">
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
            <button
              onClick={() => setShowMobileFilter(true)}
              className="shrink-0 w-12 h-12 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>

          {/* Desktop: filter panel (hidden on mobile) */}
          <div className="hidden md:block glass rounded-3xl p-4 md:p-6 space-y-4 shadow-xl border border-border-subtle">
            
            {/* ردیف اول: جستجو + سلکت‌ها */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="relative md:col-span-2 lg:col-span-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="جستجو در آگهی‌ها..."
                  className="w-full pr-10 pl-3 py-2.5 md:py-3 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
                />
              </div>
              
              <GlassSelect
                value={categorySlug}
                onChange={(val) => setParam('category_slug', val)}
                options={(categories as Category[])?.map((c) => ({ value: c.slug, label: c.name })) || []}
                placeholder="همه دسته‌بندی‌ها"
              />

              <GlassSelect
                value={provinceId}
                onChange={(val) => setParam('province_id', val)}
                options={(provinces as Array<{ id: number; name: string }>)?.map((p) => ({ value: String(p.id), label: p.name })) || []}
                placeholder="همه استان‌ها"
              />

              <GlassSelect
                value={sort}
                onChange={(val) => setParam('sort', val)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-4 border-t border-border-subtle">
              <GlassSelect
                value={brand}
                onChange={(val) => { setParam('brand', val); if (val !== brand) setParam('model', ''); }}
                options={BRANDS.map((b) => ({ value: b, label: b }))}
                placeholder="همه برندها"
              />
              <GlassSelect
                value={model}
                onChange={(val) => setParam('model', val)}
                options={(brand ? (MODELS_BY_BRAND[brand] || []) : []).map((m) => ({ value: m, label: m }))}
                placeholder="همه مدل‌ها"
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
                  className="absolute end-0 top-0 bottom-0 w-80 max-w-[85%] glass border-s border-border p-6 overflow-y-auto overscroll-contain"
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <span className="font-bold text-foreground">فیلترها</span>
                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <div className="space-y-4">
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
                      value={brand}
                      onChange={(val) => { setParam('brand', val); setParam('model', ''); }}
                      options={BRANDS.map((b) => ({ value: b, label: b }))}
                      placeholder="همه برندها"
                    />
                    <GlassSelect
                      value={model}
                      onChange={(val) => { setParam('model', val); }}
                      options={(brand ? (MODELS_BY_BRAND[brand] || []) : []).map((m) => ({ value: m, label: m }))}
                      placeholder="همه مدل‌ها"
                      disabled={!brand}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <GlassSelect
                        value={yearFrom}
                        onChange={(val) => { setParam('year_from', val); }}
                        options={YEARS.map((y) => ({ value: y, label: y }))}
                        placeholder="سال از"
                      />
                      <GlassSelect
                        value={yearTo}
                        onChange={(val) => { setParam('year_to', val); }}
                        options={YEARS.map((y) => ({ value: y, label: y }))}
                        placeholder="سال تا"
                      />
                    </div>
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
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
                  >
                    اعمال فیلترها
                  </button>
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
                <div className="flex justify-center items-center gap-2 pt-8" dir="ltr">
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
            <div className="bg-surface/30 border border-border rounded-3xl py-16 md:py-24 flex items-center justify-center">
              <EmptyState icon="search" title="آگهی یافت نشد" description="لطفاً فیلترها یا عبارت جستجو را تغییر دهید" />
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}