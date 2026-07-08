'use client';

import { formatDate } from '@/lib/utils';

interface PersianDateProps {
  date: string | null;
}

export function PersianDate({ date }: PersianDateProps) {
  return <span>{formatDate(date)}</span>;
}
