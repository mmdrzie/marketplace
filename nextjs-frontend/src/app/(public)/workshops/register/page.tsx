'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useIsAuthenticated } from '@/store/authStore';
import { useMyWorkshop } from '@/hooks/useWorkshops';
import { workshopTypeMeta, WorkshopTypeIcon } from '@/components/workshops/workshopMeta';
import { WorkshopRegistrationForm } from '@/components/workshops/WorkshopRegistrationForm';

function LoginGate() {
  return (
    <div>
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
          باشگاه تعمیرکاران و تیونرها
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">ثبت تعمیرگاه / تیونر</h1>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          برای شروع ثبت‌نام، ابتدا وارد حساب کاربری خود شوید — ورود یا ساخت حساب فقط چند ثانیه زمان می‌برد
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-24 md:mb-32">
        <div className="glass rounded-3xl border border-border-subtle overflow-hidden">
          <div className="relative px-6 md:px-8 py-6 md:py-7 bg-gradient-to-br from-primary/15 via-accent/10 to-surface-2 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/[0.08] rounded-full blur-3xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold text-foreground">برای ثبت تعمیرگاه، ابتدا وارد شوید</h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  پس از ورود می‌توانید اطلاعات تعمیرگاه خود را ثبت کنید؛ پس از تأیید ادمین در فهرست عمومی نمایش داده می‌شود.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-3 p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { num: '۱', title: 'ثبت اطلاعات', desc: 'فرم کوتاه تعمیرگاه' },
                  { num: '۲', title: 'بررسی ادمین', desc: 'معمولاً زیر ۲۴ ساعت' },
                  { num: '۳', title: 'انتشار در فهرست', desc: 'قابل جستجو برای همه' },
                ].map((s) => (
                  <div key={s.num} className="rounded-2xl border border-border bg-surface/40 p-4 text-center">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary mx-auto mb-1.5">
                      {s.num}
                    </div>
                    <p className="text-[11px] font-bold text-foreground">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login?redirect=%2Fworkshops%2Fregister"
                  className="btn btn-primary rounded-xl py-3.5 px-10 justify-center"
                >
                  ورود به حساب
                </Link>
                <Link
                  href="/register?redirect=%2Fworkshops%2Fregister"
                  className="btn btn-glass rounded-xl py-3.5 px-10 justify-center"
                >
                  ساخت حساب جدید
                </Link>
              </div>
              <Link href="/workshops" className="inline-block w-full text-center mt-6 text-xs text-muted-foreground hover:text-primary transition-colors">
                بازگشت به فهرست تعمیرکاران
              </Link>
            </div>

            <div className="md:col-span-2 hidden md:flex flex-col justify-center gap-4 p-6 md:p-8 border-t md:border-t-0 md:border-r border-border/60 bg-surface/30">
              <h3 className="text-sm font-bold text-foreground">چرا در باشگاه تعمیرکاران ثبت‌نام کنیم؟</h3>
              {[
                'ثبت‌نام کاملاً رایگان و بدون کارمزد',
                'نمایش در فهرست عمومی با جستجوی نام، شهر و تخصص',
                'لینک اختصاصی برای پروفایل تعمیرگاه شما',
                'افزودن مدارک برای اعتبار بیشتر نزد ادمین',
                'ویرایش اطلاعات در هر زمان از پنل تعمیرکار',
              ].map((b) => (
                <div key={b} className="flex items-start gap-2.5">
                  <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mt-2">
                <p className="text-[11px] font-bold text-primary mb-1">پشتیبانی ادمین</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  درخواست شما معمولاً کمتر از ۲۴ ساعت بررسی و نتیجه اطلاع‌رسانی می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterWorkshopPage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const [editing, setEditing] = useState(false);
  const { data: profile, refetch } = useMyWorkshop();

  if (!isAuthenticated) {
    return <LoginGate />;
  }

  if (profile && !editing) {
    const meta = workshopTypeMeta(profile.type);
    return (
      <div className="space-y-6 max-w-2xl mx-auto mb-24 md:mb-32">
        <div>
          <h1 className="text-2xl font-bold text-foreground">وضعیت تعمیرگاه</h1>
          <p className="text-sm text-muted-foreground mt-1">شما قبلاً ثبت‌نام کرده‌اید</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-border-subtle overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: meta.strip }} />
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center text-xl font-black ${meta.text}`}>
              {profile.workshop_name?.[0] || '؟'}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-foreground">{profile.workshop_name}</h2>
              <p className="text-sm text-muted-foreground font-mono">{profile.workshop_slug}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border font-medium mt-1.5 ${meta.bg} ${meta.border} ${meta.text}`}>
                <WorkshopTypeIcon type={profile.type} className="w-3 h-3" />
                {meta.label}
              </span>
            </div>
          </div>
          <span className={`inline-block text-xs px-3 py-1 rounded-full border ${
            profile.status === 'approved' ? 'bg-success/10 text-success border-success/20' :
            profile.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' :
            profile.status === 'suspended' ? 'bg-surface-2 text-muted-foreground border-border' :
            'bg-warning/10 text-warning border-warning/20'
          }`}>
            {profile.status === 'approved' ? 'تأیید شده'
              : profile.status === 'rejected' ? 'رد شده'
              : profile.status === 'suspended' ? 'مسدود'
              : 'در انتظار تأیید'}
          </span>
          {profile.admin_note && (
            <p className="text-sm text-muted-foreground mt-3">یادداشت ادمین: {profile.admin_note}</p>
          )}
          <div className="flex gap-3 mt-5">
            <button onClick={() => setEditing(true)} className="btn btn-ghost btn-sm">ویرایش اطلاعات</button>
            <Link href="/workshop" className="btn btn-glass btn-sm">پنل تعمیرکار</Link>
            {profile.status === 'approved' && (
              <Link href={`/workshops/${profile.workshop_slug}`} className="btn btn-primary btn-sm">
                مشاهده پروفایل عمومی
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto mb-24 md:mb-32">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {profile ? 'ویرایش تعمیرگاه' : 'ثبت تعمیرگاه / تیونر'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          تعمیرگاه و تخصص خود را معرفی کنید؛ پس از تأیید ادمین در فهرست عمومی نمایش داده می‌شود
        </p>
      </div>
      <WorkshopRegistrationForm
        initial={profile || null}
        onSuccess={() => {
          setEditing(false);
          refetch();
        }}
        onCancel={() => (profile ? setEditing(false) : router.push('/workshops'))}
      />
    </div>
  );
}

