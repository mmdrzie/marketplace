'use client';

import { useEffect } from 'react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background p-4">
      <div className="glass rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">خطایی رخ داده است</h2>
        <p className="text-sm text-muted-foreground mb-6">متأسفانه مشکلی پیش آمده. لطفاً دوباره تلاش کنید.</p>
        <button
          onClick={reset}
          className="px-6 py-3 btn btn-primary"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
