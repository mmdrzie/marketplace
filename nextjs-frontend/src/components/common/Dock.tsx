'use client';

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence,
} from 'framer-motion';
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, throttle } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { UserMenuButton } from './UserMenuButton';

const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 180;
const DEFAULT_PANEL_HEIGHT = 56;
const SCROLL_THRESHOLD = 10;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};
type NavLink = {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  isToggle?: boolean;
  isQuickAccess?: boolean;
  isDashboard?: boolean;
  isUserMenu?: boolean;
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
};
type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  mouseX: MotionValue;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};
type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function DockPanel({
  children,
  className,
  spring = { mass: 0.15, stiffness: 180, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={({ pageX }) => {
        mouseX.set(pageX);
      }}
      onMouseLeave={() => {
        mouseX.set(Infinity);
      }}
      className={cn(
        'mx-auto flex w-fit items-center gap-2',
        className
      )}
      style={{ height: panelHeight }}
      role="toolbar"
      aria-label="Application dock"
    >
      <DockProvider value={{ mouseX, spring, distance, magnification }}>
        {children}
      </DockProvider>
    </motion.div>
  );
}

function DockItem({ children, className }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { distance, magnification, mouseX, spring } = useDock();

  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [48, magnification, 48]
  );

  const width = useSpring(widthTransform, spring);
  const itemScale = useTransform(isHovered, [0, 1], [1, 1.1]);
  const scaleSpring = useSpring(itemScale, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width, scale: scaleSpring }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative inline-flex aspect-square items-center justify-center rounded-full bg-surface-2/70',
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) => {
        if (typeof (child as React.ReactElement)?.type === 'string') return child;
        return cloneElement(child as React.ReactElement<Record<string, unknown>>, { width, isHovered });
      })}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as MotionValue<number>;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'absolute top-full left-1/2 mt-1.5 w-fit whitespace-pre rounded-md border border-border bg-surface-3 px-2 py-0.5 text-[11px] text-muted-foreground',
            className
          )}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }: DockIconProps) {
  const restProps = rest as Record<string, unknown>;
  const width = restProps['width'] as MotionValue<number>;
  const isHovered = restProps['isHovered'] as MotionValue<number>;

  const widthTransform = useTransform(width, (val) => val / 2.4);
  const scale = useTransform(isHovered, [0, 1], [1, 1.15]);

  return (
    <motion.div
      style={{ width: widthTransform, scale }}
      className={cn('flex items-center justify-center text-muted-foreground', className)}
    >
      {children}
    </motion.div>
  );
}

// ----- Project-specific: nav data & integration -----

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const QUICK_LINKS = [
  { href: '/news', label: 'اخبار بازار', icon: <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />, keywords: 'news اخبار مقاله' },
  { href: '/market-pulse', label: 'نبض بازار', icon: <path d="M3 3v18h18" />, keywords: 'pulse نبض قیمت' },
  { href: '/price-estimator', label: 'برآورد قیمت', icon: <circle cx="12" cy="12" r="10" />, keywords: 'price قیمت برآورد' },
  { href: '/car-matchmaker', label: 'مشاور خرید', icon: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />, keywords: 'مشاور خرید پیشنهاد' },
  { href: '/car-vs-car', label: 'مقایسه فنی', icon: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />, keywords: 'مقایسه فنی خودرو' },
  { href: '/compare', label: 'مقایسه آگهی‌ها', icon: <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />, keywords: 'مقایسه آگهی' },
  { href: '/imported', label: 'خودروهای وارداتی', icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>, keywords: 'وارداتی خارجی imported customs' },
  { href: '/imported/customs-calc', label: 'محاسبه هزینه واردات', icon: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />, keywords: 'customs گمرک تعرفه واردات' },
  { href: '/parts', label: 'قطعات یدکی', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>, keywords: 'قطعات یدکی ادوات parts' },
  { href: '/search', label: 'جستجوی پیشرفته', icon: <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />, keywords: 'جستجو search فیلتر' },
  { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: <path d="M12 5v14M5 12h14" />, keywords: 'ثبت آگهی فروش' },
];

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'صفحه اصلی', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
  { href: '/listings', label: 'آگهی‌ها', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
  { href: '/news', label: 'اخبار', icon: <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /> },
  { href: '/categories', label: 'دسته‌بندی‌ها', icon: <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2" /> },
  { isDashboard: true, label: 'داشبورد' },
  { isQuickAccess: true, label: 'دسترسی سریع' },
  { isToggle: true, label: 'تغییر تم' },
  { isUserMenu: true, label: 'کاربر' },
];

export function Dock() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
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

  const dockY = useMotionValue(0);
  const dockYSpring = useSpring(dockY, { stiffness: 200, damping: 25 });

  useEffect(() => {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;

      if (Math.abs(currentScrollY - lastScrollY.current) > SCROLL_THRESHOLD) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          dockY.set(-120);
        } else if (currentScrollY < lastScrollY.current) {
          dockY.set(0);
        }
      }

      lastScrollY.current = currentScrollY;
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dockY]);

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
        className="fixed top-0 inset-x-0 z-50 pt-14"
      >
        <div className="flex justify-center">
            <DockPanel>
            {NAV_LINKS.map((link) => {
              if (link.isToggle) {
                return (
                  <DockItem key="theme-toggle">
                    <button
                      onClick={() => setTheme(isDark ? 'light' : 'dark')}
                      className="flex h-full w-full items-center justify-center text-muted-foreground"
                      aria-label={isDark ? 'تغییر به حالت روز' : 'تغییر به حالت شب'}
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
                    <DockLabel>{link.label}</DockLabel>
                  </DockItem>
                );
              }
              if (link.isDashboard) {
                if (!isAuthenticated) return null;
                const href = user?.role === 'admin' ? '/admin' : '/dashboard';
                return (
                  <Link key="dashboard" href={href} className="relative">
                    <DockItem>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground">
                        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                      </svg>
                      <DockLabel>{link.label}</DockLabel>
                    </DockItem>
                  </Link>
                );
              }
              if (link.isUserMenu) {
                if (!isAuthenticated) return null;
                return (
                  <div key="user-menu" className="relative flex items-center">
                    <UserMenuButton />
                  </div>
                );
              }
              if (link.isQuickAccess) {
                return (
                  <DockItem key="quick-access">
                    <button
                      onClick={() => {
                        setQuickOpen(true);
                        setQuickQuery('');
                        setTimeout(() => searchInputRef.current?.focus(), 50);
                      }}
                      className="flex h-full w-full items-center justify-center text-muted-foreground"
                      aria-label="دسترسی سریع"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </button>
                    <DockLabel>{link.label}</DockLabel>
                  </DockItem>
                );
              }
              if (!link.href) return null;
              const active = isActive(link.href!);
              return (
                <Link key={link.href} href={link.href!} className="relative">
                  <DockItem className={cn(active ? 'text-primary' : '')}>
                    <DockIcon className={cn(active ? 'text-primary' : '')}>
                      <SvgIcon className="h-5 w-5">{link.icon}</SvgIcon>
                    </DockIcon>
                    <DockLabel>{link.label}</DockLabel>
                  </DockItem>
                  <span className={cn(
                    'absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-opacity duration-200',
                    active ? 'opacity-100' : 'opacity-0'
                  )} />
                </Link>
              );
            })}
          </DockPanel>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {quickOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-overlay backdrop-blur-sm"
              onClick={() => setQuickOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="relative z-10 w-full max-w-2xl bg-surface-1/90 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden"
              role="dialog" aria-modal="true"
            >
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
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
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
                      </motion.div>
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
