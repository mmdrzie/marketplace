'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { GlassSelect } from '@/components/common/GlassSelect';
import { SkeletonText } from '@/components/common/Skeleton';

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

interface Props {
  onSelect: (brandId: string | null, modelId: number | null, year: number | null) => void;
  initialBrandId?: string;
  initialModelId?: number;
  initialYear?: number;
  categorySlug?: string;
}

export function VehicleSelector({ onSelect, initialBrandId, initialModelId, initialYear, categorySlug }: Props) {
  const [brandId, setBrandId] = useState(initialBrandId || '');
  const [modelId, setModelId] = useState(initialModelId ? String(initialModelId) : '');
  const [year, setYear] = useState(initialYear ? String(initialYear) : '');

  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useQuery({
    queryKey: ['vehicle-brands', categorySlug],
    queryFn: async () => {
      const params = categorySlug ? { category_slug: categorySlug } : {};
      const res = await api.get('/v2/vehicles/brands', { params });
      return (res.data?.data || res.data || []) as Brand[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['vehicle-models', brandId],
    queryFn: async () => {
      const res = await api.get('/v2/vehicles/models', { params: { brand_id: brandId } });
      return (res.data?.data || res.data || []) as Model[];
    },
    enabled: !!brandId,
    staleTime: 10 * 60 * 1000,
  });

  const brandOptions = (brands || []).map((b) => ({ value: String(b.id), label: b.name }));
  const modelOptions = (models || []).map((m) => ({ value: String(m.id), label: m.name }));

  const years = Array.from({ length: 41 }, (_, i) => {
    const y = 1370 + i;
    return { value: String(y), label: String(y) };
  });

  const handleBrandChange = (val: string) => {
    setBrandId(val);
    setModelId('');
    onSelect(val || null, null, year ? parseInt(year) : null);
  };

  const handleModelChange = (val: string) => {
    setModelId(val);
    onSelect(brandId || null, val ? parseInt(val) : null, year ? parseInt(year) : null);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
    onSelect(brandId || null, modelId ? parseInt(modelId) : null, val ? parseInt(val) : null);
  };

  if (brandsError) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
        بارگذاری برندها با مشکل مواجه شد. لطفاً دوباره تلاش کنید.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex-1 min-w-[160px]">
        {brandsLoading ? (
          <SkeletonText className="h-12 rounded-xl" />
        ) : (
          <SearchableSelect
            value={brandId}
            onChange={handleBrandChange}
            options={brandOptions}
            placeholder="برند"
            searchPlaceholder="جستجوی برند..."
          />
        )}
      </div>

      <div className="flex-1 min-w-[140px]">
        {modelsLoading ? (
          <SkeletonText className="h-12 rounded-xl" />
        ) : (
          <GlassSelect
            value={modelId}
            onChange={handleModelChange}
            options={modelOptions}
            placeholder="مدل"
            disabled={!brandId}
          />
        )}
      </div>

      <div className="flex-1 min-w-[100px]">
        <GlassSelect
          value={year}
          onChange={handleYearChange}
          options={years}
          placeholder="سال"
        />
      </div>
    </div>
  );
}
