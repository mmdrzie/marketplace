'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, ReactNode } from 'react';
import { setOnApiError, getApiErrorMessage } from '@/lib/api';
import { createQueryClient } from '@/lib/queryClient';
import { toast } from '@/components/common/Toast';

export let queryClient: ReturnType<typeof createQueryClient> | undefined;

export function QueryProvider({ children }: { children: ReactNode }) {
  const [qc] = useState(() => {
    const client = createQueryClient();
    queryClient = client;
    return client;
  });

  useEffect(() => {
    setOnApiError((error) => {
      toast({ type: 'error', title: getApiErrorMessage(error) });
    });
    return () => setOnApiError(null);
  }, []);

  return (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}
