'use client';

import { ListingForm } from '@/components/listing/ListingForm';

export default function DealerCreateListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ثبت آگهی جدید</h1>
        <p className="text-muted-foreground text-sm">آگهی خود را با تکمیل مراحل زیر ثبت کنید</p>
      </div>
      <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl">
        <ListingForm />
      </div>
    </div>
  );
}
