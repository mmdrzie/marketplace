'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { useCreateListing, useUpdateListing } from '@/hooks/useListings';
import { useAutoSave } from '@/hooks/useAutoSave';
import { toast } from '@/components/common/Toast';
import { Step1Category } from './Step1Category';
import { Step2Basic } from './Step2Basic';
import { Step3Attributes } from './Step3Attributes';
import { Step4Images } from './Step4Images';
import { Step5Preview } from './Step5Preview';
import { cn } from '@/lib/utils';

const STEPS = ['دسته‌بندی', 'اطلاعات پایه', 'مشخصات', 'تصاویر', 'پیش‌نمایش'];

interface ListingFormProps {
  listingId?: string | number;
  initialData?: {
    category_id: number;
    title: string;
    description: string;
    price: number | null;
    price_type: string;
    province_id: number;
    city_id: number;
    attributes: Record<string, string>;
    images: Array<{ id: number; url: string; is_primary: boolean }>;
  };
  redirectPath?: string;
}

export function ListingForm({ listingId, initialData, redirectPath }: ListingFormProps) {
  const router = useRouter();
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();

  const isEditMode = !!listingId;

  const [step, setStep] = useState(0);
  const [categoryId, setCategoryId] = useState<number | null>(initialData?.category_id ?? null);
  const [basicData, setBasicData] = useState({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price != null ? String(initialData.price) : '',
    price_type: initialData?.price_type ?? 'fixed',
    province_id: initialData?.province_id != null ? String(initialData.province_id) : '',
    city_id: initialData?.city_id != null ? String(initialData.city_id) : '',
  });
  const [attributes, setAttributes] = useState<Record<string, string>>(initialData?.attributes ?? {});
  const [objectKeys, setObjectKeys] = useState<string[]>([]);
  const [skipImages, setSkipImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const initialized = useRef(false);
  const draftNotified = useRef(false);

  const { data: allCategories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data as Array<{ id: number; slug: string; name: string }>; },
    staleTime: 300000,
  });
  const { data: provinces } = useQuery({
    queryKey: queryKeys.categories.provinces,
    queryFn: async () => { const res = await api.get('/provinces'); return res.data.data as Array<{ id: number; name: string; cities: Array<{ id: number; name: string }> }>; },
    staleTime: 120000,
  });
  const categorySlug = useMemo(() => {
    if (!categoryId || !allCategories) return null;
    return allCategories.find((c: { id: number }) => c.id === categoryId)?.slug ?? null;
  }, [categoryId, allCategories]);
  const categoryName = useMemo(() => {
    if (!categoryId || !allCategories) return undefined;
    return allCategories.find((c: { id: number }) => c.id === categoryId)?.name;
  }, [categoryId, allCategories]);
  const provinceName = useMemo(() => {
    if (!basicData.province_id || !provinces) return undefined;
    return provinces.find((p: { id: number }) => p.id === Number(basicData.province_id))?.name;
  }, [basicData.province_id, provinces]);
  const cityName = useMemo(() => {
    if (!basicData.city_id || !basicData.province_id || !provinces) return undefined;
    const p = provinces.find((pr: { id: number }) => pr.id === Number(basicData.province_id));
    return p?.cities.find((c: { id: number }) => c.id === Number(basicData.city_id))?.name;
  }, [basicData.city_id, basicData.province_id, provinces]);

  useEffect(() => {
    if (initialized.current || !initialData) return;
    initialized.current = true;
    setCategoryId(initialData.category_id);
    setBasicData({
      title: initialData.title,
      description: initialData.description,
      price: initialData.price != null ? String(initialData.price) : '',
      price_type: initialData.price_type,
      province_id: String(initialData.province_id),
      city_id: String(initialData.city_id),
    });
    setAttributes(initialData.attributes ?? {});
  }, [initialData]);

  const restoreDraft = useCallback((saved: Record<string, unknown>) => {
    if (isEditMode) return;
    if (saved.step !== undefined) setStep(saved.step as number);
    if (saved.categoryId !== undefined) setCategoryId(saved.categoryId as number | null);
    if (saved.basicData) setBasicData(saved.basicData as typeof basicData);
    if (saved.attributes) setAttributes(saved.attributes as Record<string, string>);
    if (saved.objectKeys) setObjectKeys(saved.objectKeys as string[]);
    if (saved.skipImages !== undefined) setSkipImages(saved.skipImages as boolean);
    if (!draftNotified.current) {
      draftNotified.current = true;
      toast({ type: 'success', title: 'پیش‌نویس بازیابی شد', message: 'اطلاعات ذخیره‌شده قبلی بارگذاری شد.' });
    }
  }, [isEditMode]);

  const autoSaveData = useMemo(
    () => isEditMode ? {} : { step, categoryId, basicData, attributes, objectKeys, skipImages },
    [isEditMode, step, categoryId, basicData, attributes, objectKeys, skipImages],
  );
  const { clearDraft } = useAutoSave(autoSaveData, restoreDraft);

  const canProceed = useCallback(() => {
    switch (step) {
      case 0: return categoryId !== null;
      case 1: return basicData.title.trim().length >= 5 && basicData.description.trim().length >= 5 && basicData.province_id !== '' && basicData.city_id !== '';
      case 2: return true;
      case 3: return objectKeys.length > 0 || skipImages;
      case 4: return true;
      default: return false;
    }
  }, [step, categoryId, basicData, objectKeys.length, skipImages]);

  const handleSubmit = async () => {
    if (!categoryId) return;
    setSubmitting(true);

    const payload = {
      category_id: categoryId,
      title: basicData.title.trim(),
      description: basicData.description.trim(),
      price: basicData.price ? Number(basicData.price) : null,
      price_type: basicData.price_type,
      province_id: Number(basicData.province_id),
      city_id: Number(basicData.city_id),
      attributes,
    };

    try {
      if (isEditMode && listingId) {
        await updateListing.mutateAsync({ id: listingId, data: payload });
        toast({ type: 'success', title: 'آگهی ویرایش شد', message: 'تغییرات با موفقیت ذخیره شد.' });
        router.push(redirectPath || '/dealer/listings');
      } else {
        if (objectKeys.length > 0) {
          Object.assign(payload, { images: objectKeys.map((key, i) => ({ url: key, is_primary: i === 0, sort_order: i })) });
        }
        await createListing.mutateAsync(payload);
        clearDraft();
        router.push(redirectPath || '/dashboard/listings');
      }
    } catch {
      toast({ type: 'error', title: isEditMode ? 'خطا در ویرایش آگهی' : 'خطا در ثبت آگهی', message: 'لطفاً دوباره تلاش کنید' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border',
                  i < step
                    ? 'bg-success/10 text-success border-success/30'
                    : i === step
                    ? 'bg-primary text-primary-foreground border-transparent scale-110 shadow-sm'
                    : 'bg-surface/40 border-border text-muted-foreground'
                )}
              >
                {i < step ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={cn(
                'text-[10px] sm:text-xs whitespace-nowrap transition-colors duration-300',
                i === step ? 'text-foreground font-medium' : i < step ? 'text-success' : 'text-muted-foreground'
              )}>
                {label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 sm:mx-4 rounded-full bg-border relative top-[-12px]">
                <div className={`h-full bg-primary transition-all duration-500 ${i < step ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6 md:p-10 border border-border-subtle shadow-sm min-h-[400px]">
        {step === 0 && <Step1Category selected={categoryId} onSelect={setCategoryId} disabled={isEditMode} />}
        {step === 1 && <Step2Basic data={basicData} onChange={setBasicData} />}
        {step === 2 && categorySlug && (
          <Step3Attributes categorySlug={categorySlug} values={attributes} onChange={setAttributes} />
        )}
        {step === 3 && (
          <Step4Images
            objectKeys={objectKeys}
            onKeysChange={setObjectKeys}
            skipImages={skipImages}
            onSkipImagesChange={setSkipImages}
          />
        )}
        {step === 4 && (
          <Step5Preview
            data={{ ...basicData, category_id: categoryId, attributes }}
            categoryName={categoryName}
            cityName={cityName}
            provinceName={provinceName}
          />
        )}
      </div>

      <div className="flex justify-between items-center mt-10 gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-6 py-3.5 btn btn-glass rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
          مرحله قبل
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-8 py-3.5 btn btn-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            مرحله بعد
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-10 py-3.5 btn btn-primary rounded-xl disabled:opacity-70"
          >
            {submitting ? (
              <>
                <div className="follow-the-leader scale-[0.4] -mx-3"><div></div><div></div><div></div><div></div><div></div></div>
                {isEditMode ? 'در حال ذخیره...' : 'در حال ثبت...'}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {isEditMode ? 'ذخیره تغییرات' : 'ثبت نهایی آگهی'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
