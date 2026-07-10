'use client';

import { useState } from 'react';
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
import { EmptyState } from '@/components/common/EmptyState';
import { FadeIn, StaggerContainer } from '@/components/common/MotionDiv';
import { SkeletonListings } from '@/components/common/Skeleton';
import type { Category } from '@/types';
import { HEAVY_BRANDS } from '@/lib/brands';

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

  const filterContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">برند</label>
          <GlassSelect
            value={brand}
            onChange={(val) => { setBrand(val); setModel(''); }}
            options={BRANDS.map((b) => ({ value: b, label: b }))}
            placeholder="همه برندها"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block text-foreground">مدل محصول</label>
          <GlassSelect
            value={model}
            onChange={(val) => setModel(val)}
            options={(brand ? (MODELS_BY_BRAND[brand] || []) : []).map((m) => ({ value: m, label: m }))}
            placeholder="همه مدل‌ها"
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
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-surface shadow-xl p-4 overflow-y-auto">
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
