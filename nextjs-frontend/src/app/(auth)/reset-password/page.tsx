'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, KeyRound, XCircle } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { Alert } from '@/components/ui/Alert';

const resetSchema = z
  .object({
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد').max(128),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
  });

type ResetValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const isSetMode = searchParams.get('mode') === 'set';
  const { resetPassword, loading, error } = useAuth();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword(token, values.password);
      setDone(true);
    } catch {
      // error handled by useAuth
    }
  });

  if (!token) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground">لینک نامعتبر</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            لینک بازیابی معتبر نیست. لطفاً دوباره درخواست دهید.
          </p>
          <div className="mt-6">
            <Link href="/forgot-password" className="text-primary font-medium hover:brightness-110">
              درخواست مجدد
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (done) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground">{isSetMode ? 'رمز عبور تعیین شد' : 'رمز عبور تغییر کرد'}</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            {isSetMode
              ? 'رمز عبور شما با موفقیت تعیین شد. از این پس می‌توانید با ایمیل و رمز عبور هم وارد شوید.'
              : 'رمز عبور شما با موفقیت تغییر یافت.'}
          </p>
          <div className="mt-6">
            <Link href="/login" className="text-primary font-medium hover:brightness-110">
              ورود به حساب
            </Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <AuthHeader
        icon={<KeyRound className="h-5 w-5" aria-hidden="true" />}
        title={isSetMode ? 'تعیین رمز عبور' : 'تنظیم رمز عبور جدید'}
        subtitle={
          isSetMode
            ? 'حساب شما با گوگل ساخته شده و هنوز رمز عبور ندارد. یک رمز عبور برای ورود با ایمیل تعیین کنید.'
            : 'رمز عبور جدید خود را وارد کنید'
        }
      />

      <form onSubmit={onSubmit} noValidate className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
        <div className="space-y-5">
          <FormField label="رمز عبور جدید" htmlFor="reset-password" error={errors.password?.message} required hint="حداقل ۸ کاراکتر">
            <PasswordField
              id="reset-password"
              placeholder="حداقل ۸ کاراکتر"
              autoComplete="new-password"
              autoFocus
              invalid={!!errors.password}
              {...register('password')}
            />
          </FormField>

          <FormField label="تکرار رمز عبور جدید" htmlFor="reset-confirm" error={errors.confirmPassword?.message} required>
            <PasswordField
              id="reset-confirm"
              placeholder="رمز عبور را دوباره وارد کنید"
              autoComplete="new-password"
              invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
          </FormField>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" size="lg" loading={loading} className="w-full py-4 rounded-xl">
          {isSetMode ? 'تعیین رمز عبور' : 'ذخیره رمز عبور'}
        </Button>
      </form>
    </FadeIn>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground">بارگذاری...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
