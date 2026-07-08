'use client';

import { persianDateToNum, getCurrentPersianMonthNum } from '@/store/serviceLogStore';

interface ServiceEvent {
  date: string;
  type: string;
  cost: number;
  description: string;
}

interface MaintenanceCalendarProps {
  serviceHistory: ServiceEvent[];
  nextService: string;
  className?: string;
}

export function MaintenanceCalendar({ serviceHistory, nextService, className = '' }: MaintenanceCalendarProps) {
  const nowNum = getCurrentPersianMonthNum();
  const nextServiceNum = persianDateToNum(nextService);
  const isNextServiceSoon = nextServiceNum - nowNum < 200 && nextServiceNum >= nowNum;

  const sorted = [...serviceHistory].sort((a, b) => persianDateToNum(b.date) - persianDateToNum(a.date));
  const recent = sorted.slice(0, 3);

  return (
    <div className={`glass rounded-2xl p-5 border border-border-subtle ${className}`}>
      <h4 className="text-sm font-bold text-foreground mb-4">سرویس‌ها</h4>

      <div className={`flex items-center justify-between p-3 rounded-xl border mb-4 ${
        isNextServiceSoon ? 'bg-warning/10 border-warning/20' : 'bg-surface-2 border-border-subtle'
      }`}>
        <span className="text-xs text-foreground font-medium">سرویس بعدی</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{nextService}</span>
          {isNextServiceSoon && (
            <span className="text-[9px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">نزدیک</span>
          )}
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-3">سابقه سرویسی ثبت نشده</p>
      ) : (
        <div className="space-y-2">
          {recent.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <span className="text-xs text-foreground font-medium">{s.type}</span>
                <p className="text-[10px] text-muted-foreground">{s.description}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">{s.date}</span>
                <div className="text-[10px] font-bold text-foreground">{s.cost.toLocaleString('fa-IR')} تومان</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
