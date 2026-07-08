'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'پیش‌نویس', className: 'bg-muted text-muted-foreground' },
  pending: { label: 'در انتظار تایید', className: 'bg-warning/15 text-warning' },
  published: { label: 'منتشر شده', className: 'bg-success/15 text-success' },
  rejected: { label: 'رد شده', className: 'bg-destructive/15 text-destructive' },
  sold: { label: 'فروخته شده', className: 'bg-accent-indigo/15 text-accent-indigo' },
  archived: { label: 'بایگانی', className: 'bg-muted text-muted-foreground' },
  expired: { label: 'منقضی شده', className: 'bg-accent-sky/15 text-accent-sky' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
