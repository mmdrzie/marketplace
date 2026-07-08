'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';

const inputClass =
  'w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 appearance-none';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    try {
      await registerWithEmail(email, password, name);
      router.push('/');
    } catch {
      // error handled by useAuth
    }
  };

  const displayError = localError || error;

  return (
    <FadeIn>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">ایجاد حساب کاربری</h1>
        <p className="text-sm text-muted-foreground mt-2 font-light">
          با ایمیل ثبت‌نام کنید
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 border border-border-subtle space-y-5">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">نام و نام خانوادگی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام خود را وارد کنید"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className={`${inputClass} text-left`}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر"
              className={`${inputClass} text-left`}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">تکرار رمز عبور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز عبور را دوباره وارد کنید"
              className={`${inputClass} text-left`}
              required
            />
          </div>
        </div>

        {displayError && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
            {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={!name || !email || !password || !confirmPassword || loading}
          className="w-full flex items-center justify-center gap-2 py-4 btn btn-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              در حال ثبت‌نام...
            </span>
          ) : 'ثبت‌نام'}
        </button>

        <p className="text-center text-sm text-muted-foreground font-light">
          حساب کاربری دارید؟ <Link href="/login" className="text-primary font-medium hover:underline transition-colors">ورود به حساب</Link>
        </p>
      </form>
    </FadeIn>
  );
}
