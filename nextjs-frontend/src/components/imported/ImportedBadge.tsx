'use client';

import { CountryFlagIcon } from './CountryFlagIcon';

interface ImportedBadgeProps {
  country?: string | null;
  customsStatus?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function ImportedBadge({ country, customsStatus, size = 'sm', className = '' }: ImportedBadgeProps) {
  const isSm = size === 'sm';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold border transition-all ${isSm ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'} ${customsStatus === 'گمرکی' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'} ${className}`}
    >
      {country && <CountryFlagIcon country={country} size={isSm ? 12 : 16} />}
      وارداتی
      {customsStatus && (
        <span className={`${isSm ? 'text-[7px]' : 'text-[9px]'} opacity-70`}>
          | {customsStatus}
        </span>
      )}
    </span>
  );
}
