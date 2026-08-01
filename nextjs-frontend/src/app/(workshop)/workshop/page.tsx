'use client';

import Link from 'next/link';
import { useMyWorkshop } from '@/hooks/useWorkshops';
import { workshopTypeMeta, WorkshopTypeIcon } from '@/components/workshops/workshopMeta';
import { Skeleton } from '@/components/common/Skeleton';

const ICONS = {
  type: <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />,
  specialty: <circle cx="12" cy="12" r="9" />,
  city: <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" />,
  phone: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" />,
  hours: <circle cx="12" cy="12" r="10" />,
};

export default function WorkshopDashboardPage() {
  const { data: profile, isLoading, isError } = useMyWorkshop();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="glass rounded-2xl p-6 border border-border-subtle space-y-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="glass rounded-3xl border border-border-subtle overflow-hidden max-w-2xl">
        <div
          className="relative h-1.5"
          style={{ background: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-indigo))' }}
        />
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-purple-bg border border-accent-purple-border flex items-center justify-center text-accent-purple mx-auto mb-5 shadow-lg shadow-accent-purple/10">
            <WorkshopTypeIcon type="both" className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">پروفایل تعمیرگاه ندارید</h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6">
            با ثبت اطلاعات تعمیرگاه خود (نام، آدرس، تخصص، خدمات و مدارک) در فهرست عمومی
            تعمیرکاران و تیونرها معرفی شوید. پس از تأیید ادمین، پروفایل شما منتشر می‌شود.
          </p>
          <Link href="/workshop/profile" className="btn btn-primary rounded-xl px-8 py-3">
            ثبت تعمیرگاه
          </Link>
        </div>
      </div>
    );
  }

  const meta = workshopTypeMeta(profile.type);

  const statusConfig =
    profile.status === 'approved'
      ? { label: 'تأیید شده', cls: 'bg-success/10 text-success border-success/20' }
      : profile.status === 'rejected'
      ? { label: 'رد شده', cls: 'bg-destructive/10 text-destructive border-destructive/20' }
      : profile.status === 'suspended'
      ? { label: 'مسدود', cls: 'bg-surface-2 text-muted-foreground border-border' }
      : { label: 'در انتظار تأیید', cls: 'bg-warning/10 text-warning border-warning/20' };

  const infoRows = [
    profile.type && { label: 'نوع فعالیت', value: meta.label, icon: ICONS.type },
    profile.specialty && { label: 'تخصص', value: profile.specialty, icon: ICONS.specialty },
    profile.city && { label: 'شهر', value: profile.city, icon: ICONS.city },
    profile.phone && { label: 'تلفن', value: profile.phone, icon: ICONS.phone, ltr: true },
    profile.hours && { label: 'ساعت کاری', value: profile.hours, icon: ICONS.hours },
  ].filter(Boolean) as { label: string; value: string; icon: React.ReactNode; ltr?: boolean }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">داشبورد تعمیرگاه</h1>
        <p className="text-sm text-muted-foreground mt-1">مدیریت پروفایل و وضعیت تعمیرگاه شما</p>
      </div>

      <div className="glass rounded-3xl border border-border-subtle overflow-hidden">
        <div className="relative h-1.5" style={{ background: meta.strip }} />
        <div
          className="relative h-24 md:h-28 overflow-hidden"
          style={{ background: `radial-gradient(70% 140% at 15% 0%, ${meta.glow}, transparent 70%)` }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
          <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full blur-3xl" style={{ background: meta.glow }} />
        </div>
        <div className="px-5 md:px-8 pb-6 -mt-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className={`w-16 h-16 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 text-xl font-black ${meta.text}`}>
              {profile.workshop_name?.[0] || '؟'}
            </div>
            <div className="flex-1 min-w-0 pt-6 md:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold text-foreground">{profile.workshop_name}</h2>
                <span className={`inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full border font-medium ${meta.bg} ${meta.border} ${meta.text}`}>
                  <WorkshopTypeIcon type={profile.type} className="w-3 h-3" />
                  {meta.label}
                </span>
                <span className={`text-[10px] px-3 py-1 rounded-full border font-medium ${statusConfig.cls}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">{profile.workshop_slug}</p>
              {profile.admin_note && (
                <p className="text-xs text-muted-foreground mt-2">یادداشت ادمین: {profile.admin_note}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/workshop/profile" className="btn btn-ghost btn-sm">ویرایش پروفایل</Link>
              {profile.status === 'approved' && (
                <Link href={`/workshops/${profile.workshop_slug}`} className="btn btn-primary btn-sm">
                  مشاهده پروفایل عمومی
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {profile.status === 'pending' && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-warning shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          <p className="text-sm text-foreground">
            پروفایل شما در انتظار بررسی ادمین است. پس از تأیید، در فهرست عمومی <Link href="/workshops" className="text-primary hover:underline">تعمیرکاران و تیونرها</Link> نمایش داده می‌شود.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {infoRows.map((row) => (
          <div key={row.label} className="glass rounded-2xl border border-border-subtle p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`w-7 h-7 rounded-lg ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 ${meta.text}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{row.icon}</svg>
              </div>
              <p className="text-[10px] text-muted-foreground/60">{row.label}</p>
            </div>
            <p className={`text-sm text-foreground font-medium truncate ${row.ltr ? 'dir-ltr text-left' : ''}`}>
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {profile.services?.length > 0 && (
        <div className="glass rounded-2xl border border-border-subtle p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">خدمات</h3>
          <div className="flex flex-wrap gap-2">
            {profile.services.map((s: string, i: number) => (
              <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${meta.bg} ${meta.border} ${meta.text}`}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
