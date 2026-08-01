'use client';

import { useState } from 'react';
import { useRegisterStore } from '@/hooks/usePartsV2';
import { DocumentUploader } from './DocumentUploader';

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function StoreRegistrationForm({ onSuccess, onCancel }: Props) {
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [documents, setDocuments] = useState<string[]>([]);
  const register = useRegisterStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register.mutateAsync({
      storeName, storeSlug, description, address, phone, documents,
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 border border-border-subtle space-y-5 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-foreground">ثبت فروشگاه قطعات یدکی</h2>
        <p className="text-sm text-muted-foreground mt-1">پس از تأیید مدارک توسط ادمین می‌توانید قطعات خود را ثبت کنید</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">نام فروشگاه *</label>
          <input
            type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="مثال: فروشگاه قطعات امیر"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">آدرس اینترنتی (slug) *</label>
          <input
            type="text" value={storeSlug} onChange={(e) => setStoreSlug(e.target.value)}
            required
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground font-mono focus:outline-none focus:border-primary/50"
            placeholder="amir-parts"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">توضیحات فروشگاه</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
          placeholder="توضیحات درباره فروشگاه و تخصص شما..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">آدرس</label>
          <input
            type="text" value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">تلفن تماس</label>
          <input
            type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">مدارک (کارت ملی، جواز کسب) *</label>
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
          disabled={register.isPending || !storeName || !storeSlug || documents.length === 0}
          className="flex-1 py-3 btn btn-primary rounded-xl disabled:opacity-50"
        >
          {register.isPending ? 'در حال ثبت...' : 'ارسال برای بررسی'}
        </button>
      </div>

      {register.isSuccess && (
        <p className="text-sm text-success bg-success/10 p-3 rounded-xl">اطلاعات شما با موفقیت ثبت شد. پس از تأیید ادمین می‌توانید فعالیت کنید.</p>
      )}
      {register.isError && (
        <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-xl">{(register.error as any)?.message || 'خطا در ثبت اطلاعات'}</p>
      )}
    </form>
  );
}
