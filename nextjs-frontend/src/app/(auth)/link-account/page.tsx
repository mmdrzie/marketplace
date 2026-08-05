'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link2 } from 'lucide-react';
import { FadeIn } from '@/components/common/MotionDiv';
import { useAuth } from '@/hooks/useAuth';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { PasswordField } from '@/components/ui/PasswordField';
import { Alert } from '@/components/ui/Alert';

const linkSchema = z.object({
  password: z.string().min(1, 'رمز عبور را وارد کنید'),
});

type LinkValues = z.infer<typeof linkSchema>;

function LinkAccountInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('t') || '';
  const email = sp.get('email') || '';
  const redirectTo = sp.get('redirect');
  const { googleLink, loading, error } = useAuth();
  const [emailUnverified, setEmailUnverified] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinkValues>({ resolver: zodResolver(linkSchema) });

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setEmailUnverified(false);
    try {
      await googleLink(token, values.password);
      router.replace(redirectTo || '/');
    } catch (err) {
      const codeErr = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (codeErr === 'EMAIL_NOT_VERIFIED') setEmailUnverified(true);
    }
  });

  if (!token) {
    return (
      <FadeIn>
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground">لینک نامعتبر</h1>
          <p className="text-sm text-muted-foreground mt-3 font-light">
            جلسه اتصال حساب گوگل معتبر نیست. لطفاً دوباره با گوگل تلاش کنید.
          </p>
          <div className="flex flex-col gap-3 mt-8">
            <Link href="/login" className="w-full btn btn-primary rounded-xl py-3.5">ورود به حساب</Link>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <AuthHeader
        icon={<Link2 className="h-5 w-5" aria-hidden="true" />}
        title="اتصال حساب گوگل"
        subtitle={`حساب ${email || 'این ایمیل'} قبلاً با رمز عبور ساخته شده است. برای اتصال امن به گوگل، رمز عبور خود را وارد کنید`}
      />

      <form onSubmit={onSubmit} noValidate className="glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle space-y-6">
        <FormField label="رمز عبور" htmlFor="link-password" error={errors.password?.message} required>
          <PasswordField
            id="link-password"
            placeholder="رمز عبور حساب کاربری"
            autoComplete="current-password"
            autoFocus
            invalid={!!errors.password}
            {...register('password')}
          />
        </FormField>

        {emailUnverified && (
          <Alert tone="info">
            <p>ایمیل این حساب هنوز تأیید نشده است. ابتدا کد تأیید را از صفحه ورود دریافت و وارد کنید، سپس دوباره با گوگل تلاش کنید.</p>
            <Link href="/login" className="text-primary font-medium hover:underline block mt-2">
              دریافت کد تأیید ایمیل
            </Link>
          </Alert>
        )}

        {error && !emailUnverified && <Alert tone="error">{error}</Alert>}

        <Button type="submit" size="lg" loading={loading} className="w-full py-4 rounded-xl">
          اتصال حساب و ورود
        </Button>

        <p className="text-center text-sm text-muted-foreground font-light">
          حساب ندارید؟ <Link href="/register" className="text-primary font-medium hover:underline">ثبت‌نام</Link>
        </p>
      </form>
    </FadeIn>
  );
}

export default function LinkAccountPage() {
  return (
    <Suspense fallback={null}>
      <LinkAccountInner />
    </Suspense>
  );
}
