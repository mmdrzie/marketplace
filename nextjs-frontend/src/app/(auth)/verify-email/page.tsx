'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';

type Status = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? 'در حال تأیید ایمیل...' : 'لینک تأیید نامعتبر است');

  useEffect(() => {
    if (!token) return;
    let alive = true;
    api
      .get(`/email/verify/${token}`)
      .then(() => {
        if (!alive) return;
        setStatus('success');
        setMessage('ایمیل شما با موفقیت تأیید شد');
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setStatus('error');
        setMessage(
          (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
            'تأیید ایمیل با خطا مواجه شد',
        );
      });
    return () => {
      alive = false;
    };
  }, [token]);

  const redirect = searchParams.get('redirect') || '/';

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-card border border-border-subtle text-center">
      {status === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-6" role="status">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-foreground">تأیید شد</h1>
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
          <Button size="lg" className="w-full mt-2" onClick={() => router.push(redirect)}>
            ورود به سایت
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-foreground">خطا</h1>
          <p className="text-sm text-muted-foreground" role="status">
            {message}
          </p>
          <Button variant="glass" size="lg" className="w-full mt-2" onClick={() => router.push('/')}>
            بازگشت به صفحه اصلی
          </Button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-sm text-muted-foreground">بارگذاری...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
