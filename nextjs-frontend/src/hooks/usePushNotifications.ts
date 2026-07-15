'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const VAPID_PUBLIC_KEY = 'BC8wAB0gV1H3bK3xJ5qL9mN7pR2tV6yZ4cE8fA0dG2iK4oM6qS8uW0yX2zC4F6hJ8kL0nP2rT5vX7zB';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData.split('').map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[Push] Notifications not supported');
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        await existing.unsubscribe();
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      await api.post('/notifications/push-subscribe', { subscription: JSON.stringify(subscription) });
      setSubscribed(true);
    } catch (err) {
      console.warn('[Push] Subscription failed:', err);
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.warn('[Push] Unsubscribe failed:', err);
    }
  };

  return { permission, subscribed, subscribe, unsubscribe, supported: 'Notification' in window && 'serviceWorker' in navigator };
}
