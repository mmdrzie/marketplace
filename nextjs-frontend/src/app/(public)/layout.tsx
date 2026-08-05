'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Dock } from '@/components/common/Dock';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileIslandNav } from '@/components/layout/MobileIslandNav';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { useIsAuthenticated } from '@/store/authStore';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollPositions = useRef<Record<string, number>>({});
  const prevPathname = useRef(pathname);
  const isAuthenticated = useIsAuthenticated();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      scrollPositions.current[prevPathname.current] = window.scrollY;
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const saved = scrollPositions.current[pathname];
    if (saved !== undefined) {
      requestAnimationFrame(() => window.scrollTo(0, saved));
    }
  }, [pathname]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const menuLinks = [
    { href: '/', label: 'خانه' },
    { href: '/search', label: 'جستجو' },
    { href: '/categories', label: 'دسته‌بندی‌ها' },
    { href: '/news', label: 'اخبار' },
    { href: '/encyclopedia', label: 'دانشنامه' },
    { href: '/compare', label: 'مقایسه' },
    { href: '/car-vs-car', label: 'ماشین با ماشین' },
    { href: '/market-pulse', label: 'نبض بازار' },
    { href: '/price-estimator', label: 'تخمین قیمت' },
    { href: '/tenders', label: 'مناقصات' },
    { href: '/imported', label: 'وارداتی' },
    { href: '/parts', label: 'قطعات یدکی' },
    { href: '/catalog/tuning', label: 'قطعات تیونینگ' },
    { href: '/catalog/accessory', label: 'اکسسوری خودرو' },
    { href: '/workshops', label: 'تعمیرکاران و تیونرها' },
    { href: '/insurance', label: 'بیمه' },
    { href: '/pricing', label: 'تعرفه‌ها' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      
      {/* شبکه نقطه‌ای یکدست */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.14] dark:opacity-[0.09]" />
      </div>

      {/* ایلند نویگیشن موبایل (جایگزین هدر + باتوم) */}
      <MobileIslandNav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* منوی کشویی موبایل - با انیمیشن */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ease-out ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
      </div>
      <div className={`fixed top-16 right-0 z-[60] w-72 max-w-[85vw] h-[calc(100vh-4rem)] glass rounded-l-2xl border-l border-border shadow-2xl md:hidden overflow-y-auto transition-all duration-300 ease-out ${
        menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <nav className="p-4 space-y-1">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className={`flex items-center px-4 py-3 rounded-xl text-sm transition-all ${
                pathname === link.href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border my-4" />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" onClick={closeMenu} className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-surface-2/50 transition-all">
                داشبورد
              </Link>
              <Link href="/dashboard/messages" onClick={closeMenu} className="flex items-center px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-surface-2/50 hover:text-foreground transition-all">
                پیام‌ها
              </Link>
              <Link href="/dashboard/listings/new" onClick={closeMenu} className="flex items-center px-4 py-3 rounded-xl text-sm text-primary font-medium hover:bg-primary/5 transition-all">
                ثبت آگهی جدید
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu} className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/5 transition-all">
                ورود / ثبت‌نام
              </Link>
            </>
          )}
        </nav>
      </div>

      <Dock />
      <Sidebar />
      <main id="main-content" className="flex-1 relative z-10 pt-16 pb-28 md:pt-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}