'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه محیطی: هاله‌های نرم + گرید نقطه‌ای + نویز */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-[540px] h-[540px] rounded-full blur-[150px] bg-amber/10 motion-safe:animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-32 w-[560px] h-[560px] rounded-full blur-[160px] bg-primary/10 motion-safe:animate-pulse-slow [animation-delay:2s]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, var(--color-border) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="absolute inset-0 bg-noise" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-5 py-10 sm:py-14">
        <div className="w-full max-w-md animate-fade-in-up">{children}</div>
      </div>

      <div className="relative z-10 pb-6 flex justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
