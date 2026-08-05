'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Smartphone } from 'lucide-react';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { OtpField } from '@/components/auth/OtpField';
import { Alert } from '@/components/ui/Alert';

const phoneSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر نیست (۰۹۱۲۳۴۵۶۷۸۹)'),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

const OTP_LENGTH = 6;
const RESEND_SECONDS = 120;

function VerifyPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { sendOtp, verifyOtp, loading, error } = usePhoneVerification();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_SECONDS);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = handleSubmit(async ({ phone }) => {
    try {
      await sendOtp(phone);
      setStep('otp');
      setTimer(RESEND_SECONDS);
    } catch {
      /* handled by hook */
    }
  });

  const handleVerifyOtp = async () => {
    if (code.join('').length !== OTP_LENGTH) return;
    try {
      await verifyOtp(getValues('phone'), code.join(''));
      router.push(redirect);
    } catch {
      /* handled by hook */
    }
  };

  const resendCode = async () => {
    try {
      await sendOtp(getValues('phone'));
      setCode(Array(OTP_LENGTH).fill(''));
      setTimer(RESEND_SECONDS);
    } catch {
      /* handled by hook */
    }
  };

  const allFilled = code.every((d) => d !== '');

  return (
    <div className="space-y-6">
      <AuthHeader
        icon={<Smartphone className="h-5 w-5" aria-hidden="true" />}
        title={step === 'phone' ? 'تأیید شماره موبایل' : 'کد تأیید'}
        subtitle={
          step === 'phone'
            ? 'شماره موبایل خود را وارد کنید'
            : `کد ۶ رقمی ارسال‌شده به ${getValues('phone')} را وارد کنید`
        }
      />

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} noValidate className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-5">
          <FormField label="شماره موبایل" htmlFor="vp-phone" error={errors.phone?.message} required>
            <Input
              id="vp-phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              autoComplete="tel"
              invalid={!!errors.phone}
              className="text-left text-lg tracking-widest"
              {...register('phone')}
            />
          </FormField>

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" size="lg" loading={loading} className="w-full py-4 rounded-xl">
            ارسال کد تأیید
          </Button>
        </form>
      ) : (
        <div className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-5">
          <OtpField
            value={code}
            onChange={setCode}
            onComplete={handleVerifyOtp}
            autoFocus
            disabled={loading}
            invalid={!!error}
            length={OTP_LENGTH}
          />
          {error && <Alert tone="error">{error}</Alert>}

          <Button
            type="button"
            size="lg"
            loading={loading}
            className="w-full py-4 rounded-xl"
            onClick={handleVerifyOtp}
            disabled={!allFilled}
          >
            تأیید
          </Button>

          <div className="flex items-center justify-between text-sm">
            {timer > 0 ? (
              <span className="text-muted-foreground font-light" role="timer">
                ارسال مجدد در {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </span>
            ) : (
              <button
                type="button"
                onClick={resendCode}
                className="text-primary font-semibold hover:opacity-80 transition-opacity"
              >
                ارسال مجدد کد
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setCode(Array(OTP_LENGTH).fill(''));
              }}
              className="text-muted-foreground hover:text-foreground transition-colors font-light"
            >
              تغییر شماره
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-sm text-muted-foreground">بارگذاری...</div>}>
      <VerifyPhoneContent />
    </Suspense>
  );
}
