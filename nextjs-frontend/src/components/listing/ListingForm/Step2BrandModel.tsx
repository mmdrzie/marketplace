'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { GlassSelect } from '@/components/common/GlassSelect';
import { SkeletonText } from '@/components/common/Skeleton';
import type { JSX } from 'react';

const Icons = {
  car: <><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 002 2h10a2 2 0 002-2M7 17v-4M17 17v-4M7 11h10" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /></>,
  speedometer: <><path d="M12 20a8 8 0 100-16 8 8 0 000 16z" /><path d="M12 14l2-4-4 2 2-4" /><path d="M12 14l-2.5-2.5" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
};

const Icon = ({ path, className = "h-5 w-5" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
);

const inputSelectClasses = "w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 appearance-none disabled:opacity-40 disabled:cursor-not-allowed";

interface Brand { id: number; name: string; }
interface Model { id: number; name: string; }
interface Variant { id: number; name: string; }

export interface Step2BrandModelData {
  vehicleModelId: number | null;
  vehicleVariantId: number | null;
  year: string;
  mileage: string;
}

interface Step2BrandModelProps {
  data: Step2BrandModelData;
  onChange: (data: Step2BrandModelData) => void;
  categorySlug?: string | null;
}

export function Step2BrandModel({ data, onChange, categorySlug }: Step2BrandModelProps) {
  const [brandId, setBrandId] = useState('');

  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useQuery({
    queryKey: ['vehicle-brands', categorySlug],
    queryFn: async () => {
      const params = categorySlug ? { category: categorySlug } : {};
      const res = await api.get('/v2/vehicles/brands', { params });
      return (res.data?.data || res.data || []) as Brand[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['vehicle-models', brandId],
    queryFn: async () => {
      const res = await api.get(`/v2/vehicles/brands/${brandId}/models`);
      return (res.data?.data || res.data || []) as Model[];
    },
    enabled: !!brandId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: variants, isLoading: variantsLoading } = useQuery({
    queryKey: ['vehicle-variants', data.vehicleModelId],
    queryFn: async () => {
      const res = await api.get(`/v2/vehicles/models/${data.vehicleModelId}/variants`);
      return (res.data?.data || res.data || []) as Variant[];
    },
    enabled: !!data.vehicleModelId,
    staleTime: 10 * 60 * 1000,
  });

  const brandOptions = useMemo(() => (brands || []).map((b) => ({ value: String(b.id), label: b.name })), [brands]);
  const modelOptions = useMemo(() => (models || []).map((m) => ({ value: String(m.id), label: m.name })), [models]);
  const variantOptions = useMemo(() => (variants || []).map((v) => ({ value: String(v.id), label: v.name })), [variants]);
  const years = useMemo(() => Array.from({ length: 41 }, (_, i) => ({ value: String(1370 + i), label: String(1370 + i) })), []);

  const selectedBrand = brands?.find((b) => String(b.id) === brandId);

  const updateBrand = (val: string) => {
    setBrandId(val);
    if (!val) {
      onChange({ ...data, vehicleModelId: null, vehicleVariantId: null });
    } else {
      const found = brands?.find((b) => String(b.id) === val);
      if (found && found.id === Number(val)) {
        const currentModelInBrand = models?.find((m) => m.id === data.vehicleModelId);
        if (!currentModelInBrand) {
          onChange({ ...data, vehicleModelId: null, vehicleVariantId: null });
        }
      }
    }
  };

  const updateModel = (val: string) => {
    if (!val) {
      onChange({ ...data, vehicleModelId: null, vehicleVariantId: null });
    } else {
      const selectedModel = models?.find((m) => String(m.id) === val);
      if (selectedModel) {
        onChange({ ...data, vehicleModelId: selectedModel.id, vehicleVariantId: null });
      }
    }
  };

  const updateVariant = (val: string) => {
    onChange({ ...data, vehicleVariantId: val ? parseInt(val) : null });
  };

  if (brandsError) {
    return (
      <div className="animate-fade-in">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">2</div>
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 2</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">برند و مدل</h2>
          <p className="text-muted-foreground text-sm font-light">بارگذاری برندها با مشکل مواجه شد. لطفاً صفحه را مجدداً بارگذاری کنید.</p>
        </div>
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          خطا در دریافت لیست برندها
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">2</div>
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 2</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">برند و مدل وسیله نقلیه</h2>
        <p className="text-muted-foreground text-sm font-light">برند، مدل و سال ساخت وسیله نقلیه خود را انتخاب کنید.</p>
      </div>

      <div className="space-y-6">
        {brandsLoading ? (
          <div className="space-y-3">
            <SkeletonText className="h-14 rounded-xl w-full" />
            <SkeletonText className="h-14 rounded-xl w-full" />
            <SkeletonText className="h-14 rounded-xl w-1/2" />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">برند (سازنده) <span className="text-destructive">*</span></label>
              <SearchableSelect
                value={brandId}
                onChange={updateBrand}
                options={brandOptions}
                placeholder="برند را انتخاب کنید..."
                searchPlaceholder="جستجوی برند..."
              />
            </div>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">مدل <span className="text-destructive">*</span></label>
              {modelsLoading ? (
                <SkeletonText className="h-14 rounded-xl" />
              ) : (
                <GlassSelect
                  value={data.vehicleModelId ? String(data.vehicleModelId) : ''}
                  onChange={updateModel}
                  options={modelOptions}
                  placeholder={brandId ? 'مدل را انتخاب کنید...' : 'ابتدا برند را انتخاب کنید'}
                  disabled={!brandId}
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">تیپ / زیرمدل</label>
              {variantsLoading ? (
                <SkeletonText className="h-14 rounded-xl" />
              ) : (
                <GlassSelect
                  value={data.vehicleVariantId ? String(data.vehicleVariantId) : ''}
                  onChange={updateVariant}
                  options={variantOptions}
                  placeholder={data.vehicleModelId ? 'تیپ را انتخاب کنید (اختیاری)' : 'ابتدا مدل را انتخاب کنید'}
                  disabled={!data.vehicleModelId || !variants?.length}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                  <Icon path={Icons.calendar} className="h-3.5 w-3.5 inline ml-1" />
                  سال ساخت
                </label>
                <GlassSelect
                  value={data.year}
                  onChange={(val) => onChange({ ...data, year: val })}
                  options={years}
                  placeholder="انتخاب سال"
                />
              </div>
              <div>
                <label className="block text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                  <Icon path={Icons.speedometer} className="h-3.5 w-3.5 inline ml-1" />
                  کارکرد (کیلومتر)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={data.mileage}
                    onChange={(e) => onChange({ ...data, mileage: e.target.value })}
                    className={inputSelectClasses}
                    placeholder="مثال: ۵۰۰۰۰"
                    min={0}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {selectedBrand && (
          <div className="flex items-center gap-2 p-3 bg-surface-2/30 border border-border-subtle rounded-xl text-xs text-muted-foreground">
            <span>برند انتخاب شده:</span>
            <span className="font-bold text-foreground">{selectedBrand.name}</span>
            {data.vehicleModelId && models?.find((m) => m.id === data.vehicleModelId) && (
              <>
                <span className="mx-1">/</span>
                <span className="font-bold text-foreground">{models.find((m) => m.id === data.vehicleModelId)!.name}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
