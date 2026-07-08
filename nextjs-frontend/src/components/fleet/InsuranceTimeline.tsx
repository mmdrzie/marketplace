'use client';

import { persianDateToNum, getCurrentPersianMonthNum } from '@/store/serviceLogStore';

interface InsuranceTimelineProps {
  insuranceExpiry: string;
  inspectionExpiry: string;
  className?: string;
}

function isExpired(date: string): boolean {
  return persianDateToNum(date) < getCurrentPersianMonthNum();
}

function isSoon(date: string): boolean {
  const d = persianDateToNum(date);
  const now = getCurrentPersianMonthNum();
  return d > now && d - now < 200;
}

export function InsuranceTimeline({ insuranceExpiry, inspectionExpiry, className = '' }: InsuranceTimelineProps) {
  const insuranceStatus = isExpired(insuranceExpiry) ? 'expired' : isSoon(insuranceExpiry) ? 'soon' : 'ok';
  const inspectionStatus = isExpired(inspectionExpiry) ? 'expired' : isSoon(inspectionExpiry) ? 'soon' : 'ok';

  const items = [
    { label: 'بیمه شخص ثالث', date: insuranceExpiry, status: insuranceStatus },
    { label: 'معاینه فنی', date: inspectionExpiry, status: inspectionStatus },
  ];

  return (
    <div className={`glass rounded-2xl p-5 border border-border-subtle ${className}`}>
      <h4 className="text-sm font-bold text-foreground mb-4">بیمه و معاینه فنی</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                item.status === 'expired' ? 'bg-destructive' : item.status === 'soon' ? 'bg-warning' : 'bg-success'
              }`} />
              <span className="text-xs text-foreground font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.date}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                item.status === 'expired' ? 'bg-destructive/10 text-destructive' : item.status === 'soon' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
              }`}>
                {item.status === 'expired' ? 'منقضی' : item.status === 'soon' ? 'نزدیک' : 'معتبر'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
