'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useIsAuthenticated } from '@/store/authStore';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { QUICK_LINKS } from '@/config/nav';

function SvgIcon({ children, className = 'h-5 w-5' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  );
}

const MENU_SECTIONS = [
  {
    title: 'اصلی',
    items: [
      { href: '/', label: 'صفحه اصلی', icon: 'home' },
      { href: '/search', label: 'جستجو', icon: 'search' },
    ],
  },
  {
    title: 'دسترسی سریع',
    items: [
      { href: '/encyclopedia', label: 'دانشنامه', icon: 'book' },
      { href: '/workshops', label: 'تعمیرکاران', icon: 'wrench' },
      { href: '/insurance', label: 'بیمه', icon: 'shield' },
    ],
  },
];

const ACCOUNT_ITEMS = [
  { href: '/dashboard', label: 'پروفایل', icon: 'user' },
  { href: '/dashboard/favorites', label: 'علاقه‌مندی‌ها', icon: 'heart' },
];

const IconSvg = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const ICONS: Record<string, React.ReactNode> = {
  home: <IconSvg><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></IconSvg>,
  search: <IconSvg><><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></></IconSvg>,
  book: <IconSvg><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /></IconSvg>,
  wrench: <IconSvg><path d="M12 15l3.5-3.5M20.3 18a10 10 0 10-16.6 0" /></IconSvg>,
  shield: <IconSvg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></IconSvg>,
  user: <IconSvg><><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></></IconSvg>,
  heart: <IconSvg><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></IconSvg>,
  bolt: <IconSvg><path d="M13 10V3L4 14h7v7l9-11h-7z" /></IconSvg>,
};

export function MobileIslandNav({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  const isAuthenticated = useIsAuthenticated();
  const pathname = usePathname();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };

  const filteredLinks = QUICK_LINKS.filter((l) => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return true;
    return l.label.includes(q) || l.keywords?.toLowerCase().includes(q);
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setQuickOpen(false);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setQuickOpen((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden fixed top-3 inset-x-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-sm flex items-center justify-between">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`mobile-hamburger ${menuOpen ? 'open' : ''}`}
            aria-label="منو"
          >
            <div className="mobile-hamburger__line" />
            <div className="mobile-hamburger__line" />
            <div className="mobile-hamburger__line" />
          </button>
          <ThemeToggle />
        </div>
      </div>

      {/* Slide Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="md:hidden fixed inset-y-0 right-0 w-[75%] z-40 mobile-slide-menu"
          >
            <div className="h-full overflow-y-auto pt-20 pb-8 px-5">
              {MENU_SECTIONS.map((section, si) => (
                <div key={si} className="mobile-menu-section">
                  <div className="mobile-menu-section__title">{section.title}</div>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`mobile-menu-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                      <div className="mobile-menu-item__icon">{ICONS[item.icon]}</div>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="mobile-menu-divider" />

              <div className="mobile-menu-section">
                <div className="mobile-menu-section__title">حساب کاربری</div>
                {(isAuthenticated ? ACCOUNT_ITEMS : [{ href: '/login', label: 'ورود / ثبت‌نام', icon: 'user' }]).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`mobile-menu-item ${isActive(item.href) ? 'active' : ''}`}
                  >
                    <div className="mobile-menu-item__icon">{ICONS[item.icon]}</div>
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mobile-menu-footer">بازارگاه — نسل جدید معامله خودرو</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
      )}

      {/* Floating Bottom Nav */}
      <div className="md:hidden fixed bottom-6 inset-x-0 z-20 flex justify-center px-4">
        <div className="floating-nav">
          <Link
            href="/"
            className={`floating-nav__btn ${isActive('/') ? 'active' : ''}`}
          >
            <div className="floating-nav__icon">
              <SvgIcon className="h-6 w-6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></SvgIcon>
            </div>
            <span className="floating-nav__label">خانه</span>
          </Link>

          <Link
            href="/search"
            className={`floating-nav__btn ${pathname === '/search' || pathname.startsWith('/search') ? 'active' : ''}`}
          >
            <div className="floating-nav__icon">
              <SvgIcon className="h-6 w-6"><><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></></SvgIcon>
            </div>
            <span className="floating-nav__label">جستجو</span>
          </Link>

          {isAuthenticated && (
            <Link href="/dashboard/listings/new" className="floating-nav__btn floating-nav__fab">
              <div className="floating-nav__icon">
                <SvgIcon className="h-7 w-7"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></SvgIcon>
              </div>
              <span className="floating-nav__label">ثبت آگهی</span>
            </Link>
          )}

          <button
            onClick={() => { setQuickOpen(true); setQuickQuery(''); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="floating-nav__btn"
          >
            <div className="floating-nav__icon">
              <SvgIcon className="h-6 w-6"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></SvgIcon>
            </div>
            <span className="floating-nav__label">سریع</span>
          </button>

          <Link
            href={isAuthenticated ? '/dashboard' : '/login'}
            className={`floating-nav__btn ${pathname.startsWith('/dashboard') || pathname === '/login' ? 'active' : ''}`}
          >
            <div className="floating-nav__icon">
              <SvgIcon className="h-6 w-6"><><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></></SvgIcon>
            </div>
            <span className="floating-nav__label">پروفایل</span>
          </Link>
        </div>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {quickOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-overlay/80 backdrop-blur-md" onClick={() => setQuickOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-lg"
              role="dialog" aria-modal="true"
            >
              <div className="relative glass-strong rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <SvgIcon className="w-4 h-4 text-primary"><><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></></SvgIcon>
                  </div>
                  <input ref={searchInputRef} value={quickQuery} onChange={(e) => setQuickQuery(e.target.value)} placeholder="جستجو در ابزارها و صفحات..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none" />
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border/50 text-[10px] text-muted-foreground font-sans">ESC</kbd>
                </div>
                <div className="max-h-[60vh] overflow-y-auto py-2">
                  {filteredLinks.length > 0 ? (
                    <div className="px-2">
                      {filteredLinks.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setQuickOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-2/60 transition-all">
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface-2/80">
                            <SvgIcon className="w-5 w-5 text-muted-foreground">{link.icon}</SvgIcon>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{link.label}</div>
                            <div className="text-[11px] text-muted-foreground/70 truncate">{link.href}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-sm text-muted-foreground">نتیجه‌ای برای «{quickQuery}» یافت نشد.</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
