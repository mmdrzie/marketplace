'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePartsCategories, useCreateSuggestion } from '@/hooks/usePartsV2';
import { VehicleSelector } from '@/components/parts/VehicleSelector';

export default function NewSuggestionPage() {
  const router = useRouter();
  const { data: categories } = usePartsCategories();
  const createSuggestion = useCreateSuggestion();

  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [oemNumber, setOemNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSuggestion.mutateAsync({
      name, partNumber, oemNumber, manufacturer, description,
      brandId, modelId: modelId || undefined,
      yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
    });
    router.push('/store/suggestions');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">پیشنهاد قطعه جدید</h1>
        <p className="text-sm text-muted-foreground mt-1">اگر قطعه‌ای در کاتالوگ نیست، آن را به ادمین پیشنهاد دهید</p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-border-subtle space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">نام قطعه *</label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="مثال: لنت ترمز جلو"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">شماره فنی</label>
            <input
              type="text" value={partNumber} onChange={(e) => setPartNumber(e.target.value)}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">OEM</label>
            <input
              type="text" value={oemNumber} onChange={(e) => setOemNumber(e.target.value)}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">خودروی سازگار</label>
          <VehicleSelector
            onSelect={(bId, mId) => { setBrandId(bId); setModelId(mId); }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">تولیدکننده</label>
            <input
              type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">سال از</label>
            <input
              type="number" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">سال تا</label>
            <input
              type="number" value={yearTo} onChange={(e) => setYearTo(e.target.value)}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">توضیحات</label>
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 py-3 btn btn-ghost rounded-xl">
            انصراف
          </button>
          <button
            type="submit"
            disabled={createSuggestion.isPending || !name}
            className="flex-1 py-3 btn btn-primary rounded-xl disabled:opacity-50"
          >
            {createSuggestion.isPending ? 'در حال ارسال...' : 'ارسال برای ادمین'}
          </button>
        </div>
      </form>
    </div>
  );
}
