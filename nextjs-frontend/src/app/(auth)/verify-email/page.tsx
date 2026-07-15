'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { FadeIn } from '@/components/common/MotionDiv';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [message, setMessage] = useState(token ? '' : 'لینک تأیید نامعتبر است');

  useEffect(() => {
    if (!token) return;
    api.get(`/email/verify/${token}`)
      .then(() => {
        setStatus('success');
        setMessage('ایمیل شما با موفقیت تأیید شد');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'تأیید ایمیل با خطا مواجه شد');
      });
  }, [token]);

  const redirect = searchParams.get('redirect') || '/';

  return (
    <FadeIn>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center border border-border-subtle">
          {status === 'loading' && (
            <div>
              <div className="follow-the-leader mx-auto mb-4"><div></div><div></div><div></div><div></div><div></div></div>
              <p className="text-foreground">در حال تأیید ایمیل...</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">تأیید شد</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <button onClick={() => router.push(redirect)} className="btn btn-primary">ورود به سایت</button>
            </div>
          )}
          {status === 'error' && (
            <div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">خطا</h2>
              <p className="text-sm text-muted-foreground mb-6">{message}</p>
              <button onClick={() => router.push('/')} className="btn btn-primary">بازگشت به صفحه اصلی</button>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
