'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated, useUser } from '@/store/authStore';
import { useLogoutModal } from '@/store/logoutModalStore';
import { usePWAInstall } from '@/components/common/PWAProvider';

interface NavItem {
  href: string;
  label: string;
  renderIcon: (className?: string) => React.ReactNode;
}

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const NAV_ITEMS: Record<string, NavItem> = {
  home: {
    href: '/', label: 'صفحه اصلی',
    renderIcon: (cn) => <Svg className={cn}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></Svg>,
  },
  dashboard: {
    href: '/dashboard', label: 'داشبورد',
    renderIcon: (cn) => <Svg className={cn}><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></Svg>,
  },
  messages: {
    href: '/dashboard/messages', label: 'پیام‌ها',
    renderIcon: (cn) => <Svg className={cn}><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></Svg>,
  },
  favorites: {
    href: '/dashboard/favorites', label: 'علاقه‌مندی‌ها',
    renderIcon: (cn) => <Svg className={cn}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></Svg>,
  },
  settings: {
    href: '/dashboard/settings', label: 'تنظیمات',
    renderIcon: (cn) => <Svg className={cn}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></Svg>,
  },
  dealer: {
    href: '/dealer/listings', label: 'پنل فروشندگی',
    renderIcon: (cn) => <Svg className={cn}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" /></Svg>,
  },
  subscription: {
    href: '/dealer/subscription', label: 'اشتراک',
    renderIcon: (cn) => <Svg className={cn}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Svg>,
  },
  admin: {
    href: '/admin', label: 'پنل مدیریت',
    renderIcon: (cn) => <Svg className={cn}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></Svg>,
  },
  listings: {
    href: '/listings', label: 'آگهی‌ها',
    renderIcon: (cn) => <Svg className={cn}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></Svg>,
  },
  news: {
    href: '/news', label: 'اخبار و مقالات',
    renderIcon: (cn) => <Svg className={cn}><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></Svg>,
  },
};

// SVG Icons for Quick Links (Replacing Emojis)
const QUICK_LINKS = [
  { href: '/market-pulse', label: 'بازار یاب', icon: <path d="M3 3v18h18M7 14l4-4 4 4 6-6" /> },
  { href: '/price-estimator', label: 'قیمت ماشین', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></> },
  { href: '/car-matchmaker', label: 'مشاور خرید', icon: <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8z" /> },
  { href: '/car-vs-car', label: 'مقایسه ماشین‌ها', icon: <path d="M16 3l4 4-4 4 M20 7H4 M8 21l-4-4 4-4 M4 17h16" /> },
  { href: '/compare', label: 'مقایسه آگهی‌ها', icon: <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /> },
  { href: '/imported', label: 'خودروهای وارداتی', icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></> },
  { href: '/parts', label: 'قطعات یدکی', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></> },
  { href: '/search', label: 'جستجوی پیشرفته', icon: <path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /> },
];

export function Sidebar() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const openLogoutModal = useLogoutModal((s) => s.open);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const commonLinks = ['home', 'listings', 'news', 'dashboard', 'messages', 'favorites', 'settings'];
  const dealerLinks = ['dealer', 'subscription'];

  const allLinks = [...commonLinks];
  if (user?.role === 'dealer' || user?.role === 'agency') {
    allLinks.push(...dealerLinks);
  }
  if (user?.role === 'admin') {
    allLinks.push('admin');
  }

  const { canInstall, installApp } = usePWAInstall();

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all group shadow-lg"
        aria-label={open ? 'بستن منو' : 'منوی دسترسی سریع'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {/* Backdrop */}
      <div className={`fixed inset-0 z-30 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={() => setOpen(false)} />
      </div>

      {/* Sidebar Panel */}
      <aside className={`fixed right-0 top-0 bottom-0 z-40 w-72 transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full glass border-l border-border flex flex-col">
          {/* Profile Header */}
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-md shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'کاربر'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === 'admin' ? 'مدیر سیستم' : user?.role === 'dealer' ? 'نماینده' : user?.role === 'agency' ? 'بنگاه' : 'کاربر'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {allLinks.map((key) => {
              const item = NAV_ITEMS[key];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'
                  }`}
                >
                  <span className={`shrink-0 ${isActive(item.href) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {item.renderIcon('h-4 w-4')}
                  </span>
                  {item.label}
                  {isActive(item.href) && (
                    <span className="mr-auto w-1.5 h-6 rounded-full bg-primary shadow-[0_0_8px_2px_var(--color-primary)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Links Section (Replaced Emojis with SVG) */}
          <div className="px-4 pb-2">
            <div className="border-t border-border pt-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">دسترسی سریع</p>
              <div className="grid grid-cols-2 gap-1">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Svg className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-primary">
                      {link.icon}
                    </Svg>
                    <span className="truncate">{link.label}</span>
                  </Link>
                ))}
              </div>
              <Link
                href="/dashboard/listings/new"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-2 py-2 mt-1 rounded-lg text-[11px] text-primary hover:bg-primary/5 transition-all"
              >
                <Svg className="w-3.5 h-3.5"><path d="M12 5v14M5 12h14" /></Svg>
                ثبت آگهی رایگان
              </Link>
            </div>
          </div>

          {/* Install App Button */}
          {canInstall && (
            <div className="px-3 pt-2">
              <button
                onClick={installApp}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-primary hover:bg-primary/5 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                نصب اپلیکیشن
              </button>
            </div>
          )}

          {/* Logout Button */}
          <div className={canInstall ? "p-3 pt-1 border-t border-border" : "p-3 pt-2 border-t border-border"}>
            <button
              onClick={() => { setOpen(false); openLogoutModal(() => {}); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              خروج از حساب
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}