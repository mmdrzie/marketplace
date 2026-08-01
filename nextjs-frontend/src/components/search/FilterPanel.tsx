'use client';

import { useCallback, useMemo, useRef } from 'react';
import { AttributeFilters } from './AttributeFilters';
import { GlassSelect } from '@/components/common/GlassSelect';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { getBrandsByCategory, getModelsByBrand } from '@/lib/taxonomy';
import type { Category } from '@/types';

const CURRENT_YEAR = new Date().getFullYear() - 621;
const YEARS = Array.from({ length: 26 }, (_, i) => String(CURRENT_YEAR - i));

const CUSTOM_OPTION = '__custom__';

const PRICE_PRESETS = [
  { value: '300000000', label: '۳۰۰ میلیون' },
  { value: '500000000', label: '۵۰۰ میلیون' },
  { value: '700000000', label: '۷۰۰ میلیون' },
  { value: '1000000000', label: '۱ میلیارد' },
  { value: '1500000000', label: '۱ میلیارد و ۵۰۰ میلیون' },
  { value: '3000000000', label: '۳ میلیارد' },
  { value: '5000000000', label: '۵ میلیارد' },
  { value: '7000000000', label: '۷ میلیارد' },
  { value: '10000000000', label: '۱۰ میلیارد' },
  { value: '15000000000', label: '۱۵ میلیارد' },
  { value: CUSTOM_OPTION, label: 'وارد کردن مقدار دلخواه' },
];

const MILEAGE_PRESETS = [
  { value: '1000', label: '۱,۰۰۰ کیلومتر' },
  { value: '5000', label: '۵,۰۰۰ کیلومتر' },
  { value: '10000', label: '۱۰,۰۰۰ کیلومتر' },
  { value: '20000', label: '۲۰,۰۰۰ کیلومتر' },
  { value: '30000', label: '۳۰,۰۰۰ کیلومتر' },
  { value: '40000', label: '۴۰,۰۰۰ کیلومتر' },
  { value: '50000', label: '۵۰,۰۰۰ کیلومتر' },
  { value: '60000', label: '۶۰,۰۰۰ کیلومتر' },
  { value: '70000', label: '۷۰,۰۰۰ کیلومتر' },
  { value: '80000', label: '۸۰,۰۰۰ کیلومتر' },
  { value: '90000', label: '۹۰,۰۰۰ کیلومتر' },
  { value: '100000', label: '۱۰۰,۰۰۰ کیلومتر' },
  { value: '150000', label: '۱۵۰,۰۰۰ کیلومتر' },
  { value: CUSTOM_OPTION, label: 'وارد کردن به صورت دستی' },
];

const COLORS = [
  { value: 'white', label: 'سفید', css: 'bg-white border border-border' },
  { value: 'black', label: 'مشکی', css: 'bg-gray-900 text-white' },
  { value: 'silver', label: 'نقره‌ای', css: 'bg-gray-300' },
  { value: 'gray', label: 'نوک مدادی', css: 'bg-gray-500' },
  { value: 'blue', label: 'آبی', css: 'bg-blue-600' },
  { value: 'brown', label: 'قهوه‌ای', css: 'bg-amber-800 text-white' },
  { value: 'red', label: 'قرمز', css: 'bg-red-600' },
  { value: 'green', label: 'یشمی', css: 'bg-emerald-700 text-white' },
];

// Body condition options specific to commercial vehicles (truck, bus, van, etc.)
const COMMERCIAL_BODY_CONDITIONS = [
  'بدون رنگ', 'لپی رنگ', 'لپی تعویض', 'سینی جلو رنگ', 'سینی جلو تعویض',
  'قیچی رنگ', 'یک لکه رنگ', 'چند لکه رنگ', 'دو لکه رنگ', 'دور رنگ',
  'صافکاری بدون رنگ', 'گلگیر رنگ', 'کاپوت تعویض', 'گلگیر تعویض',
  'کامل رنگ', 'درب تعویض', 'یک درب رنگ', 'کاپوت رنگ', 'دو درب رنگ',
  'تصادفی', 'اتاق تعویض', 'سوخته', 'اوراقی', 'با سابقه تعمیر',
  'بدون سابقه تعمیر',
];

const SUBCAT_LABEL: Record<string, string> = {
  vehicles: 'نوع بدنه',
  'construction-machinery': 'نوع ماشین‌آلات',
  'agricultural-machinery': 'نوع ماشین‌آلات',
  'industrial-machinery': 'نوع تجهیزات',
  motorcycles: 'نوع موتورسیکلت',
  'bus-van': 'نوع وسیله',
  truck: 'نوع محور',
  trailer: 'نوع تریلر',
  'light-truck': 'نوع کاربری',
  'tractor-head': 'نوع کشنده',
  parts: 'دسته قطعات',
};

const COMMERCIAL_SUBCATS = new Set([
  'truck', 'bus-van', 'light-truck', 'tractor-head', 'trailer',
  'bus', 'minibus', 'van',
  'kshndh-tk-mhvr', 'kshndh-dv-mhvr', 'kamyvn-tk-mhvr', 'kamyvn-dv-mhvr',
  'kamyvn-chhar-mhvr', 'kamyvnt-khavr', 'tryl-r-dv-mhvr', 'tryl-r-sh-mhvr',
  'tryl-r-kmrshkn-bvzhy',
]);

export type Filters = {
  category: string;
  subcategories: string;
  province_id: string;
  city_id: string;
  sort: string;
  brand: string;
  model: string;
  year_from: string;
  year_to: string;
  price_min: string;
  price_max: string;
  seller_type: string;
  mileage_from: string;
  mileage_to: string;
  mileage_zero: string;
  gearbox: string;
  has_photo: string;
  has_price: string;
  color: string;
  fuel_type: string;
  special_case: string;
  body_condition: string;
  cylinders: string;
  drivetrain: string;
  attributeFilters: Record<string, string>;
};

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: Category[];
  provinces: Array<{ id: number; name: string; cities: Array<{ id: number; name: string }> }>;
}

function findCategory(slug: string, cats: Category[]): Category | null {
  for (const cat of cats) {
    if (cat.slug === slug) return cat;
    if (cat.children) {
      const found = findCategory(slug, cat.children);
      if (found) return found;
    }
  }
  return null;
}

export function FilterPanel({ filters, onFilterChange, categories, provinces }: FilterPanelProps) {
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const emit = useCallback((next: Partial<Filters>) => {
    onFilterChange({ ...filtersRef.current, ...next });
  }, [onFilterChange]);

  const handleAttrChange = useCallback((name: string, value: string) => {
    emit({ attributeFilters: { ...filtersRef.current.attributeFilters, [name]: value } });
  }, [emit]);

  const resetFilters = useCallback(() => {
    onFilterChange({
      category: '',
      subcategories: '',
      province_id: '',
      city_id: '',
      sort: 'newest',
      brand: '',
      model: '',
      year_from: '',
      year_to: '',
      price_min: '',
      price_max: '',
      seller_type: '',
      mileage_from: '',
      mileage_to: '',
      mileage_zero: '',
      gearbox: '',
      has_photo: '',
      has_price: '',
      color: '',
      fuel_type: '',
      special_case: '',
      body_condition: '',
      cylinders: '',
      drivetrain: '',
      attributeFilters: {},
    });
  }, [onFilterChange]);

  const hasActiveFilters = filters.category || filters.subcategories || filters.province_id || filters.brand || filters.model || filters.year_from || filters.year_to || filters.price_min || filters.price_max || filters.seller_type || filters.mileage_from || filters.mileage_to || filters.mileage_zero || filters.gearbox || filters.has_photo || filters.has_price || filters.color || filters.fuel_type || filters.special_case || filters.body_condition || filters.cylinders || filters.drivetrain || Object.keys(filters.attributeFilters).length > 0;

  const subcatLabel = filters.category ? SUBCAT_LABEL[filters.category] : '';
  const selectedSubcats = useMemo(() => new Set(filters.subcategories ? filters.subcategories.split(',').filter(Boolean) : []), [filters.subcategories]);

  const toggleSubcat = useCallback((slug: string) => {
    const next = new Set(selectedSubcats);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    emit({ subcategories: Array.from(next).join(',') });
  }, [emit, selectedSubcats]);

  // Static local data — instant, no API calls
  const brands = getBrandsByCategory(filters.category || undefined);
  const models = getModelsByBrand(filters.brand, filters.category || undefined);

  const allCategories = categories ?? [];
  const allProvinces = provinces ?? [];
  const selectedProvince = provinces?.find((p) => p.id === Number(filters.province_id));
  const cities = selectedProvince?.cities ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full"></div>
          <h3 className="font-bold text-foreground text-sm">فیلترهای پیشرفته</h3>
        </div>
        {hasActiveFilters && (
          <button type="button" onClick={resetFilters} className="btn btn-ghost btn-sm text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></svg>
            پاک کردن
          </button>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-2">دسته‌بندی</label>
        <GlassSelect
          value={filters.category}
          onChange={(val) => emit({ category: val, subcategories: '', brand: '', model: '', attributeFilters: {} })}
          options={allCategories?.filter((cat: Category) => cat.slug !== 'parts').map((cat: Category) => ({ value: cat.slug, label: cat.name })) || []}
          placeholder="همه دسته‌بندی‌ها"
        />
      </div>

      {(() => {
        const selectedCat = filters.category ? findCategory(filters.category, allCategories) : null;
        if (!selectedCat?.children?.length) return null;
        return (
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-2">{subcatLabel || 'زیردسته'}</label>
            <div className="flex flex-wrap gap-2">
              {selectedCat.children.map((child) => {
                const active = selectedSubcats.has(child.slug);
                return (
                  <button
                    key={child.slug}
                    type="button"
                    onClick={() => toggleSubcat(child.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {child.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-2">فروشنده</label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'همه' },
            { value: 'personal', label: 'شخصی' },
            { value: 'dealership', label: 'نمایشگاه' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => emit({ seller_type: opt.value })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filters.seller_type === opt.value || (!filters.seller_type && opt.value === '')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">برند</label>
          <SearchableSelect
            value={filters.brand}
            onChange={(val) => emit({ brand: val, model: '' })}
            options={brands.map((b) => ({ value: b, label: b }))}
            placeholder="همه برندها"
            searchPlaceholder="جستجوی برند..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">مدل محصول</label>
          <SearchableSelect
            value={filters.model}
            onChange={(val) => emit({ model: val })}
            options={models.map((m) => ({ value: m, label: m }))}
            placeholder="همه مدل‌ها"
            searchPlaceholder="جستجوی مدل..."
            disabled={!filters.brand}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-2">گیربکس</label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'همه' },
            { value: 'automatic', label: 'اتوماتیک' },
            { value: 'manual', label: 'دنده‌ای' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => emit({ gearbox: opt.value })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filters.gearbox === opt.value || (!filters.gearbox && opt.value === '')
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">استان</label>
          <GlassSelect
            value={filters.province_id}
            onChange={(val) => emit({ province_id: val, city_id: '' })}
            options={allProvinces?.map((p: { id: number; name: string }) => ({ value: String(p.id), label: p.name })) || []}
            placeholder="همه استان‌ها"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">شهر</label>
          <GlassSelect
            value={filters.city_id}
            onChange={(val) => emit({ city_id: val })}
            options={(cities as Array<{ id: number; name: string }>).map((c) => ({ value: String(c.id), label: c.name }))}
            placeholder="همه شهرها"
            disabled={!filters.province_id}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">سال ساخت از</label>
          <GlassSelect
            value={filters.year_from}
            onChange={(val) => emit({ year_from: val })}
            options={YEARS.map((y) => ({ value: y, label: y }))}
            placeholder="سال از"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">سال ساخت تا</label>
          <GlassSelect
            value={filters.year_to}
            onChange={(val) => emit({ year_to: val })}
            options={YEARS.map((y) => ({ value: y, label: y }))}
            placeholder="سال تا"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-2">کارکرد (کیلومتر)</label>
        <button
          type="button"
          onClick={() => emit({ mileage_zero: filters.mileage_zero === '1' ? '' : '1', mileage_from: '', mileage_to: '' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all mb-3 ${
            filters.mileage_zero === '1'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          صفر کیلومتر
        </button>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <GlassSelect
              value={MILEAGE_PRESETS.find((p) => p.value === filters.mileage_from)?.value || (filters.mileage_from ? CUSTOM_OPTION : '')}
              onChange={(val) => emit({ mileage_from: val === CUSTOM_OPTION ? '' : val, mileage_zero: '' })}
              options={MILEAGE_PRESETS}
              placeholder="از کارکرد"
              disabled={filters.mileage_zero === '1'}
            />
            {(!filters.mileage_from || !MILEAGE_PRESETS.some((p) => p.value === filters.mileage_from)) && (
              <input
                value={filters.mileage_from}
                onChange={(e) => emit({ mileage_from: e.target.value, mileage_zero: '' })}
                className="glass-input rounded-xl px-3 py-2 text-xs text-foreground mt-2"
                placeholder="مقدار دلخواه"
                type="number"
                disabled={filters.mileage_zero === '1'}
              />
            )}
          </div>
          <div>
            <GlassSelect
              value={MILEAGE_PRESETS.find((p) => p.value === filters.mileage_to)?.value || (filters.mileage_to ? CUSTOM_OPTION : '')}
              onChange={(val) => emit({ mileage_to: val === CUSTOM_OPTION ? '' : val, mileage_zero: '' })}
              options={MILEAGE_PRESETS}
              placeholder="تا کارکرد"
              disabled={filters.mileage_zero === '1'}
            />
            {(!filters.mileage_to || !MILEAGE_PRESETS.some((p) => p.value === filters.mileage_to)) && (
              <input
                value={filters.mileage_to}
                onChange={(e) => emit({ mileage_to: e.target.value, mileage_zero: '' })}
                className="glass-input rounded-xl px-3 py-2 text-xs text-foreground mt-2"
                placeholder="مقدار دلخواه"
                type="number"
                disabled={filters.mileage_zero === '1'}
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-2">محدوده قیمت</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <GlassSelect
              value={PRICE_PRESETS.find((p) => p.value === filters.price_min)?.value || (filters.price_min ? CUSTOM_OPTION : '')}
              onChange={(val) => emit({ price_min: val === CUSTOM_OPTION ? '' : val })}
              options={PRICE_PRESETS}
              placeholder="از قیمت"
            />
            {(!filters.price_min || !PRICE_PRESETS.some((p) => p.value === filters.price_min)) && (
              <input
                value={filters.price_min}
                onChange={(e) => emit({ price_min: e.target.value })}
                className="glass-input rounded-xl px-3 py-2 text-xs text-foreground mt-2"
                placeholder="مقدار دلخواه"
                type="number"
              />
            )}
          </div>
          <div>
            <GlassSelect
              value={PRICE_PRESETS.find((p) => p.value === filters.price_max)?.value || (filters.price_max ? CUSTOM_OPTION : '')}
              onChange={(val) => emit({ price_max: val === CUSTOM_OPTION ? '' : val })}
              options={PRICE_PRESETS}
              placeholder="تا قیمت"
            />
            {(!filters.price_max || !PRICE_PRESETS.some((p) => p.value === filters.price_max)) && (
              <input
                value={filters.price_max}
                onChange={(e) => emit({ price_max: e.target.value })}
                className="glass-input rounded-xl px-3 py-2 text-xs text-foreground mt-2"
                placeholder="مقدار دلخواه"
                type="number"
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'has_photo' as const, label: 'عکس دار' },
          { key: 'has_price' as const, label: 'قیمت دار' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => emit({ [opt.key]: filters[opt.key] === '1' ? '' : '1' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filters[opt.key] === '1'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filters.category === 'vehicles' && (
        <>
          {!COMMERCIAL_SUBCATS.has(filters.category) && [...selectedSubcats].some(s => COMMERCIAL_SUBCATS.has(s)) ? (
            <div className="border-t border-border/40 pt-4">
              <div className="mb-3">
                <label className="block text-xs font-bold text-muted-foreground mb-2">رنگ بدنه</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => emit({ color: filters.color === c.value ? '' : c.value })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        filters.color === c.value
                          ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-1'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.css}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border/30 pt-3">
                <label className="block text-xs font-bold text-muted-foreground mb-2">وضعیت بدنه</label>
                <div className="flex flex-wrap gap-2">
                  {COMMERCIAL_BODY_CONDITIONS.map((v) => (
                    <button key={v} type="button" onClick={() => emit({ body_condition: filters.body_condition === v ? '' : v })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.body_condition === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="border-t border-border/40 pt-4">
                <span className="block text-xs font-bold text-muted-foreground mb-3">ویژگی‌های خودرو</span>

                <div className="mb-3">
                  <label className="block text-xs font-bold text-muted-foreground mb-2">رنگ بدنه</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => emit({ color: filters.color === c.value ? '' : c.value })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                          filters.color === c.value
                            ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-1'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${c.css}`} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 mb-3">
                  <label className="block text-xs font-bold text-muted-foreground mb-2">نوع سوخت</label>
                  <div className="flex flex-wrap gap-2">
                    {['بنزینی', 'دوگانه سوز', 'دیزلی', 'برقی', 'برقی با ژنراتور', 'هیبریدی', 'پلاگین هیبرید', 'هیبرید ملایم'].map((v) => (
                      <button key={v} type="button" onClick={() => emit({ fuel_type: filters.fuel_type === v ? '' : v })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.fuel_type === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 mb-3">
                  <label className="block text-xs font-bold text-muted-foreground mb-2">موارد خاص</label>
                  <div className="flex flex-wrap gap-2">
                    {['کلاسیک', 'آفرود', 'منطقه آزاد'].map((v) => (
                      <button key={v} type="button" onClick={() => emit({ special_case: filters.special_case === v ? '' : v })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.special_case === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 mb-3">
                  <label className="block text-xs font-bold text-muted-foreground mb-2">وضعیت بدنه</label>
                  <div className="flex flex-wrap gap-2">
                    {['خط و خش جزئی', 'بدون رنگ', 'یک لکه رنگ', 'چند لکه رنگ', 'دو لکه رنگ', 'صافکاری بدون رنگ', 'دور رنگ', 'گلگیر رنگ', 'گلگیر تعویض', 'کاپوت تعویض', 'کامل رنگ', 'درب تعویض', 'یک درب رنگ', 'کاپوت رنگ', 'دو درب رنگ', 'تصادفی', 'اتاق تعویض', 'سوخته', 'اوراقی'].map((v) => (
                      <button key={v} type="button" onClick={() => emit({ body_condition: filters.body_condition === v ? '' : v })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.body_condition === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3 mb-3">
                  <label className="block text-xs font-bold text-muted-foreground mb-2">تعداد سیلندر</label>
                  <div className="flex flex-wrap gap-2">
                    {['4 سیلندر', '6 سیلندر', '8 سیلندر', '10 سیلندر', '12 سیلندر'].map((v) => (
                      <button key={v} type="button" onClick={() => emit({ cylinders: filters.cylinders === v ? '' : v })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.cylinders === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/30 pt-3">
                  <label className="block text-xs font-bold text-muted-foreground mb-2">دیفرانسیل</label>
                  <div className="flex flex-wrap gap-2">
                    {['تک دیفرانسیل', 'دیفرانسیل عقب', 'دیفرانسیل جلو', 'دو دیفرانسیل', 'تمام چرخ متحرک'].map((v) => (
                      <button key={v} type="button" onClick={() => emit({ drivetrain: filters.drivetrain === v ? '' : v })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.drivetrain === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {COMMERCIAL_SUBCATS.has(filters.category) && (
        <div className="border-t border-border/40 pt-4">
          <div className="mb-3">
            <label className="block text-xs font-bold text-muted-foreground mb-2">رنگ بدنه</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => emit({ color: filters.color === c.value ? '' : c.value })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    filters.color === c.value
                      ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-1'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.css}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border/30 pt-3">
            <label className="block text-xs font-bold text-muted-foreground mb-2">وضعیت بدنه</label>
            <div className="flex flex-wrap gap-2">
              {COMMERCIAL_BODY_CONDITIONS.map((v) => (
                <button key={v} type="button" onClick={() => emit({ body_condition: filters.body_condition === v ? '' : v })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filters.body_condition === v ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{v}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <AttributeFilters categorySlug={filters.category || null} filters={filters.attributeFilters} onChange={handleAttrChange} />
    </div>
  );
}
