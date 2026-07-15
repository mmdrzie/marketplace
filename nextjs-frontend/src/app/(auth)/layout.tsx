'use client';

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      
      {/* ستون برندینگ (فقط دسکتاپ) */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface/40 relative overflow-hidden border-l border-border">
        
        {/* شبکه پیکسلی پس‌زمینه */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }}></div>
        
        {/* هاله‌های نوری با انیمیشن */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px] bg-primary/10 pointer-events-none motion-safe:animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[130px] bg-primary/5 pointer-events-none motion-safe:animate-pulse [animation-delay:1s]"></div>

        <div className="relative z-10 flex flex-col justify-center p-16">
          <h2 className="text-5xl font-bold tracking-tighter text-foreground mb-6 leading-tight">
            بازارگاه خودرو<br />
            <span className="text-primary">و ماشین‌آلات</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-md mb-12 font-light">
            خرید، فروش و جستجوی انواع خودرو، ماشین‌آلات راهسازی، کشاورزی و تجهیزات صنعتی با امنیت و سرعت بالا.
          </p>
          
          {/* کارت‌های آماری شیشه‌ای */}
          <div className="grid grid-cols-3 gap-4 max-w-md">
            {[
              { value: '۱۲,۵۰۰+', label: 'آگهی فعال' },
              { value: '۸۵۰+', label: 'نماینده معتبر' },
              { value: '۳۱', label: 'استان کشور' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 border border-border-subtle text-center transition-all hover:border-primary/30">
                <p className="text-2xl font-bold text-primary tracking-tighter">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ستون فرم احراز هویت */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        {/* هاله نوری برای ستون فرم با انیمیشن */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] bg-primary/5 pointer-events-none motion-safe:animate-pulse [animation-delay:0.5s]"></div>
        
        <div className="w-full max-w-sm">
          {/* لوگو */}
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-primary shadow-lg shadow-primary/20 group-hover:scale-105">
                <span className="text-primary-foreground font-black text-sm tracking-tighter">TD</span>
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">Team Decision</span>
            </Link>
          </div>

          {/* محتوای فرم (Children) - دارای انیمیشن ورود */}
          <div className="animate-fade-in-up">
            {children}
          </div>

          {/* بازگشت به خانه */}
          <div className="mt-12 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}