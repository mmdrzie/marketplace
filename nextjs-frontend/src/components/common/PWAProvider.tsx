'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={async () => {
          deferredPrompt?.prompt();
          const result = await deferredPrompt?.userChoice;
          if (result?.outcome === 'accepted') {
            setShowInstall(false);
          }
        }}
        className="glass px-5 py-3 rounded-2xl text-sm font-bold text-primary hover:border-primary/30 transition-all duration-300 shadow-2xl"
      >
        نصب اپلیکیشن
      </button>
    </div>
  );
}
