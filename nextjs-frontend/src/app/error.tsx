'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // لاگ کردن خطا برای دیباگ (اختیاری)
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4">
      {/* بک‌گراند داینامیک و هاله‌های نوری */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] motion-safe:animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-indigo) 10%, transparent)' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* کارت اصلی خطا */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl text-center">
          
          {/* آیکون هشدار گرادینتی */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-destructive/10 flex items-center justify-center shadow-glow-destructive" style={{ borderColor: 'color-mix(in srgb, var(--color-destructive) 30%, transparent)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-3">
            خطای سیستمی رخ داده است
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-8 leading-relaxed">
            متأسفانه در پردازش درخواست شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید یا به صفحه اصلی بازگردید.
          </p>

          {/* نمایش دیژست خطا (برای دیباگ) */}
          {error?.digest && (
            <div className="mb-8 inline-block glass px-3 py-1.5 rounded-lg text-xs text-muted-foreground font-mono">
              کد خطا: {error.digest}
            </div>
          )}

          {/* دکمه‌های اقدام */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-6 py-3.5 btn btn-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              تلاش مجدد
            </button>
            
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3.5 btn btn-glass"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
