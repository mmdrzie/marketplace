'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, XCircle } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpField } from '@/components/auth/OtpField';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

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

  const { googleFinalize, googleVerify, googleResend, loading, error } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
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

  // اتصال حساب با رمز عبور روی صفحه اختصاصی انجام می‌شود
  useEffect(() => {
    if (mode === 'link_required' && token) {
      const params = new URLSearchParams();
      params.set('t', token);
      if (email) params.set('email', email);
      if (redirectTo) params.set('redirect', redirectTo);
      router.replace(`/link-account?${params.toString()}`);
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

  if (mode === 'session') {
    return (
      <FadeIn>
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <svg className="animate-spin h-6 w-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
        <AuthHeader
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          title="تأیید ایمیل"
          subtitle={`برای تکمیل ثبت‌نام، کد ۶ رقمی ارسال‌شده به ایمیل زیر را وارد کنید`}
        />
        <p className="text-sm font-medium text-foreground text-center mb-6" dir="ltr">{email}</p>

        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
          <div className="flex gap-2 justify-center">
            <OtpField value={code} onChange={setCode} disabled={loading} autoFocus invalid={!!error} />
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {resendTimer > 0 ? (
              <span>ارسال مجدد پس از {resendTimer} ثانیه</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-primary hover:underline">
                ارسال مجدد کد
              </button>
            )}
          </div>

          {(localError || error) && <Alert tone="error">{localError || error}</Alert>}

          <Button
            type="button"
            onClick={handleVerify}
            size="lg"
            loading={loading}
            disabled={code.join('').length !== 6}
            className="w-full py-4 rounded-xl"
          >
            تأیید و ورود
          </Button>
        </div>
      </FadeIn>
    );
  }

  if (mode === 'link_required') {
    // به صفحه اتصال حساب منتقل می‌شود (google-complete → link-account)
    return (
      <FadeIn>
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
            <svg className="animate-spin h-6 w-6 text-primary-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">در حال انتقال...</h1>
        </div>
      </FadeIn>
    );
  }

  // error mode (or missing/invalid params)
  return (
    <FadeIn>
      <AuthHeader
        icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
        title="ورود ناموفق"
        subtitle={REASON_MESSAGES[reason] || 'مشکلی پیش آمد. دوباره تلاش کنید.'}
      />
      <div className="flex flex-col gap-3">
        <Link href="/login" className="w-full btn btn-primary rounded-xl py-4">ورود با ایمیل</Link>
        <Link href="/register" className="w-full btn btn-glass rounded-xl py-4">ثبت‌نام</Link>
      </div>
    </FadeIn>
  );
}
