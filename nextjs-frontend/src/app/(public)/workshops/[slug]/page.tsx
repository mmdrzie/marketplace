'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useWorkshop } from '@/hooks/useWorkshops';
import { workshopTypeMeta, WorkshopTypeIcon } from '@/components/workshops/workshopMeta';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';

export default function WorkshopProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: workshop, isLoading, isError } = useWorkshop(slug);
  const isOwner = !!user && !!workshop && user.id === workshop.user_id;

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loading /></div>;
  }

  if (isError || !workshop) {
    return (
      <EmptyState
        icon="search"
        title="تعمیرکار یافت نشد"
        description="این تعمیرگاه وجود ندارد یا هنوز تأیید نشده است."
        action={<Link href="/workshops" className="btn btn-primary btn-sm">بازگشت به فهرست</Link>}
      />
    );
  }

  const meta = workshopTypeMeta(workshop.type);

  const infoRows = [
    workshop.city && { icon: <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" />, label: 'شهر', value: workshop.city },
    workshop.address && { icon: <path d="M17.6 21.3a13.8 13.8 0 01-11.2 0M12 15a3 3 0 110-6 3 3 0 010 6z" />, label: 'آدرس', value: workshop.address },
    workshop.phone && { icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" />, label: 'تلفن', value: workshop.phone, ltr: true },
    workshop.hours && { icon: <circle cx="12" cy="12" r="10" />, label: 'ساعت کاری', value: workshop.hours },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; ltr?: boolean }[];

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8" aria-label="مسیر راهنما">
        <Link href="/workshops" className="hover:text-primary transition-colors">تعمیرکاران و تیونرها</Link>
        <svg className="h-3 w-3 shrink-0 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6" /></svg>
        <span className="text-foreground font-bold truncate max-w-[200px]">{workshop.workshop_name}</span>
      </nav>

      <div className="glass rounded-3xl border border-border-subtle overflow-hidden">
        <div className="relative h-1.5" style={{ background: meta.strip }} />
        <div
          className="relative h-28 md:h-36 overflow-hidden"
          style={{
            background: `radial-gradient(70% 140% at 15% 0%, ${meta.glow}, transparent 70%)`,
          }}
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
          <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full blur-3xl" style={{ background: meta.glow }} />
        </div>
        <div className="px-5 md:px-8 pb-8 -mt-12">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className={`w-20 h-20 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 text-2xl font-black ${meta.text}`}>
              {workshop.workshop_name?.[0] || '؟'}
            </div>
            <div className="flex-1 min-w-0 pt-10 md:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-foreground">{workshop.workshop_name}</h1>
                <span className={`inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full border font-medium ${meta.bg} ${meta.border} ${meta.text}`}>
                  <WorkshopTypeIcon type={workshop.type} className="w-3 h-3" />
                  {meta.label}
                </span>
              </div>
              {workshop.specialty && (
                <p className="text-sm text-muted-foreground mt-1">{workshop.specialty}</p>
              )}
              <p className="text-xs text-muted-foreground/60 mt-1">
                توسط {workshop.owner_name || 'تعمیرکار'} — عضویت از {new Date(workshop.created_at).toLocaleDateString('fa-IR')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0">
              {workshop.phone && (
                <a
                  href={`tel:${workshop.phone}`}
                  dir="ltr"
                  className="btn btn-primary btn-sm justify-center"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" /></svg>
                  تماس
                </a>
              )}
              {(workshop.city || workshop.address) && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([workshop.city, workshop.address].filter(Boolean).join('، '))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-glass btn-sm justify-center"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m-6 3l6-3" /></svg>
                  مسیریابی در نقشه
                </a>
              )}
              {isOwner && (
                <Link href="/workshop/profile" className="btn btn-ghost btn-sm justify-center">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  ویرایش پروفایل
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2 space-y-4">
          {workshop.description && (
            <div className="glass rounded-2xl border border-border-subtle p-5">
              <h2 className="text-sm font-bold text-foreground mb-2">درباره تعمیرگاه</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{workshop.description}</p>
            </div>
          )}
          {workshop.services?.length > 0 && (
            <div className="glass rounded-2xl border border-border-subtle p-5">
              <h2 className="text-sm font-bold text-foreground mb-3">خدمات</h2>
              <div className="flex flex-wrap gap-2">
                {workshop.services.map((s: string, i: number) => (
                  <span key={i} className={`text-xs px-3 py-1.5 rounded-full border ${meta.bg} ${meta.border} ${meta.text}`}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl border border-border-subtle p-5 h-fit">
          <h2 className="text-sm font-bold text-foreground mb-4">اطلاعات تماس و آدرس</h2>
          <div className="space-y-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 ${meta.text}`}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{row.icon}</svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground/60">{row.label}</p>
                  <p className={`text-xs text-foreground font-medium ${row.ltr ? 'dir-ltr text-left' : ''}`}>{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
