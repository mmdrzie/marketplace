'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEcho } from '@/providers/EchoProvider';
import { queryKeys } from '@/lib/queryKeys';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/common/Toast';

const NOTIF_LABELS: Record<string, string> = {
  message: 'پیام جدید',
  listing: 'آگهی',
  favorite: 'علاقه‌مندی',
  system: 'سیستم',
};

export function useRealtimeNotifications() {
  const { echo } = useEcho();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!echo || !user?.id) return;

    const channel = echo.private(`App.Models.User.${user.id}`);

    const handler = (notification: { type: string; title?: string; body?: string }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
      toast({
        type: 'info',
        title: NOTIF_LABELS[notification.type] || 'اعلان جدید',
        message: notification.title || notification.body || '',
      });
    };

    try {
      (channel as unknown as { notification: (cb: (notification: { type: string; title?: string; body?: string }) => void) => void }).notification(handler);
    } catch {
      // notification listener not available
    }

    return () => {
      try { echo.leave(`App.Models.User.${user.id}`); } catch { /* ignore */ }
    };
  }, [echo, user?.id, queryClient]);
}
