'use client';

import { CUSTOMS_STATUS_LABELS } from '@/types/imported';
import { CountryFlagIcon } from './CountryFlagIcon';
import type { CustomsStatus } from '@/types/imported';

interface CustomsStatusCardProps {
  country?: string;
  customsStatus?: CustomsStatus | string;
  importDate?: string;
  clearanceDate?: string;
  chassisNumber?: string;
  engineNumber?: string;
  className?: string;
}

const STATUS_COLORS: Record<string, { className: string; style?: React.CSSProperties }> = {
  customs: { className: 'bg-destructive/10 text-destructive border-destructive/30' },
  plated: { className: 'bg-success/10 text-success border-success/30' },
  freezone_plated: { className: 'bg-warning/10 text-warning border-warning/30' },
  transit: { className: 'text-accent-blue border-accent-blue-border', style: { backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' } },
};

export function CustomsStatusCard({
  country, customsStatus, importDate, clearanceDate,
  chassisNumber, engineNumber, className = '',
}: CustomsStatusCardProps) {
  const statusKey = (Object.entries(CUSTOMS_STATUS_LABELS).find(([, v]) => v === customsStatus)?.[0] || customsStatus) as string;
  const colorConfig = STATUS_COLORS[statusKey] || STATUS_COLORS.plated;

  if (!customsStatus) return null;

  return (
    <div className={`glass rounded-2xl p-4 border border-border-subtle space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="text-sm font-bold text-foreground">مشخصات گمرکی</span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${colorConfig.className}`} style={colorConfig.style}>
          {customsStatus}
        </span>
      </div>

      {country && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">کشور مبدأ</span>
          <div className="flex items-center gap-1.5">
            <CountryFlagIcon country={country} size={16} />
            <span className="font-bold text-foreground">{country}</span>
          </div>
        </div>
      )}

      {importDate && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">تاریخ ورود</span>
          <span className="font-bold text-foreground">{importDate}</span>
        </div>
      )}

      {clearanceDate && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">تاریخ ترخیص</span>
          <span className="font-bold text-foreground">{clearanceDate}</span>
        </div>
      )}

      {chassisNumber && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">شاسی</span>
          <span className="font-bold text-foreground font-mono text-[10px]">{chassisNumber}</span>
        </div>
      )}

      {engineNumber && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">موتور</span>
          <span className="font-bold text-foreground font-mono text-[10px]">{engineNumber}</span>
        </div>
      )}
    </div>
  );
}
