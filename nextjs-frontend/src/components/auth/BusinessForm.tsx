'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodType } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Alert } from '@/components/ui/Alert';
import { DocumentUploader } from '@/components/upload/DocumentUploader';
import { cn } from '@/lib/utils';
import type { BusinessProfileInput, BusinessRole, WorkshopType } from '@/types';

interface BusinessFormValues {
  business_name?: string;
  dealer_code?: string;
  workshop_name?: string;
  workshop_type?: WorkshopType;
  business_address?: string;
  city?: string;
  description?: string;
}

const WORKSHOP_TYPE_OPTIONS: { value: WorkshopType; label: string }[] = [
  { value: 'mechanic', label: 'تعمیرگاه' },
  { value: 'tuner', label: 'تیونر' },
  { value: 'both', label: 'هر دو' },
];

function buildSchema(role: BusinessRole) {
  const base = z.object({
    business_address: z.string().trim().max(500, 'حداکثر ۵۰۰ کاراکتر').optional(),
    city: z.string().trim().max(100).optional(),
    description: z.string().trim().max(2000, 'حداکثر ۲۰۰۰ کاراکتر').optional(),
  });
  if (role === 'workshop') {
    return base.extend({
      workshop_name: z.string().trim().min(2, 'نام تعمیرکارگاه را وارد کنید').max(200),
      workshop_type: z.enum(['mechanic', 'tuner', 'both'], { message: 'نوع فعالیت را انتخاب کنید' }),
    });
  }
  return base.extend({
    business_name: z.string().trim().min(2, 'نام کسب‌وکار را وارد کنید').max(200),
    dealer_code:
      role === 'dealer'
        ? z.union([z.literal(''), z.string().regex(/^[a-zA-Z0-9_-]{2,50}$/, 'کد نمایندگی معتبر نیست')]).optional()
        : z.undefined().optional(),
  });
}

function toPayload(values: BusinessFormValues, role: BusinessRole, documents: string[]): BusinessProfileInput {
  const common: BusinessProfileInput = {
    business_address: values.business_address || undefined,
    city: values.city || undefined,
    description: values.description || undefined,
    documents: documents.length > 0 ? documents : undefined,
  };
  if (role === 'workshop') {
    return { ...common, workshop_name: values.workshop_name, workshop_type: values.workshop_type };
  }
  return {
    ...common,
    business_name: values.business_name,
    dealer_code: role === 'dealer' ? values.dealer_code || undefined : undefined,
  };
}

interface BusinessFormProps {
  role: BusinessRole;
  submitLabel?: string;
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: BusinessProfileInput) => Promise<void> | void;
}

export function BusinessForm({ role, submitLabel = 'ثبت پروفایل کسب‌وکار', loading, error, onSubmit }: BusinessFormProps) {
  const schema = buildSchema(role);
  const [documents, setDocuments] = useState<string[]>([]);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(schema as ZodType<BusinessFormValues>),
    mode: 'onTouched',
  });

  const workshopType = useWatch<BusinessFormValues>({ control, name: 'workshop_type' });

  const handleFormSubmit = handleSubmit((values) => onSubmit(toPayload(values, role, documents)));

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-border-subtle space-y-5">
        {role === 'workshop' ? (
          <>
            <FormField label="نام تعمیرکارگاه" htmlFor="bp-workshop-name" error={errors.workshop_name?.message} required>
              <Input
                id="bp-workshop-name"
                placeholder="نام تعمیرگاه یا تیونینگ"
                invalid={!!errors.workshop_name}
                {...register('workshop_name')}
              />
            </FormField>
            <FormField label="نوع فعالیت" error={errors.workshop_type?.message} required>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="نوع فعالیت تعمیرکارگاه">
                {WORKSHOP_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={workshopType === opt.value}
                    onClick={() => setValue('workshop_type', opt.value, { shouldValidate: true, shouldDirty: true })}
                    className={cn(
                      'py-2.5 text-sm font-medium rounded-xl border transition-all',
                      workshopType === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border-subtle bg-surface-2/30 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormField>
          </>
        ) : (
          <>
            <FormField label="نام کسب‌وکار" htmlFor="bp-business-name" error={errors.business_name?.message} required>
              <Input
                id="bp-business-name"
                placeholder="نام نمایندگی / نمایشگاه / فروشگاه"
                autoComplete="organization"
                invalid={!!errors.business_name}
                {...register('business_name')}
              />
            </FormField>
            {role === 'dealer' && (
              <FormField label="کد نمایندگی" htmlFor="bp-dealer-code" error={errors.dealer_code?.message} hint="اختیاری — در صورت داشتن کد از طرف سازنده">
                <Input
                  id="bp-dealer-code"
                  placeholder="مثلاً HONDA-THR-01"
                  invalid={!!errors.dealer_code}
                  className="text-left"
                  {...register('dealer_code')}
                />
              </FormField>
            )}
          </>
        )}

        <FormField label="آدرس" htmlFor="bp-address" error={errors.business_address?.message}>
          <Input
            id="bp-address"
            placeholder="استان، شهر، خیابان..."
            invalid={!!errors.business_address}
            {...register('business_address')}
          />
        </FormField>

        <FormField label="شهر" htmlFor="bp-city" error={errors.city?.message}>
          <Input id="bp-city" placeholder="شهر محل فعالیت" invalid={!!errors.city} {...register('city')} />
        </FormField>

        <FormField label="توضیحات" htmlFor="bp-description" error={errors.description?.message} hint="معرفی کوتاه کسب‌وکار شما (اختیاری)">
          <textarea
            id="bp-description"
            rows={4}
            placeholder="خدمات و تخصص‌های کسب‌وکار خود را معرفی کنید"
            className="w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-y disabled:opacity-50 disabled:cursor-not-allowed"
            aria-invalid={!!errors.description}
            {...register('description')}
          />
        </FormField>

        <FormField label="مدارک کسب‌وکار" hint="کارت ملی، جواز کسب و مدارک هویتی (تصویر — حداکثر ۵ عدد، اختیاری)">
          <DocumentUploader value={documents} onChange={setDocuments} maxImages={5} />
        </FormField>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Button type="submit" size="lg" loading={loading} className="w-full py-4">
        {submitLabel}
      </Button>
    </form>
  );
}
