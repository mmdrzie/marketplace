'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { OtpInput } from '@/components/auth/OtpInput';

const inputClass =
  'w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 appearance-none';

const REASON_MESSAGES: Record<string, string> = {
  not_configured: 'ورود با گوگل فعلاً در دسترس نیست.',
  access_denied: 'ورود با گوگل لغو شد. در صورت تمایل دوباره تلاش کنید.',
  email_missing: 'گوگل ایمیل شما را برنگرداند؛ لطفاً از روش ایمیل یا تلفن استفاده کنید.',
  inactive_account: 'حساب شما غیرفعال است. با پشتیبانی تماس بگیرید.',
  invalid_state: 'جلسه ورود منقضی شده است. دوباره تلاش کنید.',
  missing_code: 'پاسخ گوگل ناقص بود. دوباره تلاش کنید.',
  token_exchange_failed: 'مشکلی در اتصال به گوگل پیش آمد. دوباره تلاش کنید.',
  invalid_id_token: 'تأیید هویت گوگل ناموفق بود. دوباره تلاش کنید.',
  nonce_mismatch: 'جلسه ورود معتبر نیست. دوباره تلاش کنید.',
  authorize_failed: 'مشکلی در شروع ورود با گوگل پیش آمد.',
};

export default function GoogleCompletePage() {
  return (
    <Suspense fallback={null}>
      <GoogleCompleteInner />
    </Suspense>
  );
}

function GoogleCompleteInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const mode = sp.get('mode');
  const token = sp.get('t');
  const email = sp.get('email') || '';
  const reason = sp.get('reason') || 'invalid_state';
  const redirectTo = sp.get('redirect');

  const { googleFinalize, googleVerify, googleResend, googleLink, loading, error } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [emailUnverified, setEmailUnverified] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalizedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setResendTimer(120);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (mode === 'session' && token && !finalizedRef.current) {
      finalizedRef.current = true;
      googleFinalize(token)
        .then(() => {
          const target = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
          router.replace(target || '/');
        })
        .catch(() => {
          // handled by hook error
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, token]);

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setLocalError('کد تایید را کامل وارد کنید');
      return;
    }
    setLocalError(null);
    try {
      await googleVerify(token || '', otp);
      router.replace(redirectTo || '/');
    } catch {
      // handled by hook
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await googleResend(token || '');
      setCode(['', '', '', '', '', '']);
      startResendTimer();
    } catch {
      // handled by hook
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setEmailUnverified(false);
    try {
      await googleLink(token || '', password);
      router.replace(redirectTo || '/');
    } catch (err) {
      const codeErr = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (codeErr === 'EMAIL_NOT_VERIFIED') setEmailUnverified(true);
    }
  };

  if (mode === 'session') {
    return (
      <FadeIn>
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <svg className="animate-spin h-6 w-6 text-primary-foreground" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">در حال ورود...</h1>
        </div>
      </FadeIn>
    );
  }

  if (mode === 'verify') {
    return (
      <FadeIn>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">تأیید ایمیل</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            برای تکمیل ثبت‌نام، کد ۶ رقمی ارسال‌شده به ایمیل زیر را وارد کنید
          </p>
          <p className="text-sm font-medium text-foreground mt-3" dir="ltr">{email}</p>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 justify-center mb-6">
            <OtpInput value={code} onChange={setCode} disabled={loading} autoFocus />
          </div>

          <div className="text-xs text-muted-foreground text-center mb-6">
            {resendTimer > 0 ? (
              <span>ارسال مجدد پس از {resendTimer} ثانیه</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-primary hover:underline">
                ارسال مجدد کد
              </button>
            )}
          </div>

          {(localError || error) && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              {localError || error}
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={code.join('').length !== 6 || loading}
            className="w-full flex items-center justify-center gap-2 py-4 btn btn-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال تأیید...' : 'تأیید و ورود'}
          </button>
        </div>
      </FadeIn>
    );
  }

  if (mode === 'link_required') {
    return (
      <FadeIn>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">اتصال حساب گوگل</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            حساب {email} قبلاً با رمز عبور ساخته شده است. برای اتصال امن به گوگل، رمز عبور خود را وارد کنید
          </p>
        </div>

        <form onSubmit={handleLink} className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-border-subtle">
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور حساب کاربری"
              className={`${inputClass} text-left`}
              autoFocus
              required
            />
          </div>

          {emailUnverified && (
            <div className="flex flex-col gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 text-sm">
              <p>ایمیل این حساب هنوز تأیید نشده است. ابتدا کد تأیید را از صفحه ورود دریافت و وارد شوید، سپس دوباره با گوگل تلاش کنید.</p>
              <Link href="/login" className="text-primary font-medium hover:underline">
                دریافت کد تأیید ایمیل
              </Link>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="w-full btn btn-primary rounded-xl py-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال اتصال...' : 'اتصال حساب و ورود'}
          </button>

          <p className="text-center text-sm text-muted-foreground font-light">
            حساب ندارید؟ <Link href="/register" className="text-primary font-medium hover:underline">ثبت‌نام</Link>
          </p>
        </form>
      </FadeIn>
    );
  }

  // error mode (or missing/invalid params)
  return (
    <FadeIn>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">ورود ناموفق</h1>
        <p className="text-sm text-muted-foreground mt-3 font-light">
          {REASON_MESSAGES[reason] || 'مشکلی پیش آمد. دوباره تلاش کنید.'}
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <Link href="/login" className="w-full btn btn-primary rounded-xl py-3.5">ورود با ایمیل</Link>
          <Link href="/register" className="w-full btn btn-outline rounded-xl py-3.5">ثبت‌نام</Link>
        </div>
      </div>
    </FadeIn>
  );
}
