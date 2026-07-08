'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';

const ROLES = [
  {
    key: 'user',
    label: 'کاربر عادی',
    desc: 'داشبورد کاربری',
    icon: (
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    ),
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    key: 'dealer',
    label: 'نمایشگاه‌دار',
    desc: 'داشبورد نمایشگاه',
    icon: (
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    ),
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    key: 'agency',
    label: 'آژانس',
    desc: 'داشبورد آژانس',
    icon: (
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    ),
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    key: 'admin',
    label: 'مدیر سیستم',
    desc: 'پنل مدیریت',
    icon: (
      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, demoLogin, isDemoMode, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await loginWithEmail(email, password);
      router.push('/');
    } catch { /* ignore */ }
  };

  return (
    <FadeIn>
      {isDemoMode ? (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-warning flex items-center justify-center mx-auto mb-4 shadow-lg shadow-warning/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-warning-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" /></svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-foreground">نسخه نمایشی</h1>
            <p className="text-sm text-muted-foreground mt-2 font-light">
              نقش مورد نظر برای تست را انتخاب کنید
            </p>
            <p className="text-[10px] text-warning mt-1 font-light">
              ⚠ این حالت فقط برای تست است — در پروداکشن حذف شود
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.key}
                type="button"
                onClick={() => { demoLogin(role.key); router.push('/'); }}
                className="glass rounded-2xl p-5 border border-border-subtle hover:border-primary/30 hover:bg-surface/60 transition-all text-center group"
              >
                <div className={`w-12 h-12 rounded-xl ${role.bg} flex items-center justify-center mx-auto mb-3 ${role.color} group-hover:scale-110 transition-transform`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {role.icon}
                  </svg>
                </div>
                <p className="text-sm font-bold text-foreground">{role.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{role.desc}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-foreground">ورود به حساب کاربری</h1>
            <p className="text-sm text-muted-foreground mt-2 font-light">با ایمیل و رمز عبور وارد شوید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-border-subtle space-y-5">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">ایمیل</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-4 py-3.5 glass-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-left"
                  autoFocus required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">رمز عبور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۸ کاراکتر"
                  className="w-full px-4 py-3.5 glass-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-left"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={!email || !password || loading} className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'در حال ورود...' : 'ورود'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="text-primary hover:brightness-110 font-medium">رمز عبور را فراموش کرده‌اید؟</Link>
              <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors font-light">ثبت نام</Link>
            </div>
          </form>
        </>
      )}
    </FadeIn>
  );
}
