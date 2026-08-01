'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import { EchoProvider } from '@/providers/EchoProvider';
import { RealtimeNotificationListener } from '@/components/common/RealtimeNotificationListener';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import Link from 'next/link';
import { PanelSidebar, type NavItem, type NavSection } from '@/components/layout/panel-sidebar';
import { useSidebarState } from '@/hooks/useSidebarState';
import {
  HomeIcon,
  StoreIcon,
  ModerationIcon,
  ListingsIcon,
  UsersIcon,
  ReportsIcon,
  CategoriesIcon,
  AttributesIcon,
  ProvincesIcon,
  SettingsIcon,
  SubscriptionIcon,
  BackToSiteIcon,
  MenuIcon,
} from '@/components/layout/sidebar-icons';

const NAV_LINKS: NavItem[] = [
  { href: '/admin', label: 'داشبورد', icon: HomeIcon },
  { href: '/admin/moderation', label: 'در انتظار تایید', icon: ModerationIcon },
  { href: '/admin/listings', label: 'همه آگهی‌ها', icon: ListingsIcon },
  { href: '/admin/users', label: 'کاربران', icon: UsersIcon },
  { href: '/admin/stores', label: 'فروشگاه‌ها', icon: StoreIcon },
  { href: '/admin/reports', label: 'گزارشات', icon: ReportsIcon },
  { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: CategoriesIcon },
  { href: '/admin/attributes', label: 'ویژگی‌ها', icon: AttributesIcon },
  { href: '/admin/provinces', label: 'استان‌ها و شهرها', icon: ProvincesIcon },
  { href: '/admin/contents', label: 'مدیریت محتوا', icon: ListingsIcon },
  { href: '/admin/contents/categories', label: 'دسته‌بندی محتوا', icon: CategoriesIcon },
  { href: '/admin/contents/types', label: 'انواع محتوا', icon: AttributesIcon },
  { href: '/admin/parts', label: 'کاتالوگ قطعات', icon: StoreIcon },
  { href: '/admin/parts/categories', label: 'دسته‌بندی قطعات', icon: CategoriesIcon },
  { href: '/admin/parts/suggestions', label: 'پیشنهادات فروشندگان', icon: ModerationIcon },
  { href: '/admin/workshops', label: 'تعمیرکاران و تیونرها', icon: StoreIcon },
  { href: '/admin/settings', label: 'تنظیمات', icon: SettingsIcon },
];

const SECTIONS: NavSection[] = [
  {
    label: 'لینک‌های جانبی',
    links: [
      { href: '/dealer/subscription', label: 'خرید اشتراک', icon: SubscriptionIcon },
      { href: '/', label: 'بازگشت به سایت', icon: BackToSiteIcon },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const { isOpen, open, close } = useSidebarState();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') router.push('/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <EchoProvider>
      <div className="relative min-h-screen flex bg-background text-foreground">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 5%, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[130px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-warning) 5%, transparent)' }} />

        <PanelSidebar
          navLinks={NAV_LINKS}
          sections={SECTIONS}
          accentColor="bg-destructive"
          role="admin"
          name={user?.name}
          isOpen={isOpen}
          onClose={close}
        />

        {isOpen && <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-30 md:hidden" onClick={close} />}

        <main className="flex-1 min-h-screen relative z-10 flex flex-col">
          <div className="flex items-center justify-between gap-3 p-4 md:hidden border-b border-border bg-surface backdrop-blur-xl sticky top-0 z-20">
            <button onClick={open} className="btn btn-ghost btn-sm" aria-label="باز کردن منو">
              {MenuIcon('h-5 w-5')}
            </button>
            <span className="font-bold text-base text-foreground">پنل مدیریت</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Link href="/" className="btn btn-ghost btn-sm" aria-label="صفحه اصلی">
                {HomeIcon('h-5 w-5')}
              </Link>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-8"><ErrorBoundary>{children}</ErrorBoundary></div>
        </main>
      </div>
      <RealtimeNotificationListener />
    </EchoProvider>
  );
}
