'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { FadeIn } from '@/components/common/MotionDiv';
import { formatRelativeTime, cn } from '@/lib/utils';

interface Notification {
  id: number;
  type: string;
  is_read: boolean;
  data: { title?: string; body?: string; action_url?: string };
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = { message: 'پیام‌ها', listing: 'آگهی‌ها', favorite: 'علاقه‌مندی', system: 'سیستم' };
const TYPE_ICONS: Record<string, React.ReactNode> = {
  message: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>,
  listing: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  favorite: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
  system: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
};

export default function NotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread' | 'message' | 'listing' | 'system'>('all');
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    staleTime: 60000,
    retry: 0,
  });

  const notifications = useMemo(() => (data?.data ?? []) as Notification[], [data]);

  const filtered = useMemo(() => {
    if (tab === 'all') return notifications;
    if (tab === 'unread') return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.type === tab);
  }, [notifications, tab]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = useMutation({
    mutationFn: async () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  return (
    <div className="relative min-h-screen">
      <FadeIn>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-foreground">اعلان‌ها</h1>
              <p className="text-sm text-muted-foreground mt-1">مرکز پیام‌ها و اعلان‌های سیستم</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="/dashboard/settings/notifications" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                تنظیمات
              </a>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  خواندن همه
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto">
            {[
              { key: 'all', label: 'همه', count: notifications.length },
              { key: 'unread', label: 'خوانده نشده', count: unreadCount },
              ...Object.entries(TYPE_LABELS).map(([key, label]) => ({
                key, label, count: notifications.filter((n) => n.type === key).length,
              })),
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all shrink-0',
                  tab === t.key
                      ? 'bg-primary/15 border-primary/30 text-primary'
                      : 'bg-surface-2 border-border-subtle text-muted-foreground hover:text-foreground',
                )}
              >
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    tab === t.key ? 'bg-primary/20 text-primary' : 'bg-surface-2 text-muted-foreground',
                  )}>
                    {t.count.toLocaleString('fa-IR')}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-border-subtle">
              <div className="mb-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg></div>
              <p className="text-muted-foreground text-sm">اعلانی وجود ندارد</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'glass rounded-2xl p-4 border transition-all flex items-start gap-3',
                    !n.is_read ? 'border-primary/20 bg-primary/5' : 'border-border-subtle',
                  )}
                >
                  <div className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[n.type] || <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={cn('text-sm', !n.is_read ? 'font-bold text-foreground' : 'font-medium text-foreground')}>
                        {n.data?.title || n.type}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                        <span className="text-[10px] text-muted-foreground/60">{formatRelativeTime(n.created_at)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.data?.body}</p>
                    {n.data?.action_url && (
                      <a href={n.data.action_url} className="inline-block mt-2 text-[11px] text-primary hover:text-primary/80 transition-colors">
                        مشاهده ←
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
