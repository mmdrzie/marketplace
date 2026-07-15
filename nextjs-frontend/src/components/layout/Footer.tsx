'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative bg-background/80 backdrop-blur-xl border-t border-border mt-auto overflow-hidden">
      {/* هاله نوری محو در بالای فوتر */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[150px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        
        {/* بخش اصلی فوتر */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          
          {/* ستون برندینگ */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-xl font-black text-foreground">Team Decision</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              معتبرترین بازارگاه آنلاین خرید و فروش خودرو، ماشین‌آلات راهسازی، کشاورزی و تجهیزات صنعتی در سراسر ایران.
            </p>
            
            {/* شبکه‌های اجتماعی */}
            <div className="flex gap-3 pt-4">
              {[
                { name: 'ایتا', url: 'https://eitaa.com/teamdecision' },
                { name: 'بله', url: 'https://ble.ir/teamdecision' },
                { name: 'آپارات', url: 'https://aparat.com/teamdecision' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-surface-2/50 border border-border-subtle flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* ستون دسترسی سریع */}
          <div>
            <h3 className="font-bold text-sm text-foreground mb-5">دسترسی سریع</h3>
            <div className="space-y-3">
              {[
                { href: '/', label: 'صفحه اصلی' },
                { href: '/news', label: 'اخبار و مقالات' },
                { href: '/market-pulse', label: 'بازار یاب' },
                { href: '/price-estimator', label: 'قیمت ماشین' },
                { href: '/car-matchmaker', label: 'مشاور خرید' },
                { href: '/car-vs-car', label: 'مقایسه ماشین‌ها' },
                { href: '/compare', label: 'مقایسه آگهی‌ها' },
                { href: '/imported', label: 'خودروهای وارداتی' },
                { href: '/imported/charts', label: 'نمودارهای بازار واردات' },
                { href: '/imported/customs-calc', label: 'محاسبه هزینه واردات' },
                { href: '/parts', label: 'قطعات یدکی و ادوات' },
                { href: '/search', label: 'جستجوی پیشرفته' },
                { href: '/cursor-test', label: 'تست کرسور' },
                { href: '/dashboard/listings/new', label: 'ثبت آگهی رایگان' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-border-subtle group-hover:bg-primary transition-colors"></span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ستون دسته‌بندی‌ها */}
          <div>
            <h3 className="font-bold text-sm text-foreground mb-5">دسته‌بندی‌ها</h3>
            <div className="space-y-3">
              {[
                { href: '/categories/car', label: 'خودرو' },
                { href: '/categories/truck', label: 'کامیون و تریلی' },
                { href: '/categories/heavy', label: 'ماشین‌آلات سنگین' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-border-subtle group-hover:bg-primary transition-colors"></span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ستون پشتیبانی */}
          <div>
            <h3 className="font-bold text-sm text-foreground mb-5">پشتیبانی</h3>
            <div className="space-y-3">
              <a href="tel:02112345678" className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                ۰۲۱-۱۲۳۴۵۶۷۸
              </a>
              <a href="mailto:info@teamdecision.ir" className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                info@teamdecision.ir
              </a>
            </div>
          </div>
        </div>

        {/* کپی‌رایت */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© ۱۴۰۵ تیم دیسیژن. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">طراحی شده با <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline-block text-primary align-[-2px]" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> در ایران</span>
            {/* نمادهای اعتماد الکترونیکی (شبیه‌سازی شده) */}
            <div className="flex gap-2">
               <div className="w-8 h-10 rounded bg-surface-2 border border-border-subtle flex items-center justify-center text-[8px] text-muted-foreground font-bold text-center">نماد<br/>اعتماد</div>
               <div className="w-8 h-10 rounded bg-surface-2 border border-border-subtle flex items-center justify-center text-[8px] text-muted-foreground font-bold">ساماندهی</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}