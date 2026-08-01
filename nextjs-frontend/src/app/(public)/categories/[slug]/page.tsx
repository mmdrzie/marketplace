'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useListings } from '@/hooks/useListings';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { SortSelect } from '@/components/search/SortSelect';
import { AttributeFilters } from '@/components/search/AttributeFilters';
import { GlassSelect } from '@/components/common/GlassSelect';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { EmptyState } from '@/components/common/EmptyState';
import { FadeIn } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import { SkeletonListings } from '@/components/common/Skeleton';
import type { Category } from '@/types';
import { getBrandsByCategory, getModelsByBrand } from '@/lib/taxonomy';

const CURRENT_YEAR = new Date().getFullYear() - 621;
const YEARS = Array.from({ length: 26 }, (_, i) => String(CURRENT_YEAR - i));

const CATEGORY_ICONS: Record<string, string> = {
  car: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2m10 0v-5m-10 5v-5m-4 0h18M7 17a2 2 0 11-4 0 2 2 0 014 0zm14 0a2 2 0 11-4 0 2 2 0 014 0z",
  truck: "M10 17h4V5H2v12h3m10 0v-5h4l3 3v2h-3m-10 0a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z",
  trailer: "M3 5h11v12H3z M14 8h4l3 3v6h-7 M7 17a2 2 0 11-4 0 2 2 0 014 0z M18 17a2 2 0 11-4 0 2 2 0 014 0z",
  pickup: "M20 8h-3V4H3v12h2m13 0h2v-5l-2-2h-3l-2-2H8 M7 17a2 2 0 11-4 0 2 2 0 014 0z M19 17a2 2 0 11-4 0 2 2 0 014 0z",
  loader: "M2 20h20M4 20V8h12v12M16 20v-6h4v6M8 12h4M8 16h4 M7 20a2 2 0 11-4 0 2 2 0 014 0z M19 20a2 2 0 11-4 0 2 2 0 014 0z",
  excavator: "M2 20h20M4 20V8h12v12M16 20v-6h4v6M8 12h4M8 16h4 M3 12l4-4 5 5-4 4z",
  bulldozer: "M2 20h20M4 20V8h12v12M16 20v-6h4v6M8 12h4M8 16h4 M3 12h2 M3 16h2",
  crane: "M3 21V3h18l-6 4H3 M9 21V7 M9 11h6 M7 17h4",
  tractor: "M3 4h9v7H3zM12 11h4l3 3v3h-7zM6 18a2 2 0 100-4 2 2 0 000 4zm10 0a3 3 0 100-6 3 3 0 000 6z",
  'combine-harvester': "M2 20h20M4 20V8h12v12M16 20v-6h4v6M8 12h4M8 16h4 M7 20a2 2 0 11-4 0 2 2 0 014 0z M19 20a2 2 0 11-4 0 2 2 0 014 0z M20 10l-4 2",
  forklift: "M3 20V6h4v14M7 20V10h4v10M3 20h10M14 20V4l6 2v14M14 20h8 M3 16h4",
  motorcycle: "M3 14a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zm-7-3l3-5h4l2 3m-7 4h6",
  generator: "M12 2L3 7v6c0 5 9 9 9 9s9-4 9-9V7l-9-5z M12 8v4 M9 10h6",
  bicycle: "M5 17a2 2 0 100-4 2 2 0 000 4zm14 0a2 2 0 100-4 2 2 0 000 4zM5 15h6l4-7h3 M9 4h3l1 4-3 7",
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [sort, setSort] = useState('newest');
  const [provinceId, setProvinceId] = useState('');
  const [cityId, setCityId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [attrFilters, setAttrFilters] = useState<Record<string, string>>({});
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const mobileFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMobileFilter) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showMobileFilter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMobileFilter) setShowMobileFilter(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showMobileFilter]);

  useEffect(() => {
    if (showMobileFilter) mobileFilterRef.current?.focus();
  }, [showMobileFilter]);

  const { data: apiCategories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data; },
    retry: 1,
    staleTime: 300000,
  });

  const allCategories = apiCategories ?? [];
  const category = (allCategories as Category[])?.find((c) => c.slug === slug);

  const { data: provinces } = useQuery({
    queryKey: queryKeys.categories.provinces,
    queryFn: async () => { const res = await api.get('/provinces'); return res.data.data; },
    retry: 1,
    staleTime: 300000,
  });

  const allProvinces = provinces ?? [];

  const { data, isLoading } = useListings({
    category: slug,
    sort,
    brand: brand || undefined,
    model: model || undefined,
    year_from: yearFrom || undefined,
    year_to: yearTo || undefined,
    province_id: provinceId || undefined,
    city_id: cityId || undefined,
    ...attrFilters,
  });

  const brands = getBrandsByCategory(slug);
  const models = getModelsByBrand(brand, slug);

  const filterContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">برند</label>
          <SearchableSelect
            value={brand}
            onChange={(val) => { setBrand(val); setModel(''); }}
            options={brands.map((b) => ({ value: b, label: b }))}
            placeholder="همه برندها"
            searchPlaceholder="جستجوی برند..."
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">مدل محصول</label>
          <SearchableSelect
            value={model}
            onChange={(val) => setModel(val)}
            options={models.map((m) => ({ value: m, label: m }))}
            placeholder="همه مدل‌ها"
            searchPlaceholder="جستجوی مدل..."
            disabled={!brand}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">سال ساخت از</label>
          <GlassSelect
            value={yearFrom}
            onChange={(val) => setYearFrom(val)}
            options={YEARS.map((y) => ({ value: y, label: y }))}
            placeholder="سال از"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">سال ساخت تا</label>
          <GlassSelect
            value={yearTo}
            onChange={(val) => setYearTo(val)}
            options={YEARS.map((y) => ({ value: y, label: y }))}
            placeholder="سال تا"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block text-foreground">استان</label>
        <GlassSelect
          value={provinceId}
          onChange={(val) => setProvinceId(val)}
          options={(allProvinces as Array<{ id: number; name: string }>)?.map((p) => ({ value: String(p.id), label: p.name })) || []}
          placeholder="همه استان‌ها"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block text-foreground">شهر</label>
        <GlassSelect
          value={cityId}
          onChange={(val) => setCityId(val)}
          options={(provinceId ? ((allProvinces as Array<{ id: number; name: string; cities: Array<{ id: number; name: string }> }>).find((p) => p.id === Number(provinceId))?.cities ?? []) : []).map((c) => ({ value: String(c.id), label: c.name }))}
          placeholder="همه شهرها"
          disabled={!provinceId}
        />
      </div>
      <AttributeFilters
        categorySlug={slug}
        filters={attrFilters}
        onChange={(name, value) => setAttrFilters((prev) => ({ ...prev, [name]: value }))}
      />
    </div>
  );

  return (
    <FadeIn>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d={CATEGORY_ICONS[slug] || "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"} />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{category?.name || slug}</h1>
              <p className="text-sm text-muted-foreground">
                {data?.meta?.total || 0} آگهی در این دسته‌بندی
              </p>
            </div>
          </div>
          {category?.children && category.children.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {category.children.map((child: Category) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="px-3 py-1.5 bg-surface-2 border border-border-subtle rounded-xl text-sm text-foreground hover:bg-surface-3 hover:border-primary/30 transition-all"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Desktop sidebar filters */}
          <aside className="w-64 shrink-0 hidden md:block">
            <div className="sticky top-20 bg-surface border border-border-subtle rounded-2xl p-4">
              {filterContent}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
                  className="md:hidden btn btn-ghost"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  فیلترها
                </button>
                <p className="text-sm text-muted-foreground">
                  {data?.meta?.total || 0} آگهی
                </p>
              </div>
              <SortSelect value={sort} onChange={setSort} />
            </div>

            {/* Listing grid */}
            {isLoading ? (
              <SkeletonListings count={6} />
            ) : data?.data?.length > 0 ? (
              <StaggerContainer>
                <ListingGrid listings={data.data} />
                {data?.meta?.last_page > 1 && (
                  <div className="flex justify-center gap-2 mt-8" dir="ltr">
                    {Array.from({ length: Math.min(data.meta.last_page, 10) }).map((_, i) => {
                      const page = i + 1;
                      return (
                        <Link
                          key={page}
                          href={`/categories/${slug}?page=${page}`}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
                            page === (data.meta.current_page || 1)
                              ? 'btn btn-primary'
                              : 'btn btn-ghost'
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </StaggerContainer>
            ) : (
              <EmptyState
                title="آگهی‌ای یافت نشد"
                description={`هنوز آگهی‌ای در دسته‌بندی ${category?.name || slug} ثبت نشده است`}
              />
            )}
          </div>
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilter && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-overlay" onClick={() => setShowMobileFilter(false)} />
            <div ref={mobileFilterRef} role="dialog" aria-modal="true" aria-label="فیلترها" tabIndex={-1}
              className="absolute left-0 top-0 bottom-0 w-80 bg-surface shadow-xl p-4 overflow-y-auto outline-none">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-foreground">فیلترها</span>
                <button onClick={() => setShowMobileFilter(false)} className="btn btn-ghost btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {filterContent}
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
