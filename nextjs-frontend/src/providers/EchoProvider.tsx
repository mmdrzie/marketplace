'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface EchoInstance {
  private: (channel: string) => { listen: (event: string, callback: () => void) => void };
  leave: (channel: string) => void;
  disconnect: () => void;
}

interface EchoContextType {
  echo: EchoInstance | null;
  private: (channel: string) => ReturnType<EchoInstance['private']> | undefined;
}

const EchoContext = createContext<EchoContextType>({ echo: null, private: () => undefined });

export function useEcho() {
  return useContext(EchoContext);
}

export function EchoProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuthStore();
  const [echo, setEcho] = useState<EchoInstance | null>(null);
  const echoCleanupRef = useRef<EchoInstance | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    if (!process.env.NEXT_PUBLIC_REVERB_APP_KEY) return;

    let mounted = true;

    const initEcho = async () => {
      try {
        const EchoModule = (await import('laravel-echo')).default;
        (window as unknown as { Pusher: unknown }).Pusher = (await import('pusher-js')).default;

        const instance = new EchoModule({
          broadcaster: 'reverb',
          key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
          wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
          wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
          wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
          forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
          enabledTransports: ['ws', 'wss'],
          authEndpoint: process.env.NEXT_PUBLIC_API_URL + '/broadcasting/auth',
          auth: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        if (mounted) {
          setEcho(instance);
          echoCleanupRef.current = instance;
        }
      } catch {
        // Pusher/Echo not configured
      }
    };

    initEcho();

    return () => {
      mounted = false;
      if (echoCleanupRef.current) {
        echoCleanupRef.current.disconnect();
        echoCleanupRef.current = null;
      }
    };
  }, [isAuthenticated, token]);

  const value: EchoContextType = {
    echo,
    private: (channel: string) => echo?.private(channel),
  };

  return (
    <EchoContext.Provider value={value}>
      {children}
    </EchoContext.Provider>
  );
}
