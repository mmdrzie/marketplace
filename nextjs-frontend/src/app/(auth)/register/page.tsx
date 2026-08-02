'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { OtpInput } from '@/components/auth/OtpInput';

const inputClass =
  'w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 appearance-none';

type RegisterMethod = 'email' | 'phone';
type Step = 'form' | 'otp';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirectTo = sp.get('redirect');
  const { sendRegisterOtp, registerWithOtp, loading, error } = useAuth();
  const [method, setMethod] = useState<RegisterMethod>('email');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<Step>('form');
  const [localError, setLocalError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [accountRole, setAccountRole] = useState<'user' | 'dealer' | 'agency' | 'store' | 'workshop'>('user');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStep('form');
    setCode(['', '', '', '', '', '']);
    setOtpSent(false);
    setLocalError(null);
    setResendTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [method]);

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

  const validateForm = (): string | null => {
    if (!name.trim()) return 'نام و نام خانوادگی را وارد کنید';
    if (method === 'email' && !identifier.includes('@')) return 'ایمیل معتبر وارد کنید';
    if (method === 'phone' && identifier.replace(/\D/g, '').length < 10) return 'شماره تلفن معتبر وارد کنید';
    if (password.length < 8) return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    if (password !== confirmPassword) return 'رمز عبور و تکرار آن مطابقت ندارند';
    return null;
  };

  const handleSendOtp = async () => {
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    try {
      await sendRegisterOtp(identifier.trim(), method);
      setStep('otp');
      setOtpSent(true);
      startResendTimer();
    } catch {
      // error handled by hook
    }
  };

  const handleSubmit = async () => {
    const otp = code.join('');
    if (otp.length !== 6) {
      setLocalError('کد تایید را کامل وارد کنید');
      return;
    }
    setLocalError(null);
    try {
      await registerWithOtp(identifier.trim(), method, otp, password, name.trim(), accountRole);
      router.push(redirectTo || '/');
    } catch {
      // error handled by hook
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await sendRegisterOtp(identifier.trim(), method);
      setCode(['', '', '', '', '', '']);
      setOtpSent(true);
      startResendTimer();
    } catch {
      // error handled by hook
    }
  };

  const displayError = localError || error;

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('98')) return '0' + digits.slice(2);
    if (digits.startsWith('0')) return digits;
    return digits;
  };

  return (
    <FadeIn>
      <div className="text-center mb-8">
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
          برای شروع، یکی از روش‌های ثبت‌نام را انتخاب کنید
        </p>
      </div>

      {step === 'form' && <GoogleButton label="ثبت‌نام با گوگل" redirect={redirectTo} />}

      {step === 'form' && (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border-subtle" />
          <span className="text-xs text-muted-foreground">یا با ایمیل و تلفن</span>
          <div className="flex-1 h-px bg-border-subtle" />
        </div>
      )}

      {/* نوع حساب */}
      <div className="flex mb-4 bg-surface-2/40 rounded-xl p-1 border border-border/50">
        {([
          { value: 'user', label: 'کاربر عادی' },
          { value: 'dealer', label: 'نمایندگی' },
          { value: 'agency', label: 'نمایشگاه' },
          { value: 'store', label: 'فروشگاه' },
          { value: 'workshop', label: 'تعمیرکار / تیونر' },
        ] as const).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setAccountRole(opt.value)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              accountRole === opt.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* روش ثبت‌نام */}
      <div className="flex mb-6 bg-surface-2/40 rounded-xl p-1 border border-border/50">
        <button
          type="button"
          onClick={() => setMethod('email')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            method === 'email'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ایمیل
        </button>
        <button
          type="button"
          onClick={() => setMethod('phone')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
            method === 'phone'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          شماره تلفن
        </button>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-6 border border-border-subtle space-y-5">
          {/* نام */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">نام و نام خانوادگی</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام خود را وارد کنید"
              className={inputClass}
              disabled={step === 'otp'}
              required
            />
          </div>

          {/* ایمیل یا تلفن */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              {method === 'email' ? 'ایمیل' : 'شماره تلفن'}
            </label>
            <input
              type={method === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => setIdentifier(method === 'phone' ? formatPhone(e.target.value) : e.target.value)}
              placeholder={method === 'email' ? 'example@email.com' : '۰۹۱۲۳۴۵۶۷۸۹'}
              className={`${inputClass} ${method === 'email' ? 'text-left' : 'text-left'} ${step === 'otp' ? 'opacity-60' : ''}`}
              disabled={step === 'otp'}
              required
            />
          </div>

          {/* رمز عبور */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="حداقل ۸ کاراکتر"
              className={`${inputClass} text-left ${step === 'otp' ? 'opacity-60' : ''}`}
              disabled={step === 'otp'}
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">تکرار رمز عبور</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="رمز عبور را دوباره وارد کنید"
              className={`${inputClass} text-left ${step === 'otp' ? 'opacity-60' : ''}`}
              disabled={step === 'otp'}
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

        {/* مرحله ارسال کد تایید */}
        {step === 'form' && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={!name.trim() || !identifier.trim() || !password || !confirmPassword || loading}
            className="w-full flex items-center justify-center gap-2 py-4 btn btn-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                در حال ارسال...
              </span>
            ) : 'ارسال کد تایید'}
          </button>
        )}

        {/* مرحله وارد کردن کد OTP */}
        {step === 'otp' && (
          <>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                کد ۶ رقمی به {method === 'email' ? 'ایمیل' : 'شماره تلفن'} زیر ارسال شد
              </p>
              <p className="text-sm font-medium text-foreground mb-6" dir="ltr">
                {identifier}
              </p>

              {/* فیلدهای ۶ رقمی کد */}
              <div className="mb-6">
                <OtpInput value={code} onChange={setCode} disabled={loading} />
              </div>

              {/* تایمر و ارسال مجدد */}
              <div className="text-xs text-muted-foreground mb-6">
                {resendTimer > 0 ? (
                  <span>ارسال مجدد پس از {resendTimer} ثانیه</span>
                ) : (
                  <button type="button" onClick={handleResend} className="text-primary hover:underline">
                    ارسال مجدد کد
                  </button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={code.join('').length !== 6 || loading}
              className="w-full flex items-center justify-center gap-2 py-4 btn btn-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M 4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  در حال ثبت‌نام...
                </span>
              ) : 'تایید و ثبت‌نام'}
            </button>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground font-light">
          حساب کاربری دارید؟ <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'} className="text-primary font-medium hover:underline transition-colors">ورود به حساب</Link>
        </p>
      </div>
    </FadeIn>
  );
}
