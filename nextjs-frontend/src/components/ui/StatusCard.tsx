'use client';

import Link from 'next/link';
import { AlertTriangle, BadgeCheck, Clock } from 'lucide-react';
import type { ProfileStatus } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_META: Record<ProfileStatus, { tone: 'amber' | 'destructive' | 'success'; icon: typeof Clock; title: string; message: string }> = {
  pending: {
    tone: 'amber',
    icon: Clock,
    title: 'در انتظار تأیید',
    message: 'پروفایل کسب‌وکار شما ثبت شد و در انتظار تأیید ادمین است. پس از تأیید، امکانات ویژه فعال می‌شود.',
  },
  complete: {
    tone: 'amber',
    icon: Clock,
    title: 'در انتظار تأیید نهایی',
    message: 'اطلاعات پروفایل کسب‌وکار شما کامل شد و در انتظار تأیید ادمین است.',
  },
  rejected: {
    tone: 'destructive',
    icon: AlertTriangle,
    title: 'پروفایل رد شد',
    message: 'اطلاعات پروفایل کسب‌وکار شما تأیید نشد. لطفاً اطلاعات را اصلاح و دوباره ارسال کنید.',
  },
  approved: {
    tone: 'success',
    icon: BadgeCheck,
    title: 'پروفایل تأیید شد',
    message: 'پروفایل کسب‌وکار شما تأیید شد. به پنل کاربری بروید و از امکانات ویژه استفاده کنید.',
  },
  incomplete: {
    tone: 'amber',
    icon: AlertTriangle,
    title: 'پروفایل ناقص',
    message: 'اطلاعات پروفایل کسب‌وکار شما ناقص است. برای فعال‌سازی کامل حساب، اطلاعات را تکمیل کنید.',
  },
};

const TONE_CLASSES = {
  amber: 'bg-amber/10 border-amber/25 text-amber',
  destructive: 'bg-destructive/10 border-destructive/25 text-destructive',
  success: 'bg-success/10 border-success/25 text-success',
};

interface StatusCardProps {
  status: ProfileStatus;
  onCompleteHref?: string;
  className?: string;
}

export function StatusCard({ status, onCompleteHref = '/business-profile', className }: StatusCardProps) {
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  const needsAction = status === 'incomplete' || status === 'rejected';

  return (
    <div className={cn('rounded-2xl border p-5 space-y-3', TONE_CLASSES[meta.tone], className)} role="status">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-bold">{meta.title}</p>
          <p className="text-sm mt-1 leading-relaxed opacity-90">{meta.message}</p>
        </div>
      </div>
      {needsAction && (
        <Link
          href={onCompleteHref}
          className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
        >
          {status === 'rejected' ? 'اصلاح و ارسال مجدد' : 'تکمیل پروفایل'}
          <span aria-hidden="true">←</span>
        </Link>
      )}
    </div>
  );
}
