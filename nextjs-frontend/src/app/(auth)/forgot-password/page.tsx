'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Mail } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Alert } from '@/components/ui/Alert';

const forgotSchema = z.object({
  email: z.string().trim().email('ایمیل معتبر وارد کنید'),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const [sent, setSent] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgotPassword(values.email);
      setSent(true);
    } catch {
      // error handled by useAuth
    }
  });

  if (sent) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground">ایمیل بازیابی ارسال شد</h1>
          <p className="text-sm text-muted-foreground mt-2 font-light">
            اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.
          </p>
        </div>
        <div className="text-center">
          <Link href="/login" className="text-primary font-medium hover:brightness-110">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <AuthHeader
        icon={<Mail className="h-5 w-5" aria-hidden="true" />}
        title="بازیابی رمز عبور"
        subtitle="ایمیل خود را وارد کنید. اگر در سیستم ثبت شده باشد، لینک بازیابی برای شما ارسال می‌شود."
      />

      <form onSubmit={onSubmit} noValidate className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
        <FormField label="ایمیل" htmlFor="forgot-email" error={errors.email?.message} required>
          <Input
            id="forgot-email"
            type="email"
            placeholder="example@email.com"
            autoComplete="email"
            autoFocus
            invalid={!!errors.email}
            className="text-left"
            {...register('email')}
          />
        </FormField>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" size="lg" loading={loading} className="w-full py-4 rounded-xl">
          ارسال لینک بازیابی
        </Button>

        <div className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </form>
    </FadeIn>
  );
}
