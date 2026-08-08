import os

filepath = r'C:\projects\marketplace\nextjs-frontend\src\components\common\Dock.tsx'

content = r"""'use client';

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
  { href: '/listings', label: '\u0622\u06af\u0647\u06cc\u200c\u0647\u0627', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
  { href: '/news', label: '\u0627\u062e\u0628\u0627\u0631', icon: <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
  { href: '/encyclopedia', label: '\u062f\u0627\u0646\u0634\u0646\u0627\u0645\u0647', icon: <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /> },
  { href: '/categories', label: '\u062f\u0633\u062a\u0647\u200c\u0628\u0646\u062f\u06cc\u200c\u0647\u0627', icon: <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2" /> },
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
        className="max-md:hidden fixed top-0 inset-x-0 z-50 pt-5"
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

      <AnimatePresence mode="wait">
        {quickOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-overlay backdrop-blur-sm" onClick={() => setQuickOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="relative z-10 w-full max-w-2xl bg-surface-1/90 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden"
              role="dialog" aria-modal="true"
            >
              <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-surface-2/40">
                <SvgIcon className="w-5 h-5 text-muted-foreground shrink-0"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></SvgIcon>
                <input ref={searchInputRef} value={quickQuery} onChange={(e) => setQuickQuery(e.target.value)} placeholder="\u062c\u0633\u062a\u062c\u0648 \u062f\u0631 \u0627\u0628\u0632\u0627\u0631\u0647\u0627 \u0648 \u0635\u0641\u062d\u0627\u062a..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                <button onClick={() => setQuickOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-3 transition-colors text-muted-foreground" aria-label="\u0628\u0633\u062a\u0646">
                  <SvgIcon className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></SvgIcon>
                </button>
              </div>
              <div className="p-4 max-h-[50vh] overflow-y-auto overscroll-contain">
                {filteredLinks.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {filteredLinks.map((link, i) => (
                      <motion.div key={link.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Link href={link.href} onClick={() => setQuickOpen(false)} className="group flex flex-col items-start gap-3 p-4 rounded-xl border border-border/30 hover:border-primary/30 bg-surface-2/30 hover:bg-primary/5 transition-all h-full">
                          <div className="w-9 h-9 rounded-lg bg-surface-2 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                            <SvgIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary">{link.icon}</SvgIcon>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{link.label}</span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm text-muted-foreground">\u0646\u062a\u06cc\u062c\u0647\u200c\u0627\u06cc \u0628\u0631\u0627\u06cc \u00ab{quickQuery}\u00bb \u06cc\u0627\u0641\u062a \u0646\u0634\u062f.</div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border/30 bg-surface-2/20 text-[11px] text-muted-foreground flex justify-between items-center">
                <span className="flex items-center gap-2"><kbd className="bg-surface-2 border border-border rounded px-1.5 py-0.5 font-sans">ESC</kbd> \u0628\u0631\u0627\u06cc \u0628\u0633\u062a\u0646</span>
                <span>\u067e\u0644\u062a\u0641\u0631\u0645 \u062a\u062e\u0635\u0635\u06cc \u0628\u0627\u0632\u0627\u0631\u06af\u0627\u0647</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
"""

with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Dock.tsx written successfully!')
