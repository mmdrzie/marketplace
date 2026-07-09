'use client';

import { useCallback } from 'react';
import { AttributeFilters } from './AttributeFilters';
import { HEAVY_BRANDS } from '@/lib/brands';
import { GlassSelect } from '@/components/common/GlassSelect';
import type { Category } from '@/types';

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

const YEARS = Array.from({ length: 26 }, (_, i) => String(1405 - i));

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

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: Category[];
  provinces: Array<{ id: number; name: string; cities: Array<{ id: number; name: string }> }>;
}

export function FilterPanel({ filters, onFilterChange, categories, provinces }: FilterPanelProps) {
  const emit = useCallback((next: Partial<Filters>) => {
    onFilterChange({ ...filters, ...next });
  }, [filters, onFilterChange]);

  const handleAttrChange = useCallback((name: string, value: string) => {
    emit({ attributeFilters: { ...filters.attributeFilters, [name]: value } });
  }, [filters, emit]);

  const resetFilters = useCallback(() => {
    onFilterChange({
      category: '',
      province_id: '',
      city_id: '',
      sort: 'newest',
      brand: '',
      model: '',
      year_from: '',
      year_to: '',
      price_min: '',
      price_max: '',
      attributeFilters: {},
    });
  }, [onFilterChange]);

  const hasActiveFilters = filters.category || filters.province_id || filters.brand || filters.model || filters.year_from || filters.year_to || filters.price_min || filters.price_max || Object.keys(filters.attributeFilters).length > 0;

  const allCategories = categories ?? [];
  const allProvinces = provinces ?? [];
  const selectedProvince = provinces?.find((p) => p.id === Number(filters.province_id));
  const cities = selectedProvince?.cities ?? [];
  const selectedBrandModels = MODELS_BY_BRAND[filters.brand] || [];

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
          onChange={(val) => emit({ category: val, brand: '', model: '', attributeFilters: {} })}
          options={allCategories?.map((cat: Category) => ({ value: cat.slug, label: cat.name })) || []}
          placeholder="همه دسته‌بندی‌ها"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">برند</label>
          <GlassSelect
            value={filters.brand}
            onChange={(val) => emit({ brand: val, model: '' })}
            options={BRANDS.map((b) => ({ value: b, label: b }))}
            placeholder="همه برندها"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-2">مدل محصول</label>
          <GlassSelect
            value={filters.model}
            onChange={(val) => emit({ model: val })}
            options={selectedBrandModels.map((m) => ({ value: m, label: m }))}
            placeholder="همه مدل‌ها"
            disabled={!filters.brand}
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
        <label className="block text-xs font-bold text-muted-foreground mb-2">محدوده قیمت</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            value={filters.price_min}
            onChange={(e) => emit({ price_min: e.target.value })}
            className="glass-input rounded-xl px-3 py-2 text-xs text-foreground"
            placeholder="حداقل"
            type="number"
          />
          <input
            value={filters.price_max}
            onChange={(e) => emit({ price_max: e.target.value })}
            className="glass-input rounded-xl px-3 py-2 text-xs text-foreground"
            placeholder="حداکثر"
            type="number"
          />
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

      <AttributeFilters categorySlug={filters.category || null} filters={filters.attributeFilters} onChange={handleAttrChange} />
    </div>
  );
}
