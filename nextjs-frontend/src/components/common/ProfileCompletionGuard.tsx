'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { user } = useAuthStore();

  const missing = useMemo(() => {
    const fields: string[] = [];
    if (!user) return fields;
    if (!user.name?.trim()) fields.push('نام و نام خانوادگی');
    if (!user.phone?.trim()) fields.push('شماره موبایل');
    if (user.role === 'dealer' || user.role === 'agency') {
      if (!user.dealer_profile?.business_name?.trim()) fields.push('نام کسب و کار');
      if (!user.dealer_profile?.dealer_code?.trim()) fields.push('کد نمایندگی');
      if (!user.dealer_profile?.address?.trim()) fields.push('آدرس');
    }
    return fields;
  }, [user]);

  if (missing.length === 0) return <>{children}</>;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">پروفایل شما ناقص است</h3>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-2">
        برای ثبت آگهی باید اطلاعات زیر را تکمیل کنید:
      </p>
      <ul className="text-sm text-warning space-y-1 mb-6">
        {missing.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            {f}
          </li>
        ))}
      </ul>
      <Link href="/dashboard/settings" className="btn btn-primary">
        تکمیل پروفایل
      </Link>
    </div>
  );
}
