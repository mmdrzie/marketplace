'use client';

import { PartsSelector } from '@/components/store/PartsSelector';

export default function NewInventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">افزودن قطعه به انبار</h1>
        <p className="text-sm text-muted-foreground mt-1">یک قطعه از کاتالوگ را انتخاب کرده و به انبار خود اضافه کنید</p>
      </div>
      <PartsSelector onClose={() => window.history.back()} />
    </div>
  );
}
