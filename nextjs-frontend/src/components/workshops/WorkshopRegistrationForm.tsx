'use client';

import { useState } from 'react';
import { useRegisterWorkshop, useUpdateWorkshop } from '@/hooks/useWorkshops';
import { DocumentUploader } from '@/components/store/DocumentUploader';

interface Props {
  initial?: Record<string, any> | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WorkshopRegistrationForm({ initial, onSuccess, onCancel }: Props) {
  const [workshopName, setWorkshopName] = useState(initial?.workshop_name || '');
  const [workshopSlug, setWorkshopSlug] = useState(initial?.workshop_slug || '');
  const [type, setType] = useState(initial?.type || 'mechanic');
  const [specialty, setSpecialty] = useState(initial?.specialty || '');
  const [city, setCity] = useState(initial?.city || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [hours, setHours] = useState(initial?.hours || '');
  const [servicesInput, setServicesInput] = useState((initial?.services || []).join('، '));
  const [description, setDescription] = useState(initial?.description || '');
  const [documents, setDocuments] = useState<string[]>(initial?.documents || []);

  const isEdit = !!initial;
  const register = useRegisterWorkshop();
  const update = useUpdateWorkshop();
  const isPending = register.isPending || update.isPending;
  const isError = register.isError || update.isError;
  const error = register.error || update.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const services = servicesInput
      .split(/[،,]/)
      .map((s: string) => s.trim())
      .filter(Boolean);

    const payload = {
      workshopName,
      workshopSlug: workshopSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      type,
      specialty,
      city,
      address,
      phone,
      hours,
      services,
      description,
      documents,
    };

    if (isEdit) await update.mutateAsync(payload);
    else await register.mutateAsync(payload);
    onSuccess?.();
  };

  const inputCls = 'w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50';
  const labelCls = 'text-xs font-medium text-muted-foreground';

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-border-subtle space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">
          {isEdit ? 'ویرایش اطلاعات تعمیرگاه' : 'ثبت تعمیرگاه / تیونر'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          پس از تأیید مدارک توسط ادمین، پروفایل شما در فهرست تعمیرکاران نمایش داده می‌شود
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelCls}>نام تعمیرگاه *</label>
          <input
            type="text" value={workshopName} onChange={(e) => setWorkshopName(e.target.value)}
            required
            className={inputCls}
            placeholder="مثال: تعمیرگاه مرکزی امیر"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>آدرس اینترنتی (slug) *</label>
          <input
            type="text" value={workshopSlug} onChange={(e) => setWorkshopSlug(e.target.value)}
            required
            className={`${inputCls} font-mono`}
            placeholder="amir-garage"
            dir="ltr"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelCls}>نوع فعالیت *</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            <option value="mechanic">تعمیرکار</option>
            <option value="tuner">تیونر</option>
            <option value="both">تعمیرکار و تیونر</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>تخصص</label>
          <input
            type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)}
            className={inputCls}
            placeholder="مثال: تعمیرات تخصصی گیربکس، ریمپ ECU"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelCls}>شهر *</label>
          <input
            type="text" value={city} onChange={(e) => setCity(e.target.value)}
            required
            className={inputCls}
            placeholder="مثال: تهران"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>تلفن تماس *</label>
          <input
            type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            required
            className={`${inputCls} text-left`}
            placeholder="0912xxxxxxx"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>آدرس تعمیرگاه *</label>
        <input
          type="text" value={address} onChange={(e) => setAddress(e.target.value)}
          required
          className={inputCls}
          placeholder="خیابان، کوچه، پلاک..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelCls}>ساعت کاری</label>
          <input
            type="text" value={hours} onChange={(e) => setHours(e.target.value)}
            className={inputCls}
            placeholder="شنبه تا پنجشنبه ۹ تا ۱۹"
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>خدمات (با کاما جدا کنید)</label>
          <input
            type="text" value={servicesInput} onChange={(e) => setServicesInput(e.target.value)}
            className={inputCls}
            placeholder="تعویض روغن، دیاگ، صافکاری..."
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>درباره تعمیرگاه</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="سابقه، تخصص‌ها و توضیحات تکمیلی..."
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>مدارک (کارت ملی، جواز کسب) *</label>
        <DocumentUploader documents={documents} onChange={setDocuments} />
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 btn btn-ghost rounded-xl">
            انصراف
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !workshopName || !workshopSlug || !city || !phone || !address || documents.length === 0}
          className="flex-1 py-3 btn btn-primary rounded-xl disabled:opacity-50"
        >
          {isPending ? 'در حال ثبت...' : isEdit ? 'ذخیره تغییرات' : 'ارسال برای بررسی'}
        </button>
      </div>

      {register.isSuccess && !isEdit && (
        <p className="text-sm text-success bg-success/10 p-3 rounded-xl">
          اطلاعات شما با موفقیت ثبت شد و در انتظار تأیید ادمین است.
        </p>
      )}
      {isError && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">
          {(error as any)?.message || 'خطا در ثبت اطلاعات'}
        </p>
      )}
    </form>
  );
}
