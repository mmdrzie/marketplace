'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { OtpField } from '@/components/auth/OtpField';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { Alert } from '@/components/ui/Alert';

const loginSchema = z.object({
  email: z.string().trim().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(1, 'رمز عبور را وارد کنید'),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('redirect');
  const { loginWithEmail, sendVerifyCode, verifyLoginCode, loading, error } = useAuth();
  const [verifyStep, setVerifyStep] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleLogin = handleSubmit(async (values) => {
    setLocalError(null);
    try {
      await loginWithEmail(values.email, values.password);
      router.push(redirectTo || '/');
    } catch (err: unknown) {
      const codeErr = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (codeErr === 'EMAIL_NOT_VERIFIED') {
        try {
          await sendVerifyCode(values.email);
          setVerifyStep(true);
          startResendTimer();
        } catch {
          // handled by hook
        }
      }
    }
  });

  const handleVerify = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setLocalError('کد تایید را کامل وارد کنید');
      return;
    }
    setLocalError(null);
    try {
      await verifyLoginCode(getValues('email'), otp);
      router.push(redirectTo || '/');
    } catch {
      // handled by hook
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await sendVerifyCode(getValues('email'));
      setCode(['', '', '', '', '', '']);
      startResendTimer();
    } catch {
      // handled by hook
    } finally {
      setResendLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <FadeIn>
      <AuthHeader
        icon={<Lock className="h-5 w-5" aria-hidden="true" />}
        title="ورود به حساب کاربری"
        subtitle="با گوگل یا ایمیل و رمز عبور وارد شوید"
      />

      {!verifyStep && (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
          <GoogleButton redirect={redirectTo} />

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-xs text-muted-foreground">یا</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            <FormField label="ایمیل" htmlFor="login-email" error={errors.email?.message} required>
              <Input
                id="login-email"
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
                autoFocus
                invalid={!!errors.email}
                className="text-left"
                {...register('email')}
              />
            </FormField>
            <FormField label="رمز عبور" htmlFor="login-password" error={errors.password?.message} required>
              <PasswordField
                id="login-password"
                placeholder="رمز عبور خود را وارد کنید"
                autoComplete="current-password"
                invalid={!!errors.password}
                {...register('password')}
              />
            </FormField>

            {displayError && <Alert tone="error">{displayError}</Alert>}

            <Button type="submit" size="lg" loading={loading || isSubmitting} className="w-full py-4 rounded-xl">
              ورود
            </Button>
          </form>

          <div className="pt-5 border-t border-border-subtle flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-primary hover:brightness-110 font-medium">
              رمز عبور را فراموش کرده‌اید؟
            </Link>
            <Link
              href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : '/register'}
              className="text-muted-foreground hover:text-foreground transition-colors font-light"
            >
              ثبت نام
            </Link>
          </div>
        </div>
      )}

      {verifyStep && (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
          <div className="text-center p-5 bg-primary/5 border border-primary/20 rounded-2xl">
            <p className="text-sm text-foreground font-medium mb-1">ایمیل شما هنوز تایید نشده است</p>
            <p className="text-sm text-muted-foreground">
              کد ۶ رقمی به <span className="text-foreground" dir="ltr">{getValues('email')}</span> ارسال شد
            </p>
          </div>

          <div className="flex justify-center">
            <OtpField value={code} onChange={setCode} disabled={loading || resendLoading} autoFocus invalid={!!error} />
          </div>

          {displayError && <Alert tone="error">{displayError}</Alert>}

          <Button type="button" onClick={handleVerify} size="lg" loading={loading} disabled={code.join('').length !== 6} className="w-full py-4 rounded-xl">
            تایید و ورود
          </Button>

          <div className="text-center text-sm">
            {resendTimer > 0 ? (
              <span className="text-muted-foreground">ارسال مجدد کد پس از {resendTimer} ثانیه</span>
            ) : (
              <button type="button" onClick={handleResend} disabled={resendLoading} className="text-primary hover:underline disabled:opacity-50">
                ارسال مجدد کد تایید
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setVerifyStep(false);
              setLocalError(null);
            }}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
          >
            بازگشت به فرم ورود
          </button>
        </div>
      )}
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
