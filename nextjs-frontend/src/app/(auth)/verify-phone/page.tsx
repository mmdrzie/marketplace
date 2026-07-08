'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FadeIn } from '@/components/common/MotionDiv';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { cn } from '@/lib/utils';

function VerifyPhoneForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { sendOtp, verifyOtp, loading, error } = usePhoneVerification();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(120);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0 && step === 'otp') {
      const i = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(i);
    }
  }, [timer, step]);

  const formatPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11);
  const isValidPhone = phone.length === 11 && phone.startsWith('09');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) return;
    try {
      await sendOtp(phone);
      setStep('otp');
      setTimer(120);
    } catch { /* handled by hook */ }
  };

  const handleCodeChange = (i: number, v: string) => {
    if (!/^\d$/.test(v) && v !== '') return;
    const n = [...code]; n[i] = v; setCode(n);
    if (v && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!p) return;
    const n = p.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(n);
    inputsRef.current[Math.min(p.length, 5)]?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join('').length !== 6) return;
    try {
      await verifyOtp(phone, code.join(''));
      router.push(redirect);
    } catch { /* handled by hook */ }
  };

  const resendCode = async () => {
    try {
      await sendOtp(phone);
      setCode(['', '', '', '', '', '']);
      setTimer(120);
      inputsRef.current[0]?.focus();
    } catch { /* handled by hook */ }
  };

  const allFilled = code.every((d) => d !== '');

  return (
    <FadeIn>
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">
          {step === 'phone' ? 'تایید شماره موبایل' : 'کد تایید'}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-light">
          {step === 'phone'
            ? 'شماره موبایل خود را وارد کنید'
            : `کد ۶ رقمی ارسال شده به ${phone} را وارد کنید`}
        </p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-border-subtle">
            <label className="block text-[11px] font-medium text-muted-foreground mb-3 uppercase tracking-wider">شماره موبایل</label>
            <div className="relative" dir="ltr">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+98</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="۹۱۲۳۴۵۶۷۸۹"
                className="w-full pl-14 pr-4 py-3.5 glass-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-left text-lg tracking-widest"
                maxLength={11}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={!isValidPhone || loading} className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                در حال ارسال...
              </span>
            ) : 'ارسال کد تایید'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-border-subtle text-center">
            <div className="flex justify-center gap-2" dir="ltr" onPaste={handlePaste}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={cn(
                    'w-11 h-14 text-center text-xl font-bold border rounded-xl glass-input transition-all text-foreground outline-none',
                    d ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border-subtle focus:border-primary/50 focus:ring-2 focus:ring-primary/20',
                  )}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={!allFilled || loading} className="w-full btn btn-primary rounded-xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                در حال بررسی...
              </span>
            ) : 'تایید'}
          </button>

          <div className="flex items-center justify-between text-sm">
            {timer > 0 ? (
              <span className="text-muted-foreground font-light">
                ارسال مجدد در {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </span>
            ) : (
              <button type="button" onClick={resendCode} className="text-primary font-medium hover:brightness-110">
                ارسال مجدد کد
              </button>
            )}
            <button type="button" onClick={() => setStep('phone')} className="text-muted-foreground hover:text-foreground transition-colors font-light">
              تغییر شماره
            </button>
          </div>
        </form>
      )}
    </FadeIn>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">بارگذاری...</div>}>
      <VerifyPhoneForm />
    </Suspense>
  );
}
