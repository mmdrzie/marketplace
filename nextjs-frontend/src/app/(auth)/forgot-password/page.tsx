'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // error handled by useAuth
    }
  };

  if (sent) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-success flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">ایمیل بازیابی ارسال شد</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.
          </p>
        </div>
        <div className="text-center">
          <Link href="/login" className="text-primary font-medium hover:brightness-110">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 7L2 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">بازیابی رمز عبور</h1>
        <p className="text-sm text-muted-foreground mt-2 font-light">
          ایمیل خود را وارد کنید. اگر در سیستم ثبت شده باشد، لینک بازیابی برای شما ارسال می‌شود.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 border border-border-subtle">
          <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3.5 glass-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-left"
            autoFocus
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            {error}
          </div>
        )}

        <button type="submit" disabled={!email || loading} className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              در حال ارسال...
            </span>
          ) : 'ارسال لینک بازیابی'}
        </button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </form>
    </FadeIn>
  );
}
