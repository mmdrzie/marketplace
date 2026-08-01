'use client';

import Link from 'next/link';
import { workshopTypeMeta, WorkshopTypeIcon } from './workshopMeta';

interface WorkshopCardProps {
  workshop: {
    user_id: string;
    workshop_slug: string;
    workshop_name: string;
    type?: string;
    specialty?: string;
    city?: string;
    address?: string;
    phone?: string;
    hours?: string;
  };
  index?: number;
}

export function WorkshopCard({ workshop: w, index = 0 }: WorkshopCardProps) {
  const meta = workshopTypeMeta(w.type);

  return (
    <Link
      key={w.user_id}
      href={`/workshops/${w.workshop_slug}`}
      className="group glass rounded-2xl border border-border-subtle overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg hover:border-border"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
    >
      <div
        className="relative flex items-center justify-between gap-2 px-4 py-2 overflow-hidden"
        style={{ background: meta.strip }}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/95">
          <WorkshopTypeIcon type={w.type} className="w-3.5 h-3.5" />
          {meta.label}
        </span>
        {w.city && <span className="text-[10px] text-white/75 truncate">{w.city}</span>}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0 text-lg font-black ${meta.text}`}>
            {w.workshop_name?.[0] || '؟'}
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
              {w.workshop_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{w.specialty || '—'}</p>
          </div>
        </div>

        <div className="mt-3.5 space-y-2 text-xs text-muted-foreground">
          {w.address && (
            <p className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span className="truncate">{w.city ? `${w.city} — ${w.address}` : w.address}</span>
            </p>
          )}
          {!w.address && w.city && (
            <p className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" /><circle cx="12" cy="10" r="3" /></svg>
              <span className="truncate">{w.city}</span>
            </p>
          )}
          {w.phone && (
            <p className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" /></svg>
              <span dir="ltr">{w.phone}</span>
            </p>
          )}
          {w.hours && (
            <p className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              <span className="truncate">{w.hours}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
