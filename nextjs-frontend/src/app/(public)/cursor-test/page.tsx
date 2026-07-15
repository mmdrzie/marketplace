'use client';

import { CustomCursor } from '@/components/common/CustomCursor';
import { ParticleBackground } from '@/components/common/ParticleBackground';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function CursorTestPage() {
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();
  const disableEffects = isTouch || reducedMotion;

  return (
    <>
      {!disableEffects && <CustomCursor />}
      {!disableEffects && <ParticleBackground className="fixed inset-0 z-0 w-full h-full" />}

      <div className="relative z-10 min-h-screen bg-background/60 text-foreground p-8">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* header */}
          <div className="text-center space-y-3 pt-8">
            <span className="text-[11px] text-primary uppercase tracking-[0.2em] font-medium">custom cursor</span>
            <h1 className="text-4xl font-bold tracking-tight">تست کرسور اختصاصی</h1>
            <p className="text-muted-foreground text-sm">یک نقطه ساده به جای پیکان پیش‌فرض — هماهنگ با پارتیکل‌ها و تم سایت</p>
          </div>

          {/* links */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">لینک‌ها</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                صفحه اصلی
              </Link>
              <Link href="/search" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                جستجو
              </Link>
              <Link href="/categories" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                دسته‌بندی‌ها
              </Link>
              <Link href="/login" className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors">
                ورود
              </Link>
            </div>
          </section>

          {/* buttons */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">دکمه‌ها</h2>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary">دکمه اصلی</button>
              <button className="btn btn-glass">دکمه شیشه‌ای</button>
              <button className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-surface/60 transition-colors">
                دکمه ساده
              </button>
              <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium">
                حذف
              </button>
              <button className="px-4 py-2 bg-success text-white rounded-xl text-sm font-medium">
                تأیید
              </button>
            </div>
          </section>

          {/* input */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">فیلدهای ورودی</h2>
            <div className="space-y-3 max-w-sm">
              <input
                type="text"
                placeholder="متن ساده..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface/40 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary/40 transition-colors"
              />
              <input
                type="search"
                placeholder="جستجو..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface/40 border border-border text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary/40 transition-colors"
              />
              <select className="w-full px-4 py-2.5 rounded-xl bg-surface/40 border border-border text-foreground text-sm outline-none">
                <option>گزینه ۱</option>
                <option>گزینه ۲</option>
                <option>گزینه ۳</option>
              </select>
            </div>
          </section>

          {/* cards */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">کارت‌های قابل کلیک</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <button
                  key={i}
                  onClick={() => alert(`کارت ${i} کلیک شد`)}
                  className="glass rounded-2xl border border-border p-6 text-right space-y-2 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {i}
                  </div>
                  <h3 className="font-bold text-foreground">کارت نمونه {i}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    این یک کارت آزمایشی برای تست کرسور اختصاصی است.
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* text */}
          <section className="space-y-3 pb-16">
            <h2 className="text-lg font-semibold">متن قابل انتخاب</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              این یک متن آزمایشی است. کاربر می‌تواند این متن را انتخاب (select) کند. 
              کرسور اختصاصی در حین انتخاب متن نیز باید به درستی عمل کند.
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است.
              چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است.
            </p>
            <p className="text-xs text-muted-foreground/60">
              نکته: کرسور اختصاصی فقط در مرورگرهای غیر تاچ فعال می‌شود.
            </p>
          </section>

        </div>
      </div>
    </>
  );
}
