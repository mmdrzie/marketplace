'use client';

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/Toast';
import { FadeIn } from '@/components/common/MotionDiv';

const NOTIF_TYPES = [
  { key: 'message', label: 'پیام‌ها', desc: 'اعلان پیام‌های جدید از خریداران و فروشندگان' },
  { key: 'listing', label: 'آگهی‌ها', desc: 'اعلان تأیید، رد یا انقضای آگهی' },
  { key: 'favorite', label: 'علاقه‌مندی‌ها', desc: 'اعلان ذخیره آگهی توسط دیگران' },
  { key: 'system', label: 'سیستم', desc: 'اعلان‌های سیستمی، بروزرسانی و هشدارها' },
] as const;

const CHANNELS = [
  { key: 'in_app', label: 'درون برنامه', desc: 'نمایش در لیست اعلان‌ها' },
  { key: 'email', label: 'ایمیل', desc: 'ارسال به ایمیل شما' },
  { key: 'sms', label: 'پیامک', desc: 'ارسال پیامک به شماره موبایل' },
] as const;

type PreferenceValue = Record<string, Record<string, boolean>>;

const defaultPrefs: PreferenceValue = Object.fromEntries(
  NOTIF_TYPES.map((t) => [t.key, Object.fromEntries(CHANNELS.map((c) => [c.key, c.key === 'in_app']) as [string, boolean][])]),
);

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<PreferenceValue>(defaultPrefs);
  const initializedRef = useRef<boolean | null>(null);
  const [changed, setChanged] = useState(false);

  const { data } = useQuery({
    queryKey: queryKeys.auth.notifications,
    queryFn: async () => {
      const res = await api.get('/me/notification-preferences');
      return res.data.data;
    },
    staleTime: 60000,
    retry: 0,
  });

  useEffect(() => {
    if (data && initializedRef.current == null) {
      initializedRef.current = true;
      const merged: PreferenceValue = { ...defaultPrefs };
      for (const type of Object.keys(data)) {
        if (merged[type]) {
          merged[type] = { ...merged[type], ...data[type] };
        }
      }
      queueMicrotask(() => setPrefs(merged));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (payload: PreferenceValue) => {
      await api.put('/me/notification-preferences', { preferences: payload });
    },
    onSuccess: () => {
      setChanged(false);
      toast({ type: 'success', title: 'تنظیمات اعلان ذخیره شد' });
    },
    onError: () => {
      toast({ type: 'error', title: 'خطا در ذخیره تنظیمات' });
    },
  });

  const toggle = (type: string, channel: string) => {
    setPrefs((prev) => {
      const updated = {
        ...prev,
        [type]: { ...prev[type], [channel]: !prev[type]?.[channel] },
      };
      return updated;
    });
    setChanged(true);
  };

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full px-4 py-12 md:py-16 space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                NOTIFICATION SETTINGS
              </span>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">تنظیمات اعلان‌ها</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base font-light">مشخص کنید چه اعلان‌هایی و از چه طریقی دریافت کنید.</p>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 md:p-10 shadow-xl border border-border-subtle space-y-6">
            {NOTIF_TYPES.map((type) => (
              <div key={type.key} className="pb-6 border-b border-border last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{type.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {CHANNELS.map((channel) => {
                    const enabled = prefs[type.key]?.[channel.key] ?? channel.key === 'in_app';
                    return (
                      <button
                        key={channel.key}
                        type="button"
                        onClick={() => toggle(type.key, channel.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                          enabled
                            ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                            : 'bg-surface-2/50 text-muted-foreground border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          enabled ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {enabled && (
                            <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span className="whitespace-nowrap">{channel.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => saveMutation.mutate(prefs)}
              disabled={!changed || saveMutation.isPending}
              className="h-12 px-8 rounded-xl btn btn-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {saveMutation.isPending ? (
                <><div className="follow-the-leader scale-50"><div></div><div></div><div></div><div></div><div></div></div> در حال ذخیره...</>
              ) : (
                <><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> ذخیره تنظیمات</>
              )}
            </button>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
