'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword, loading, error } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    try {
      await resetPassword(token, password);
      setDone(true);
    } catch {
      // error handled by useAuth
    }
  };

  if (!token) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-destructive flex items-center justify-center mx-auto mb-4 shadow-lg shadow-destructive/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">لینک نامعتبر</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            لینک بازیابی معتبر نیست. لطفاً دوباره درخواست دهید.
          </p>
          <div className="mt-6">
            <Link href="/forgot-password" className="text-primary font-medium hover:brightness-110">
              درخواست مجدد
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (done) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">رمز عبور تغییر کرد</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            رمز عبور شما با موفقیت تغییر یافت.
          </p>
          <div className="mt-6">
            <Link href="/login" className="text-primary font-medium hover:brightness-110">
              ورود به حساب
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">تنظیم رمز عبور جدید</h1>
        <p className="text-sm text-muted-foreground mt-2 font-light">
          رمز عبور جدید خود را وارد کنید
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 border border-border-subtle space-y-5">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">رمز عبور جدید</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر"
              className="w-full px-4 py-3.5 glass-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-left"
              required
              minLength={8}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">تکرار رمز عبور جدید</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز عبور را دوباره وارد کنید"
              className="w-full px-4 py-3.5 glass-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-left"
              required
            />
          </div>
        </div>

        {(error || localError) && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            {localError || error}
          </div>
        )}

        <button type="submit" disabled={!password || !confirmPassword || loading} className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              در حال ذخیره...
            </span>
          ) : 'ذخیره رمز عبور'}
        </button>
      </form>
    </FadeIn>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">بارگذاری...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
