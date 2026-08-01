'use client';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ToastContainer } from '@/components/common/Toast';

export default function StoresLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      </div>
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-24">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>

      <ToastContainer />
    </div>
  );
}
