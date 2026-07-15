'use client';

import Link from 'next/link';
import { useIsAuthenticated, usePhoneVerified } from '@/store/authStore';

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
  minimal?: boolean;
  requirePhone?: boolean;
  phoneRedirect?: string;
}

export function AuthGate({ children, message, minimal, requirePhone, phoneRedirect }: AuthGateProps) {
  const isAuthenticated = useIsAuthenticated();
  const phoneVerified = usePhoneVerified();

  if (isAuthenticated && (!requirePhone || phoneVerified)) return <>{children}</>;

  if (isAuthenticated && requirePhone && !phoneVerified) {
    const url = `/verify-phone${phoneRedirect ? `?redirect=${encodeURIComponent(phoneRedirect)}` : ''}`;
    if (minimal) {
      return (
        <Link
          href={url}
          className="block group glass rounded-3xl p-6 text-center hover:border-primary/30 transition-all duration-300"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {message || 'برای استفاده از این بخش ابتدا شماره موبایل خود را تایید کنید'}
            </p>
            <span className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
              تایید شماره موبایل
            </span>
          </div>
        </Link>
      );
    }
    return (
      <div className="glass rounded-3xl p-8 text-center border border-border-subtle">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <div>
            <p className="text-sm text-foreground font-bold mb-1">تایید شماره موبایل</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {message || 'برای دسترسی به این بخش باید شماره موبایل خود را تایید کنید'}
            </p>
          </div>
          <Link href={url} className="btn btn-primary">
            تایید شماره موبایل
          </Link>
        </div>
      </div>
    );
  }

  if (minimal) {
    return (
      <Link
        href="/login"
        className="block group glass rounded-3xl p-6 text-center hover:border-primary/30 transition-all duration-300"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {message || 'برای مشاهده اطلاعات فروشنده و ارتباط با او وارد حساب خود شوید'}
          </p>
          <span className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
            ورود به حساب
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 text-center border border-border-subtle">
      <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <div>
          <p className="text-sm text-foreground font-bold mb-1">ورود به حساب کاربری</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {message || 'برای دسترسی به این بخش لطفاً وارد حساب کاربری خود شوید'}
          </p>
        </div>
        <Link
          href="/login"
          className="btn btn-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13 12H3" /></svg>
          ورود به حساب
        </Link>
      </div>
    </div>
  );
}
