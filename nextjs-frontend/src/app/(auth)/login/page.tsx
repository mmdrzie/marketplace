'use client';

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loading, error } = useAuth();
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
    </FadeIn>
  );
}
