'use client';

import { useRouter } from 'next/navigation';
import { useStoreProfile } from '@/hooks/usePartsV2';
import { StoreRegistrationForm } from '@/components/store/StoreRegistrationForm';

export default function RegisterStorePage() {
  const router = useRouter();
  const { data: profile } = useStoreProfile();

  if (profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">وضعیت فروشگاه</h1>
          <p className="text-sm text-muted-foreground mt-1">شما قبلاً ثبت‌نام کرده‌اید</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-border-subtle">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-black text-primary">
              {profile.store_name?.[0] || '?'}
            </div>
            <div>
              <h2 className="font-bold text-foreground">{profile.store_name}</h2>
              <p className="text-sm text-muted-foreground">{profile.store_slug}</p>
            </div>
          </div>
          <span className={`inline-block text-xs px-3 py-1 rounded-full border ${
            profile.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
            profile.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
            'bg-warning/10 text-warning border-warning/20'
          }`}>
            {profile.status === 'approved' ? 'تأیید شده' : profile.status === 'rejected' ? 'رد شده' : 'در انتظار تأیید'}
          </span>
          {profile.admin_note && (
            <p className="text-sm text-muted-foreground mt-3">یادداشت ادمین: {profile.admin_note}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ثبت فروشگاه</h1>
        <p className="text-sm text-muted-foreground mt-1">برای شروع فروش قطعات یدکی، فروشگاه خود را ثبت کنید</p>
      </div>
      <StoreRegistrationForm
        onSuccess={() => router.push('/store')}
        onCancel={() => router.push('/store')}
      />
    </div>
  );
}
