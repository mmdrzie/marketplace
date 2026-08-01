'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import { EchoProvider } from '@/providers/EchoProvider';
import { RealtimeNotificationListener } from '@/components/common/RealtimeNotificationListener';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import Link from 'next/link';
import { PanelSidebar, type NavItem, type NavSection } from '@/components/layout/panel-sidebar';
import { useSidebarState } from '@/hooks/useSidebarState';
import {
  ListingsIcon,
  StatsIcon,
  SubscriptionIcon,
  FleetIcon,
  TendersIcon,
  PartsIcon,
  HomeIcon,
  BackToSiteIcon,
  MenuIcon,
} from '@/components/layout/sidebar-icons';

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const { isOpen, open, close } = useSidebarState();

  const isAgency = user?.role === 'agency';
  const accentColor = isAgency ? 'bg-warning' : 'bg-success';

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'dealer' && user?.role !== 'agency')) router.push('/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'dealer' && user?.role !== 'agency')) return null;

  const NAV_LINKS: NavItem[] = [
    { href: '/dealer/listings', label: 'آگهی‌های من', icon: ListingsIcon },
    { href: '/dealer/stats', label: 'آمار و عملکرد', icon: StatsIcon },
    { href: '/dealer/subscription', label: 'اشتراک', icon: SubscriptionIcon },
    { href: '/dealer/fleet', label: 'مدیریت ناوگان', icon: FleetIcon },
    { href: '/dealer/tenders', label: 'مناقصات', icon: TendersIcon },
  ];

  const SECTIONS: NavSection[] = [
    {
      label: 'لینک‌های جانبی',
      links: [
        { href: '/parts', label: 'قطعات یدکی و ادوات', icon: PartsIcon },
        { href: '/catalog/tuning', label: 'قطعات تیونینگ', icon: PartsIcon },
        { href: '/catalog/accessory', label: 'اکسسوری خودرو', icon: PartsIcon },
        { href: '/workshops', label: 'تعمیرکاران و تیونرها', icon: PartsIcon },
        { href: '/workshop', label: 'پنل تعمیرکار', icon: PartsIcon },
        { href: '/dashboard', label: 'داشبورد اصلی', icon: HomeIcon },
        { href: '/', label: 'بازگشت به سایت', icon: BackToSiteIcon },
      ],
    },
  ];

  return (
    <EchoProvider>
      <div className="relative min-h-screen flex bg-background text-foreground">
        <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] -z-0 ${isAgency ? 'bg-warning/5' : ''}`} style={!isAgency ? { backgroundColor: 'color-mix(in srgb, var(--color-success) 5%, transparent)' } : {}} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[130px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 5%, transparent)' }} />

        <PanelSidebar
          navLinks={NAV_LINKS}
          sections={SECTIONS}
          accentColor={accentColor}
          role={user?.role || 'dealer'}
          name={user?.name}
          businessName={user?.dealer_profile?.business_name}
          isOpen={isOpen}
          onClose={close}
        />

        {isOpen && <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-30 md:hidden" onClick={close} />}

        <main className="flex-1 min-h-screen relative z-10 flex flex-col">
          <div className="flex items-center justify-between gap-3 p-4 md:hidden border-b border-border bg-surface backdrop-blur-xl sticky top-0 z-20">
            <button onClick={open} className="btn btn-ghost btn-sm" aria-label="باز کردن منو">
              {MenuIcon('h-5 w-5')}
            </button>
            <span className="font-bold text-base text-foreground">{isAgency ? 'پنل نمایشگاه' : 'پنل نمایندگی'}</span>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Link href="/" className="btn btn-ghost btn-sm" aria-label="صفحه اصلی">
                {HomeIcon('h-5 w-5')}
              </Link>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </main>
      </div>
      <RealtimeNotificationListener />
    </EchoProvider>
  );
}
