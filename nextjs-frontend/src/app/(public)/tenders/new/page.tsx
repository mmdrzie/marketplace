'use client';

import Link from 'next/link';
import { TenderForm } from '@/components/tender/TenderForm';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';

export default function NewTenderPage() {
  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] -z-0 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 8%, transparent)' }} />
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="flex items-center gap-3 mb-6">
            <Link href="/tenders" className="btn btn-ghost btn-sm">
              <svg className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              بازگشت
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-foreground">ثبت درخواست جدید</h1>
            <p className="text-sm text-muted-foreground mt-1">نیاز خود را ثبت کنید تا نمایندگان به شما پیشنهاد قیمت دهند</p>
          </div>

          <div className="glass rounded-2xl p-6 border border-border-subtle">
            <TenderForm />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
