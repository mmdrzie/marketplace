'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { queryKeys } from '@/lib/queryKeys';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.settings,
    queryFn: async () => { const res = await api.get('/admin/settings'); return res.data.data; },
    staleTime: 60000,
  });

  if (data && Object.keys(settings).length === 0) {
    const initial: Record<string, string> = {};
    for (const s of data as Array<{ key: string; value: string }>) {
      initial[s.key] = String(s.value);
    }
    if (Object.keys(initial).length > 0) setSettings(initial);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({ key, value }));
      await api.put('/admin/settings', { settings: settingsArray });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings }),
  });

  if (isLoading) {
    return <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-surface-2 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">تنظیمات پلتفرم</h1>

      <div className="glass rounded-2xl p-6 max-w-lg">
        <div className="space-y-4">
          {(data as Array<{ key: string; value: string; type?: string }>)?.map((setting) => (
            <div key={setting.key}>
              <label className="block text-sm font-medium mb-1.5 text-foreground">{setting.key}</label>
              <input
                type={setting.type === 'integer' ? 'number' : 'text'}
                value={settings[setting.key] || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                className="w-full px-4 py-2.5 bg-surface-2 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>
          ))}
        </div>
        <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn btn-primary mt-6">
          {saveMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </button>
      </div>
    </div>
  );
}
