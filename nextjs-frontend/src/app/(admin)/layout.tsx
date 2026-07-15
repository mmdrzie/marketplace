'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import { useLogoutModal } from '@/store/logoutModalStore';
import { EchoProvider } from '@/providers/EchoProvider';
import { RealtimeNotificationListener } from '@/components/common/RealtimeNotificationListener';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();
  const openLogoutModal = useLogoutModal((s) => s.open);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') router.push('/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navLinks = [
    { href: '/admin', label: 'داشبورد', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { href: '/admin/moderation', label: 'در انتظار تایید', icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { href: '/admin/listings', label: 'همه آگهی‌ها', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { href: '/admin/users', label: 'کاربران', icon: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /> },
    { href: '/admin/reports', label: 'گزارشات', icon: <path d="M18 20V10M12 20V4M6 20v-6" /> },
    { href: '/admin/categories', label: 'دسته‌بندی‌ها', icon: <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /> },
    { href: '/admin/attributes', label: 'ویژگی‌ها', icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
    { href: '/admin/provinces', label: 'استان‌ها و شهرها', icon: <><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></> },
    { href: '/admin/settings', label: 'تنظیمات', icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
  ];

  return (
    <EchoProvider>
    <div className="relative min-h-screen flex bg-background text-foreground">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[150px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 5%, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[130px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-warning) 5%, transparent)' }} />

      <aside className={`fixed md:sticky top-0 md:h-screen inset-y-0 right-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="h-full glass rounded-l-3xl border-l border-border-subtle shadow-2xl flex flex-col">
          <div className="p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center text-white font-bold text-base shadow-lg shadow-rose-500/20 shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'مدیر'}</p>
                <p className="text-xs text-muted-foreground truncate">مدیر سیستم</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden btn btn-ghost btn-sm shrink-0" aria-label="بستن منو">
                <SvgIcon><path d="M18 6L6 18M6 6l12 12" /></SvgIcon>
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3 mb-2">مدیریت</p>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                  isActive(link.href)
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                }`}
                style={isActive(link.href) ? { background: 'linear-gradient(to right, color-mix(in srgb, var(--color-destructive) 10%, transparent), transparent)' } : undefined}
              >
                <span className={`shrink-0 ${isActive(link.href) ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  <SvgIcon>{link.icon}</SvgIcon>
                </span>
                {link.label}
                {isActive(link.href) && (
                  <span className="mr-auto w-1 h-5 rounded-full bg-destructive shadow-glow-destructive" />
                )}
              </Link>
            ))}

            <div className="border-t border-border my-4" />
            <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-all group">
              <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
                <SvgIcon><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></SvgIcon>
              </span>
              بازگشت به سایت
            </Link>
          </nav>

          <div className="p-4 border-t border-border">
            <button
              onClick={() => { setSidebarOpen(false); openLogoutModal(() => {}); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
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
          <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost btn-sm" aria-label="باز کردن منو">
            <SvgIcon><path d="M4 6h16M4 12h16M4 18h16" /></SvgIcon>
          </button>
          <span className="font-bold text-base text-foreground">پنل مدیریت</span>
          <Link href="/" className="btn btn-ghost btn-sm" aria-label="صفحه اصلی">
            <SvgIcon><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></SvgIcon>
          </Link>
        </div>
        <div className="flex-1 p-4 md:p-8"><ErrorBoundary>{children}</ErrorBoundary></div>
      </main>
    </div>
      <RealtimeNotificationListener />
    </EchoProvider>
  );
}
