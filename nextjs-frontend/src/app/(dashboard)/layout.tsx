'use client';

import { useAuthStore } from '@/store/authStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { EchoProvider } from '@/providers/EchoProvider';
import { RealtimeNotificationListener } from '@/components/common/RealtimeNotificationListener';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import Link from 'next/link';
import { PanelSidebar, type NavItem, type NavSection } from '@/components/layout/panel-sidebar';
import { useSidebarState } from '@/hooks/useSidebarState';
import {
  HomeIcon,
  ListingsIcon,
  NewListingIcon,
  MessagesIcon,
  FavoritesIcon,
  DealsIcon,
  SettingsIcon,
  StoreIcon,
  SubscriptionIcon,
  DealerIcon,
  AdminIcon,
  PartsIcon,
  BackToSiteIcon,
  MenuIcon,
} from '@/components/layout/sidebar-icons';

const BASE_NAV_LINKS: NavItem[] = [
  { href: '/dashboard', label: 'داشبورد', icon: HomeIcon },
  { href: '/dashboard/listings', label: 'آگهی‌های من', icon: ListingsIcon },
  { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: NewListingIcon },
  { href: '/dashboard/messages', label: 'پیام‌ها', icon: MessagesIcon },
  { href: '/dashboard/favorites', label: 'علاقه‌مندی‌ها', icon: FavoritesIcon },
  { href: '/dashboard/deals', label: 'معاملات', icon: DealsIcon },
  { href: '/dashboard/settings', label: 'تنظیمات', icon: SettingsIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const { isOpen, open, close } = useSidebarState();

  const role = user?.role || 'dashboard';

  const getRoleSections = (): NavSection[] => {
    const sections: NavSection[] = [];

    if (user?.role === 'store') {
      sections.push({
        label: 'پنل فروشگاه',
        links: [
          { href: '/store/inventory', label: 'پنل فروشگاه قطعات', icon: StoreIcon },
          { href: '/store/subscription', label: 'اشتراک', icon: SubscriptionIcon },
        ],
      });
    }

    if (user?.role === 'dealer' || user?.role === 'agency') {
      sections.push({
        label: 'پنل حرفه‌ای',
        links: [
          { href: '/dealer/listings', label: user?.role === 'agency' ? 'پنل نمایشگاه' : 'پنل نمایندگی', icon: DealerIcon },
          { href: '/dealer/subscription', label: 'اشتراک', icon: SubscriptionIcon },
        ],
      });
    }

    if (user?.role === 'admin') {
      sections.push({
        label: 'مدیریت سیستم',
        links: [
          { href: '/admin', label: 'پنل مدیریت', icon: AdminIcon },
        ],
      });
    }

    sections.push({
      label: 'سایر',
      links: [
        { href: '/parts', label: 'قطعات یدکی و ادوات', icon: PartsIcon },
        { href: '/catalog/tuning', label: 'قطعات تیونینگ', icon: PartsIcon },
        { href: '/catalog/accessory', label: 'اکسسوری خودرو', icon: PartsIcon },
        { href: '/workshops', label: 'تعمیرکاران و تیونرها', icon: PartsIcon },
        { href: '/workshop', label: 'پنل تعمیرکار', icon: PartsIcon },
        { href: '/dealer/subscription', label: 'خرید اشتراک حرفه‌ای', icon: SubscriptionIcon },
        { href: '/', label: 'بازگشت به سایت', icon: BackToSiteIcon },
      ],
    });

    return sections;
  };

  return (
    <AuthGuard>
      <EchoProvider>
        <div className="relative min-h-screen flex bg-background text-foreground">
          <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -z-0 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] -z-0 pointer-events-none" />

          <PanelSidebar
            navLinks={BASE_NAV_LINKS}
            sections={getRoleSections()}
            accentColor="bg-primary"
            role={role}
            name={user?.name}
            isOpen={isOpen}
            onClose={close}
          />

          {isOpen && <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-30 md:hidden" onClick={close} />}

          <main className="flex-1 min-h-screen relative z-10 flex flex-col">
            <div className="flex items-center justify-between gap-3 p-4 md:hidden border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20">
              <button onClick={open} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-colors" aria-label="باز کردن منو">
                {MenuIcon('h-5 w-5')}
              </button>
              <span className="font-bold text-base text-foreground">پنل کاربری</span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-colors" aria-label="صفحه اصلی">
                  {HomeIcon('h-5 w-5')}
                </Link>
              </div>
            </div>

            <div className="flex-1 p-4 md:p-8">{children}</div>
          </main>
        </div>
        <RealtimeNotificationListener />
      </EchoProvider>
    </AuthGuard>
  );
}
