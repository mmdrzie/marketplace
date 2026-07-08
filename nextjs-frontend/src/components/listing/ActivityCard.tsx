'use client';

import { useEffect, useState } from 'react';

export type ActivityType = 'listing_created' | 'message_received' | 'listing_sold' | 'review_received' | 'view' | 'message' | 'favorite' | 'sold';

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  created_at: string;
}

function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins} دقیقه پیش`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} ساعت پیش`;
      return `${Math.floor(hours / 24)} روز پیش`;
    };
    const t = setTimeout(() => setLabel(calc()), 0);
    const id = setInterval(() => setLabel(calc()), 60000);
    return () => { clearTimeout(t); clearInterval(id); };
  }, [iso]);

  return <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{label}</span>;
}

export function ActivityCard({ activities }: { activities: Activity[] }) {
  const getConfig = (type: ActivityType) => {
    const configs: Record<string, { icon: string; color: string }> = {
      listing_created: {
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
        color: 'text-accent-blue bg-accent-blue-bg',
      },
      message_received: {
        icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
        color: 'text-accent-blue bg-accent-blue-bg',
      },
      listing_sold: {
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'text-success bg-success/10',
      },
      review_received: {
        icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        color: 'text-warning bg-warning/10',
      },
    };
    return configs[type] || configs.listing_created;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 border border-border-subtle">
        <h3 className="text-sm font-bold text-foreground mb-3">فعالیت‌های اخیر</h3>
        <p className="text-xs text-muted-foreground text-center py-6">هنوز فعالیتی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 border border-border-subtle">
      <h3 className="text-sm font-bold text-foreground mb-3">فعالیت‌های اخیر</h3>
      <div className="space-y-1">
        {activities.map((a) => {
          const cfg = getConfig(a.type);
          return (
            <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-2/50 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={cfg.icon} /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{a.message}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 mt-1">              <RelativeTime iso={a.created_at} /></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
