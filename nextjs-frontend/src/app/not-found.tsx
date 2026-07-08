import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4">
      {/* بک‌گراند داینامیک و هاله‌های نوری */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[130px]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-indigo) 10%, transparent)' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* کارت اصلی 404 */}
      <div className="relative z-10 w-full max-w-lg text-center">
        
        {/* عدد 404 غول‌آسا با افکت گرادینتی و درخشش */}
        <div className="relative mb-8">
          <h1 className="text-[120px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-foreground via-muted-foreground to-surface-2 drop-shadow-glow-accent select-none">
            404
          </h1>
          {/* آیکون قطع ارتباط در وسط صفر (اختیاری و زیبا) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-card backdrop-blur-md border border-border-subtle flex items-center justify-center shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
          در مسیر گم شده‌اید!
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-md mx-auto leading-relaxed">
          به نظر می‌رسد صفحه‌ای که دنبال آن هستید وجود ندارد، حذف شده یا نام آن تغییر پیدا کرده است. بیایید شما را به مسیر درست برگردانیم.
        </p>

        {/* دکمه‌های اقدام */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            بازگشت به خانه
          </Link>
          
          <Link
            href="/listings"
            className="flex items-center justify-center gap-2 px-6 py-3.5 btn btn-glass"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            جستجو در آگهی‌ها
          </Link>
        </div>
      </div>
    </div>
  );
}
