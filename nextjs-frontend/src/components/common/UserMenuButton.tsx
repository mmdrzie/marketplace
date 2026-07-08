'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLogoutModal } from '@/store/logoutModalStore';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function UserMenuButton({ className }: { className?: string }) {
  const { isAuthenticated, user } = useAuthStore();
  const openLogoutModal = useLogoutModal((s) => s.open);
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setUserMenuOpen(false), 0);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const { data: unreadData } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await api.get('/conversations/unread-count');
      return res.data.data?.count || 0;
    },
    enabled: isAuthenticated,
    staleTime: 15000,
    retry: 0,
    refetchInterval: 30000,
  });

  const { data: notifData } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 60000,
    retry: 0,
  });

  const unreadCount = Number(unreadData) || 0;
  const notifications = notifData?.data || [];
  const unreadNotifs = notifications.filter((n: { is_read: boolean }) => !n.is_read).length;
  const totalBadge = unreadCount + unreadNotifs;

  if (!isAuthenticated) return null;

  return (
    <div ref={userMenuRef} className={className}>
      <button
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        className="relative w-12 h-12 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-lg"
        title="منوی کاربر"
      >
        <span className="text-primary-foreground font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold shadow-sm px-1">
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>

      {userMenuOpen && (
        <div className="absolute start-0 top-full mt-2 w-60 glass rounded-2xl z-50 overflow-hidden shadow-2xl animate-dropdown p-2">
          <div className="p-3 mb-1 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">{user?.name || 'کاربر'}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.role === 'admin' ? 'مدیر سیستم' : user?.role === 'dealer' ? 'نماینده' : user?.role === 'agency' ? 'بنگاه' : 'کاربر'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <Link href="/dashboard/messages" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-all group">
              <SvgIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </SvgIcon>
              <span className="flex-1">پیام‌ها</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">{unreadCount}</span>
              )}
            </Link>

            <Link href="/dashboard/notifications" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-all group">
              <SvgIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </SvgIcon>
              <span className="flex-1">اعلان‌ها</span>
              {unreadNotifs > 0 && (
                <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">{unreadNotifs}</span>
              )}
            </Link>

            <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-all group">
              <SvgIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary">
                <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </SvgIcon>
              داشبورد
            </Link>

            {(user?.role === 'dealer' || user?.role === 'agency') && (
              <Link href="/dealer/listings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-all group">
                <SvgIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" />
                </SvgIcon>
                پنل فروشندگی
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-surface-2/50 transition-all group">
                <SvgIcon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </SvgIcon>
                پنل مدیریت
              </Link>
            )}
          </div>

          <div className="mt-1 pt-1 border-t border-border">
            <button
              onClick={() => { setUserMenuOpen(false); openLogoutModal(() => {}); }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <SvgIcon className="h-4 w-4 shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </SvgIcon>
              خروج از حساب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
