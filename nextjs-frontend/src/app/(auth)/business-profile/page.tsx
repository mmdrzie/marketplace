'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { BusinessForm } from '@/components/auth/BusinessForm';
import { StatusCard } from '@/components/ui/StatusCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useUser, useAuthStore } from '@/store/authStore';
import type { BusinessRole, ProfileStatus } from '@/types';

const DONE_STATUSES: ProfileStatus[] = ['pending', 'approved', 'complete'];

export default function BusinessProfilePage() {
  const router = useRouter();
  const user = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const { createBusinessProfile, loading, error } = useAuth();
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null);

  const role = user?.role;
  const isBusiness = role === 'dealer' || role === 'agency' || role === 'store' || role === 'workshop';

  useEffect(() => {
    if (!user || !isBusiness) {
      router.replace('/register');
    }
  }, [user, isBusiness, router]);

  if (!user || !isBusiness) {
    return null;
  }

  const effectiveStatus: ProfileStatus | null =
    profileStatus || (user.profileStatus && DONE_STATUSES.includes(user.profileStatus) ? user.profileStatus : null);

  return (
    <FadeIn>
      <AuthHeader
        icon={<Store className="h-5 w-5" aria-hidden="true" />}
        title="پروفایل کسب‌وکار"
        subtitle="اطلاعات کسب‌وکار خود را تکمیل کنید؛ پس از تأیید ادمین امکانات ویژه فعال می‌شود"
      />

      {effectiveStatus ? (
        <div className="space-y-6">
          <StatusCard status={effectiveStatus} />
          <Button type="button" size="lg" className="w-full py-4 rounded-xl" onClick={() => router.push('/')}>
            رفتن به صفحه اصلی
          </Button>
        </div>
      ) : (
        <BusinessForm
          role={role as BusinessRole}
          loading={loading}
          error={error}
          onSubmit={async (data) => {
            try {
              const result = await createBusinessProfile(data);
              setProfileStatus(result.profileStatus);
              if (user) setUser({ ...user, profileStatus: result.profileStatus });
            } catch {
              // error handled by hook
            }
          }}
        />
      )}
    </FadeIn>
  );
}
