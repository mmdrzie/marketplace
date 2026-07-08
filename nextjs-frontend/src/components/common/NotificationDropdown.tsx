'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatRelativeTime } from '@/lib/utils';

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    staleTime: 60000,
    retry: 0,
  });

  const notifications = data?.data || [];
  const unread = notifications.filter((n: { is_read: boolean }) => !n.is_read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost btn-sm relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute start-0 top-full mt-2 w-80 glass rounded-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-border-subtle flex items-center justify-between">
            <h4 className="font-medium text-sm text-foreground">اعلان‌ها</h4>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                اعلانی ندارید
              </div>
            ) : (
              notifications.slice(0, 10).map((n: { id: number; is_read: boolean; data?: { title?: string; body?: string }; type: string; created_at: string }) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border-subtle last:border-0 text-sm ${!n.is_read ? 'bg-primary/5' : ''}`}
                >
                  <p className="font-medium text-foreground">{n.data?.title || n.type}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.data?.body}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeTime(n.created_at)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
