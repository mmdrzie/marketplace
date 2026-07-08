'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useLogoutModal } from '@/store/logoutModalStore';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const openLogoutModal = useLogoutModal((s) => s.open);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navLinks = [
    { href: '/dashboard', label: 'داشبورد', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /> },
    { href: '/dashboard/listings', label: 'آگهی‌های من', icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /> },
    { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: <path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { href: '/dashboard/messages', label: 'پیام‌ها', icon: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
    { href: '/dashboard/favorites', label: 'علاقه‌مندی‌ها', icon: <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /> },
    { href: '/dashboard/deals', label: 'معاملات', icon: <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /> },
    { href: '/dashboard/settings', label: 'تنظیمات', icon: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /> },
  ];

  const roleLabel =
    user?.role === 'admin' ? 'مدیر سیستم' :
    user?.role === 'dealer' ? 'نماینده' :
    user?.role === 'agency' ? 'بنگاه' : 'کاربر';

  return (
    <AuthGuard>
      <div className="relative min-h-screen flex bg-background text-foreground">

        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] -z-0 pointer-events-none" />

        <aside className={`fixed md:sticky top-0 md:h-screen inset-y-0 right-0 z-40 w-72 transform transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
          <div className="h-full glass rounded-l-3xl border-l border-border flex flex-col">

            {/* هدر پروفایل */}
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shadow-md shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{user?.name || 'کاربر'}</p>
                  <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 shrink-0">
                  <SvgIcon className="h-4 w-4"><path d="M18 6L6 18M6 6l12 12" /></SvgIcon>
                </button>
              </div>
            </div>

            {/* لینک‌های اصلی */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2 mt-2">منوی اصلی</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'
                  }`}
                >
                  <span className={`shrink-0 ${isActive(link.href) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    <SvgIcon className="h-4 w-4">{link.icon}</SvgIcon>
                  </span>
                  {link.label}
                  {isActive(link.href) && (
                    <span className="mr-auto w-1.5 h-6 rounded-full bg-primary shadow-[0_0_8px_2px_var(--color-primary)]" />
                  )}
                </Link>
              ))}

              {/* لینک‌های پنل فروشندگی */}
              {(user?.role === 'dealer' || user?.role === 'agency') && (
                <>
                  <div className="border-t border-border my-4" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">پنل حرفه‌ای</p>
                  <Link href="/dealer/listings" onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${isActive('/dealer') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'}`}>
                    <span className={`shrink-0 ${isActive('/dealer') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      <SvgIcon className="h-4 w-4"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" /></SvgIcon>
                    </span>
                    {user?.role === 'agency' ? 'پنل بنگاه' : 'پنل نمایندگی'}
                    {isActive('/dealer') && <span className="mr-auto w-1.5 h-6 rounded-full bg-primary shadow-[0_0_8px_2px_var(--color-primary)]" />}
                  </Link>
                  <Link href="/dealer/subscription" onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${isActive('/dealer/subscription') ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'}`}>
                    <span className={`shrink-0 ${isActive('/dealer/subscription') ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      <SvgIcon className="h-4 w-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></SvgIcon>
                    </span>
                    اشتراک
                    {isActive('/dealer/subscription') && <span className="mr-auto w-1.5 h-6 rounded-full bg-primary shadow-[0_0_8px_2px_var(--color-primary)]" />}
                  </Link>
                </>
              )}

              {/* لینک‌های پنل مدیریت */}
              {user?.role === 'admin' && (
                <>
                  <div className="border-t border-border my-4" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">مدیریت سیستم</p>
                  <Link href="/admin" onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${isActive('/admin') ? 'bg-destructive/10 text-destructive font-medium' : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'}`}>
                    <span className={`shrink-0 ${isActive('/admin') ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      <SvgIcon className="h-4 w-4"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></SvgIcon>
                    </span>
                    پنل مدیریت
                    {isActive('/admin') && <span className="mr-auto w-1.5 h-6 rounded-full bg-destructive shadow-[0_0_8px_2px_var(--color-destructive)]" />}
                  </Link>
                </>
              )}

              <div className="border-t border-border my-4" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">سایر</p>
              <Link href="/parts" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2/50 hover:text-foreground transition-all group">
                <span className="text-muted-foreground group-hover:text-foreground">
                  <SvgIcon className="h-4 w-4"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></SvgIcon>
                </span>
                قطعات یدکی و ادوات
              </Link>
              <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-surface-2/50 hover:text-foreground transition-all group">
                <span className="text-muted-foreground group-hover:text-foreground">
                  <SvgIcon className="h-4 w-4"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></SvgIcon>
                </span>
                بازگشت به سایت
              </Link>
            </nav>

            {/* دکمه خروج */}
            <div className="p-3 border-t border-border">
              <button
                onClick={() => { setSidebarOpen(false); openLogoutModal(() => {}); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <SvgIcon className="h-4 w-4">
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

          {/* هدر موبایل */}
          <div className="flex items-center justify-between gap-3 p-4 md:hidden border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-20">
            <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-colors">
              <SvgIcon className="h-5 w-5"><path d="M4 6h16M4 12h16M4 18h16" /></SvgIcon>
            </button>
            <span className="font-bold text-base text-foreground">پنل کاربری</span>
            <Link href="/" className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-colors">
              <SvgIcon className="h-5 w-5"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></SvgIcon>
            </Link>
          </div>

          <div className="flex-1 p-4 md:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}