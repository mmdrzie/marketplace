'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import { useLogoutModal } from '@/store/logoutModalStore';
import { EchoProvider } from '@/providers/EchoProvider';
import { RealtimeNotificationListener } from '@/components/common/RealtimeNotificationListener';
import Link from 'next/link';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();
  const openLogoutModal = useLogoutModal((s) => s.open);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'dealer' && user?.role !== 'agency')) router.push('/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'dealer' && user?.role !== 'agency')) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isAgency = user?.role === 'agency';

  const navbarLabel = isAgency ? 'پنل بنگاه' : 'پنل نمایندگی';

  const navLinks = [
    {
      href: '/dealer/listings', label: 'آگهی‌های من',
      icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />,
    },
    {
      href: '/dealer/stats', label: 'آمار و عملکرد',
      icon: <path d="M18 20V10M12 20V4M6 20v-6" />,
    },
    {
      href: '/dealer/subscription', label: 'اشتراک',
      icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    },
    {
      href: '/dealer/fleet', label: 'مدیریت ناوگان',
      icon: <path d="M4 17h16M4 17l-2-5h20l-2 5M4 17a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z" />,
    },
    {
      href: '/dealer/tenders', label: 'مناقصات',
      icon: <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.5a2 2 0 011.5.625L19.5 7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7" />,
    },
  ];

  return (
    <EchoProvider>
    <div className="relative min-h-screen flex bg-background text-foreground">
        <div className={`absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] -z-0 ${isAgency ? 'bg-warning/5' : ''}`} style={!isAgency ? { backgroundColor: 'color-mix(in srgb, var(--color-success) 5%, transparent)' } : {}} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[130px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 5%, transparent)' }} />

      <aside className={`fixed md:sticky top-0 md:h-screen inset-y-0 right-0 z-40 w-72 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="h-full glass rounded-l-3xl border-l border-border-subtle shadow-2xl flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-lg shrink-0 ${isAgency ? 'bg-gradient-accent' : 'bg-success'}`}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'کاربر'}</p>
                <p className="text-xs text-muted-foreground truncate">{isAgency ? 'بنگاه' : 'نماینده'}{user?.dealer_profile?.business_name ? ` - ${user.dealer_profile.business_name}` : ''}</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden btn btn-ghost btn-sm shrink-0">
                <SvgIcon><path d="M18 6L6 18M6 6l12 12" /></SvgIcon>
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">{navbarLabel}</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                  isActive(link.href)
                    ? (isAgency ? 'bg-warning/10 text-foreground font-medium' : 'bg-success/10 text-foreground font-medium')
                    : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                }`}
              >
                <span className={`shrink-0 ${isActive(link.href) ? (isAgency ? 'text-warning' : 'text-success') : 'text-muted-foreground group-hover:text-foreground'}`}>
                  <SvgIcon>{link.icon}</SvgIcon>
                </span>
                {link.label}
                {isActive(link.href) && (
                  <span className={`mr-auto w-1 h-5 rounded-full ${isAgency ? 'bg-warning' : 'bg-success'} shadow-lg`} />
                )}
              </Link>
            ))}

            <div className="border-t border-border my-4" />
            <Link href="/parts" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all group">
              <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
                <SvgIcon><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></SvgIcon>
              </span>
              قطعات یدکی و ادوات
            </Link>
            <Link href="/dashboard" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all group">
              <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
                <SvgIcon><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></SvgIcon>
              </span>
              داشبورد اصلی
            </Link>
            <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all group">
              <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
                <SvgIcon><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></SvgIcon>
              </span>
              بازگشت به سایت
            </Link>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => { setSidebarOpen(false); openLogoutModal(() => {}); }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-colors ${isAgency ? 'text-warning hover:bg-warning/5' : 'text-success hover:bg-success/5'}`}
            >
              <SvgIcon>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </SvgIcon>
              خروج از حساب
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-h-screen relative z-10 flex flex-col">
        <div className="flex items-center justify-between gap-3 p-4 md:hidden border-b border-border bg-surface backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost btn-sm">
            <SvgIcon><path d="M4 6h16M4 12h16M4 18h16" /></SvgIcon>
          </button>
          <span className="font-bold text-base text-foreground">{navbarLabel}</span>
          <Link href="/" className="btn btn-ghost btn-sm">
            <SvgIcon><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></SvgIcon>
          </Link>
        </div>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>
    </div>
      <RealtimeNotificationListener />
    </EchoProvider>
  );
}
