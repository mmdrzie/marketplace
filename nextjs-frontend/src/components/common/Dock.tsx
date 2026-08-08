'use client';

import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, throttle } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useIsAuthenticated, useUser } from '@/store/authStore';
import { UserMenuButton } from './UserMenuButton';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { QUICK_LINKS } from '@/config/nav';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const NAV_LINKS = [
  { href: '/', label: '\u0635\u0641\u062d\u0647 \u0627\u0635\u0644\u06cc', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { href: '/news', label: '\u0627\u062e\u0628\u0627\u0631', icon: <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
  { href: '/encyclopedia', label: '\u062f\u0627\u0646\u0634\u0646\u0627\u0645\u0647', icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /> },
  { href: '/search', label: '\u062c\u0633\u062a\u062c\u0648', icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
  { isDashboard: true, label: '\u062f\u0627\u0634\u0628\u0648\u0631\u062f' },
  { isQuickAccess: true, label: '\u062f\u0633\u062a\u0631\u0633\u06cc \u0633\u0631\u06cc\u0639' },
  { isToggle: true, label: '\u062a\u063a\u06cc\u06cc\u0631 \u062a\u0645' },
  { isUserMenu: true, label: '\u06a9\u0627\u0631\u0628\u0631' },
];

export function Dock() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const lastScrollY = useRef(0);

  const isDark = mounted && resolvedTheme === 'dark';
  const reducedMotion = usePrefersReducedMotion();

  const dockY = useMotionValue(0);
  const dockYSpring = useSpring(dockY, { stiffness: reducedMotion ? 500 : 200, damping: reducedMotion ? 50 : 25 });

  useEffect(() => {
    if (reducedMotion) return;
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          dockY.set(-200);
        } else if (currentScrollY < lastScrollY.current) {
          dockY.set(0);
        }
      }
      lastScrollY.current = currentScrollY;
    }, 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dockY, reducedMotion]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredLinks = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return QUICK_LINKS;
    return QUICK_LINKS.filter((l) => l.label.includes(q) || l.keywords?.toLowerCase().includes(q));
  }, [quickQuery]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      <motion.div
        style={{ y: dockYSpring }}
        className="max-md:hidden fixed top-0 inset-x-0 z-50 pt-14"
      >
        <div className="flex justify-center">
          <div className="dock-root" role="toolbar" aria-label="Application dock">
            {NAV_LINKS.map((link) => {
              if (link.isToggle) {
                return (
                  <div key="theme-toggle" className="dock-item-wrap">
                    <button
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                      className="dock-icon dock-icon--theme"
                      aria-label={isDark ? '\u062a\u063a\u06cc\u06cc\u0631 \u0628\u0647 \u062d\u0627\u0644\u062a \u0631\u0648\u0632' : '\u062a\u063a\u06cc\u06cc\u0631 \u0628\u0647 \u062d\u0627\u0644\u062a \u0634\u0628'}
                    >
                      {mounted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          {isDark ? (
                            <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>
                          ) : (
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          )}
                        </svg>
                      ) : (
                        <div className="h-5 w-5 bg-surface-3 rounded" />
                      )}
                    </button>
                    <span className="dock-label">{link.label}</span>
                  </div>
                );
              }
              if (link.isDashboard) {
                if (!isAuthenticated) return null;
                const href = user?.role === 'admin' ? '/admin' : '/dashboard';
                const dashActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key="dashboard" href={href} className="dock-item-wrap" aria-label={link.label}>
                    <span className={cn('dock-icon', dashActive && 'dock-icon--active')}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </span>
                    <span className={cn('dock-label', dashActive && 'dock-label--active')}>{link.label}</span>
                  </Link>
                );
              }
              if (link.isUserMenu) {
                if (!isAuthenticated) return null;
                return (
                  <div key="user-menu" className="dock-item-wrap">
                    <UserMenuButton />
                    <span className="dock-label">{link.label}</span>
                  </div>
                );
              }
              if (link.isQuickAccess) {
                return (
                  <div key="quick-access" className="dock-item-wrap">
                    <button
                      onClick={() => { setQuickOpen(true); setQuickQuery(''); setTimeout(() => searchInputRef.current?.focus(), 50); }}
                      className="dock-icon dock-icon--quick"
                      aria-label="\u062f\u0633\u062a\u0631\u0633\u06cc \u0633\u0631\u06cc\u0639"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                    <span className="dock-label">{link.label}</span>
                  </div>
                );
              }
              if (!link.href) return null;
              const active = isActive(link.href!);
              return (
                <Link key={link.href} href={link.href!} className="dock-item-wrap" aria-label={link.label}>
                  <span className={cn('dock-icon', active && 'dock-icon--active')}>
                    <SvgIcon className="h-5 w-5">{link.icon}</SvgIcon>
                  </span>
                  <span className={cn('dock-label', active && 'dock-label--active')}>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ===== COMMAND PALETTE (Premium Spotlight) ===== */}
      <AnimatePresence>
        {quickOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay/80 backdrop-blur-md"
              onClick={() => setQuickOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-xl"
              role="dialog" aria-modal="true"
            >
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 blur-sm pointer-events-none" />
              <div className="relative rounded-2xl overflow-hidden" style={{ background: 'var(--color-glass-bg)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid var(--color-glass-border)', boxShadow: 'var(--shadow-glass)' }}>
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <SvgIcon className="w-4 h-4 text-primary"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></SvgIcon>
                  </div>
                  <input ref={searchInputRef} value={quickQuery} onChange={(e) => setQuickQuery(e.target.value)} placeholder="جستجو در ابزارها و صفحات..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none" />
                  <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-surface-2 border border-border/50 text-[10px] text-muted-foreground font-sans">ESC</kbd>
                </div>
                <div className="max-h-[55vh] overflow-y-auto py-2">
                  {filteredLinks.length > 0 ? (
                    <div className="px-2">
                      {(['browse', 'tools', 'account'] as const).map((cat) => {
                        const catLinks = filteredLinks.filter((l) => l.category === cat);
                        if (catLinks.length === 0) return null;
                        return (
                          <div key={cat} className="mb-1">
                            <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                              {cat === 'browse' ? 'مرور' : cat === 'tools' ? 'ابزارها' : 'حساب کاربری'}
                            </div>
                            {catLinks.map((link) => (
                              <Link key={link.href} href={link.href} onClick={() => setQuickOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2/60 hover:text-foreground transition-all">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-2/80">
                                  <SvgIcon className="w-4 h-4">{link.icon}</SvgIcon>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-foreground truncate">{link.label}</div>
                                  <div className="text-[11px] text-muted-foreground/70 truncate">{link.href}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-surface-2/50 flex items-center justify-center">
                        <SvgIcon className="w-5 h-5 text-muted-foreground/50"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></SvgIcon>
                      </div>
                      <p className="text-sm text-muted-foreground">نتیجه‌ای برای «{quickQuery}» یافت نشد</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">عبارت دیگری را امتحان کنید</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/30 bg-surface-2/30">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70">
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface-2 border border-border/40 font-sans">↑↓</kbd> حرکت</span>
                    <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface-2 border border-border/40 font-sans">↵</kbd> انتخاب</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">⌘K</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
