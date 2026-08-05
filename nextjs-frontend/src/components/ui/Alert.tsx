'use client';

import type { ReactNode } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  tone?: 'error' | 'info' | 'success';
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES = {
  error: 'bg-destructive/10 border-destructive/20 text-destructive',
  info: 'bg-primary/5 border-primary/20 text-foreground',
  success: 'bg-success/10 border-success/25 text-success',
};

export function Alert({ tone = 'error', children, className }: AlertProps) {
  const Icon = tone === 'error' ? AlertCircle : Info;
  return (
    <div className={cn('flex items-start gap-2.5 p-4 rounded-xl border text-sm', TONE_CLASSES[tone], className)} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
