'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/store/authStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';

function SvgIcon({ children, className = 'h-5 w-5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  );
}

const QUICK_LINKS = [
  { href: '/news', label: 'اخبار بازار', icon: <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />, keywords: 'news اخبار مقاله' },
  { href: '/market-pulse', label: 'نبض بازار', icon: <path d="M18 20V10M12 20V4M6 20v-6" />, keywords: 'pulse نبض قیمت' },
  { href: '/price-estimator', label: 'برآورد قیمت', icon: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>, keywords: 'price قیمت برآورد' },
  { href: '/car-matchmaker', label: 'مشاور خرید', icon: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />, keywords: 'مشاور خرید پیشنهاد' },
  { href: '/car-vs-car', label: 'مقایسه فنی', icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" />, keywords: 'مقایسه فنی خودرو' },
  { href: '/compare', label: 'مقایسه آگهی‌ها', icon: <path d="M4 6h16M4 12h16M4 18h16" />, keywords: 'مقایسه آگهی' },
  { href: '/imported', label: 'خودروهای وارداتی', icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>, keywords: 'وارداتی خارجی imported customs' },
  { href: '/parts', label: 'قطعات یدکی', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>, keywords: 'قطعات یدکی ادوات parts' },
  { href: '/search', label: 'جستجوی پیشرفته', icon: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>, keywords: 'جستجو search فیلتر' },
  { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: <path d="M12 5v14M5 12h14" />, keywords: 'ثبت آگهی فروش' },
];

const navItems = [
  {
    href: '/',
    label: 'خانه',
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  },
  {
    href: '/search',
    label: 'جستجو',
    icon: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>,
  },
];

const authNavItems = [
  {
    href: '/dashboard/favorites',
    label: 'علاقه‌مندی',
    icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  },
  {
    href: '/dashboard',
    label: 'پنل',
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  },
];

const guestNavItems = [
  {
    href: '/login',
    label: 'ورود',
    icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  },
];

export function MobileIslandNav({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const isAuthenticated = useIsAuthenticated();
  const pathname = usePathname();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    if (path === '/dashboard' && pathname === '/dashboard') return true;
    if (path === '/dashboard' && pathname !== '/dashboard/favorites' && pathname.startsWith('/dashboard/')) return true;
    if (path === '/dashboard/favorites' && pathname === '/dashboard/favorites') return true;
    return pathname === path;
  };

  const filteredLinks = QUICK_LINKS.filter((l) => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return true;
    return l.label.includes(q) || l.keywords?.toLowerCase().includes(q);
  });

  const items = [
    ...navItems,
    ...(isAuthenticated ? authNavItems : guestNavItems),
  ];

  return (
    <>
      {/* توپ ایلند */}
      <div className="md:hidden fixed top-4 inset-x-0 z-50 flex justify-center px-5">
        <div className="w-full max-w-sm glass rounded-full h-11 flex items-center justify-between px-4 border-border-subtle shadow-lg">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-all duration-200 active:scale-90"
            aria-label="منو"
          >
            <SvgIcon className="h-4.5 w-4.5">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 6h16M4 12h16M4 18h16" /></>}
            </SvgIcon>
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* باتوم ایلند */}
      <div className="md:hidden fixed bottom-5 inset-x-0 z-50 flex justify-center px-5">
        <div className="w-full max-w-sm glass rounded-full h-14 flex items-center justify-around px-2 border-border-subtle shadow-lg">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-full transition-all duration-200 ${
                  active
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                } ${item.href === '/dashboard/favorites' && active ? 'text-destructive bg-destructive/10' : ''}`}
                style={{ width: 48, height: 48 }}
              >
                <SvgIcon className={`h-[18px] w-[18px] transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </SvgIcon>
                <span className={`text-[9px] font-medium leading-none ${active ? 'opacity-100' : 'opacity-70'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => { setQuickOpen(true); setQuickQuery(''); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            style={{ width: 48, height: 48 }}
            aria-label="دسترسی سریع"
          >
            <SvgIcon className="h-[18px] w-[18px]">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </SvgIcon>
            <span className="text-[9px] font-medium leading-none opacity-70">سریع</span>
          </button>
          {isAuthenticated && (
            <Link
              href="/dashboard/listings/new"
              className="flex flex-col items-center justify-center"
              style={{ width: 48, height: 48 }}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow-accent transition-transform duration-200 active:scale-90">
                <SvgIcon className="h-5 w-5 text-white"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></SvgIcon>
              </div>
              <span className="text-[9px] font-medium text-primary leading-none mt-0.5">ثبت</span>
            </Link>
          )}
        </div>
      </div>

      {/* کوئیک اکسس پالت */}
      <div className={`fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4 transition-all duration-300 ease-out ${
        quickOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-300" onClick={() => setQuickOpen(false)} />
        <div className={`relative z-10 w-full max-w-2xl bg-surface-1/90 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 ease-out ${
          quickOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-95 scale-95 -translate-y-4'
        }`} role="dialog" aria-modal="true">
          <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-surface-2/40">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-muted-foreground shrink-0">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="جستجو در ابزارها و صفحات..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button onClick={() => setQuickOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-3 transition-colors text-muted-foreground" aria-label="بستن">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 max-h-[50vh] overflow-y-auto">
            {filteredLinks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredLinks.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setQuickOpen(false)}
                    className="group flex flex-col items-start gap-3 p-4 rounded-xl border border-border/30 hover:border-primary/30 bg-surface-2/30 hover:bg-primary/5 transition-all h-full"
                  >
                    <div className="w-9 h-9 rounded-lg bg-surface-2 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-muted-foreground group-hover:text-primary">
                        {link.icon}
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{link.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                نتیجه‌ای برای «{quickQuery}» یافت نشد.
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-border/30 bg-surface-2/20 text-[11px] text-muted-foreground flex justify-between items-center">
            <span className="flex items-center gap-2">
              <kbd className="bg-surface-2 border border-border rounded px-1.5 py-0.5 font-sans">ESC</kbd> برای بستن
            </span>
            <span>پلتفرم تخصصی بازارگاه</span>
          </div>
        </div>
      </div>
    </>
  );
}
