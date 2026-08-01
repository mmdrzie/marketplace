'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Modal } from '@/components/common/Modal';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { GlassSelect } from '@/components/common/GlassSelect';
import { SkeletonText } from '@/components/common/Skeleton';

export const ENGINE_TYPES = [
  { value: 'petrol', label: 'بنزینی' },
  { value: 'diesel', label: 'دیزلی' },
  { value: 'hybrid', label: 'هیبرید' },
  { value: 'electric', label: 'برقی' },
  { value: 'cng', label: 'گازسوز (CNG)' },
  { value: 'bifuel', label: 'دوگانه‌سوز' },
];

interface Brand {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialBrandId?: string | null;
  initialModelId?: number | null;
  initialEngine?: string | null;
  onApply: (brandId: string | null, modelId: number | null, engine: string | null) => void;
}

export function VehicleFilterModal({ open, onClose, initialBrandId, initialModelId, initialEngine, onApply }: Props) {
  const [brandId, setBrandId] = useState(initialBrandId || '');
  const [modelId, setModelId] = useState(initialModelId ? String(initialModelId) : '');
  const [engine, setEngine] = useState(initialEngine || '');

  const { data: brands, isLoading: brandsLoading, isError: brandsError } = useQuery({
    queryKey: ['vehicle-brands-filter'],
    queryFn: async () => {
      const res = await api.get('/v2/vehicles/brands');
      return (res.data?.data || res.data || []) as Brand[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const { data: models, isLoading: modelsLoading } = useQuery({
    queryKey: ['vehicle-models-filter', brandId],
    queryFn: async () => {
      const res = await api.get('/v2/vehicles/models', { params: { brand_id: brandId } });
      return (res.data?.data || res.data || []) as Model[];
    },
    enabled: !!brandId,
    staleTime: 10 * 60 * 1000,
  });

  const engineOptions = ENGINE_TYPES;

  const apply = () => {
    onApply(brandId || null, modelId ? parseInt(modelId) : null, engine || null);
    onClose();
  };

  const clear = () => {
    setBrandId('');
    setModelId('');
    setEngine('');
  };

  return (
    <Modal open={open} onClose={onClose} title="فیلتر خودرو" className="max-w-lg">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">برند</label>
          {brandsLoading ? (
            <SkeletonText className="h-12 rounded-xl" />
          ) : (
            <SearchableSelect
              value={brandId}
              onChange={(val) => { setBrandId(val); setModelId(''); }}
              options={(brands || []).map((b) => ({ value: String(b.id), label: b.name }))}
              placeholder="انتخاب برند"
              searchPlaceholder="جستجوی برند..."
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">مدل</label>
          {modelsLoading ? (
            <SkeletonText className="h-12 rounded-xl" />
          ) : (
            <GlassSelect
              value={modelId}
              onChange={setModelId}
              options={(models || []).map((m) => ({ value: String(m.id), label: m.name }))}
              placeholder="انتخاب مدل"
              disabled={!brandId}
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">نوع موتور</label>
          <GlassSelect
            value={engine}
            onChange={setEngine}
            options={engineOptions}
            placeholder="انتخاب نوع موتور"
          />
        </div>

        {brandsError && (
          <p className="text-xs text-destructive">بارگذاری برندها با مشکل مواجه شد. لطفاً دوباره تلاش کنید.</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={clear}
            className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm"
          >
            پاک کردن
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm"
          >
            اعمال فیلتر
          </button>
        </div>
      </div>
    </Modal>
  );
}
