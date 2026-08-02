'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { OtpInput } from '@/components/auth/OtpInput';

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('redirect');
  const { loginWithEmail, sendVerifyCode, verifyLoginCode, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyStep, setVerifyStep] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLocalError(null);
    try {
      await loginWithEmail(email, password);
      router.push(redirectTo || '/');
    } catch (err: unknown) {
      const codeErr = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (codeErr === 'EMAIL_NOT_VERIFIED') {
        try {
          await sendVerifyCode(email);
          setVerifyStep(true);
        } catch {
          // handled by hook
        }
      }
    }
  };

  const handleVerifyCode = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setLocalError('کد تایید را کامل وارد کنید');
      return;
    }
    setLocalError(null);
    try {
      await verifyLoginCode(email, otp);
      router.push(redirectTo || '/');
    } catch {
      // handled by hook
    }
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
        <p className="text-sm text-muted-foreground mt-2 font-light">با گوگل یا ایمیل و رمز عبور وارد شوید</p>
      </div>

      <div className="space-y-6">
        {!verifyStep && (
          <>
            <GoogleButton redirect={redirectTo} />

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-xs text-muted-foreground">یا</span>
              <div className="flex-1 h-px bg-border-subtle" />
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
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {(error || localError) && (
                <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                  {error || localError}
                </div>
              )}

              <button type="submit" disabled={!email || !password || loading} className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'در حال ورود...' : 'ورود'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-primary hover:brightness-110 font-medium">رمز عبور را فراموش کرده‌اید؟</Link>
                <Link href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'} className="text-muted-foreground hover:text-foreground transition-colors font-light">ثبت نام</Link>
              </div>
            </form>
          </>
        )}

        {verifyStep && (
          <>
            <div className="text-center p-6 bg-primary/5 border border-primary/20 rounded-2xl">
              <p className="text-sm text-foreground font-medium mb-1">ایمیل شما هنوز تایید نشده است</p>
              <p className="text-sm text-muted-foreground">
                کد ۶ رقمی به <span className="text-foreground" dir="ltr">{email}</span> ارسال شد
              </p>
            </div>

            <div className="flex justify-center">
              <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
            </div>

            {(error || localError) && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
                {error || localError}
              </div>
            )}

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={code.join('').length !== 6 || loading}
              className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'در حال تایید...' : 'تایید و ورود'}
            </button>

            <button
              type="button"
              onClick={() => sendVerifyCode(email)}
              disabled={loading}
              className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
            >
              ارسال مجدد کد تایید
            </button>

            <button
              type="button"
              onClick={() => { setVerifyStep(false); setLocalError(null); }}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
            >
              بازگشت به فرم ورود
            </button>
          </>
        )}
      </div>
    </FadeIn>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
