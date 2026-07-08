'use client';

import { motion } from 'framer-motion';
import type { ServiceRecord, ServiceType } from '@/store/serviceLogStore';
import { SERVICE_TYPE_LABELS, SERVICE_TYPE_COLORS, persianDateToNum } from '@/store/serviceLogStore';

interface ServiceLogTimelineProps {
  records: ServiceRecord[];
  onDelete?: (id: number) => void;
  isEditable?: boolean;
}

const TYPE_ICONS: Record<ServiceType, React.ReactNode> = {
  repair: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  maintenance: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
  oil_change: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  part_replacement: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" /></svg>,
  accident: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" /></svg>,
  inspection: <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
};

export function ServiceLogTimeline({ records, onDelete, isEditable }: ServiceLogTimelineProps) {
  if (!records.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        هیچ سابقه خدماتی ثبت نشده است
      </div>
    );
  }

  const sorted = [...records].sort((a, b) => persianDateToNum(b.date) - persianDateToNum(a.date));

  return (
    <div className="relative">
      {sorted.map((record, idx) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${SERVICE_TYPE_COLORS[record.type]}`}>
              {TYPE_ICONS[record.type]}
            </div>
            {idx < sorted.length - 1 && (
              <div className="w-px flex-1 bg-border-subtle mt-1" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {SERVICE_TYPE_LABELS[record.type]}
                </span>
                <h4 className="text-sm font-bold text-foreground">{record.title}</h4>
              </div>
              {isEditable && onDelete && (
                <button
                  onClick={() => onDelete(record.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="حذف"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>
            {record.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{record.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
              <span>{record.date}</span>
              {record.mileage !== undefined && <span>{record.mileage.toLocaleString('fa-IR')} کیلومتر</span>}
              {record.cost > 0 && <span>{record.cost.toLocaleString('fa-IR')} تومان</span>}
            </div>
            {record.workshop && (
              <span className="inline-block mt-1 text-[10px] bg-surface-2 px-2 py-0.5 rounded-full text-muted-foreground">
                {record.workshop}
              </span>
            )}
            {record.documents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {record.documents.map((doc, i) => (
                  <span key={i} className="text-[9px] bg-surface-2 border border-border-subtle px-2 py-0.5 rounded-md text-muted-foreground flex items-center gap-1">
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    {doc.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
