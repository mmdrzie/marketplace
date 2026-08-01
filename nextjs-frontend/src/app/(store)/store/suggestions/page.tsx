'use client';

import Link from 'next/link';
import { useStoreSuggestions } from '@/hooks/usePartsV2';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: 'در انتظار', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'تأیید شده', className: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'رد شده', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export default function StoreSuggestionsPage() {
  const { data: suggestions, isLoading } = useStoreSuggestions();
  const list = suggestions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">پیشنهادات قطعه جدید</h1>
          <p className="text-sm text-muted-foreground mt-1">قطعاتی که در کاتالوگ نیستند را به ادمین پیشنهاد دهید</p>
        </div>
        <Link href="/store/suggestions/new" className="btn btn-primary flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          پیشنهاد جدید
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-surface-2 rounded-2xl motion-safe:animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-border-subtle">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <p className="text-muted-foreground mb-4">هنوز پیشنهادی ثبت نکرده‌اید</p>
          <Link href="/store/suggestions/new" className="btn btn-primary">ثبت اولین پیشنهاد</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((s: any) => (
            <div key={s.id} className="glass rounded-2xl p-5 border border-border-subtle">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
                  {s.part_number && <p className="text-xs text-muted-foreground font-mono mt-0.5">کد: {s.part_number}</p>}
                  {s.oem_number && <p className="text-xs text-muted-foreground font-mono">OEM: {s.oem_number}</p>}
                  {s.manufacturer && <p className="text-xs text-muted-foreground">تولیدکننده: {s.manufacturer}</p>}
                  {s.admin_note && <p className="text-xs text-muted-foreground mt-2">یادداشت ادمین: {s.admin_note}</p>}
                </div>
                <span className={`shrink-0 text-[10px] px-3 py-1 rounded-full border font-medium ${STATUS_LABELS[s.status]?.className || ''}`}>
                  {STATUS_LABELS[s.status]?.label || s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
