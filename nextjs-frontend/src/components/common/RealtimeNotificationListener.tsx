'use client';

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

export function RealtimeNotificationListener() {
  useRealtimeNotifications();
  return null;
}
