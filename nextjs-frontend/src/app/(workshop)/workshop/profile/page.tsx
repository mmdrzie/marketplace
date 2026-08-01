'use client';

import { useRouter } from 'next/navigation';
import { useMyWorkshop } from '@/hooks/useWorkshops';
import { WorkshopRegistrationForm } from '@/components/workshops/WorkshopRegistrationForm';

export default function WorkshopProfilePage() {
  const router = useRouter();
  const { data: profile } = useMyWorkshop();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {profile ? 'ویرایش پروفایل تعمیرگاه' : 'ثبت پروفایل تعمیرگاه'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          اطلاعات خود را کامل کنید؛ پس از تأیید ادمین در فهرست عمومی نمایش داده می‌شود
        </p>
      </div>
      <WorkshopRegistrationForm
        initial={profile || null}
        onSuccess={() => router.push('/workshop')}
        onCancel={() => router.push('/workshop')}
      />
    </div>
  );
}
