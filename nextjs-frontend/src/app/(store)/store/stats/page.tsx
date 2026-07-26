'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function StoreStatsPage() {
  const { data: inventoryStats } = useQuery({
    queryKey: ['store', 'inventory', 'stats'],
    queryFn: async () => {
      const res = await api.get('/store/inventory/stats');
      return res.data.data as { total_items: number; active_items: number; out_of_stock: number; total_stock: number };
    },
  });

  const { data: dealerStats } = useQuery({
    queryKey: ['store', 'stats'],
    queryFn: async () => {
      const res = await api.get('/store/stats');
      return res.data.data as { views: number; contacts: number };
    },
  });

  const accentColor = '#8b5cf6';

  const cards = [
    { label: 'قطعات در انبار', value: inventoryStats?.total_items ?? 0, icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />, bg: 'bg-accent-purple/10', text: 'text-accent-purple' },
    { label: 'فعال', value: inventoryStats?.active_items ?? 0, icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, bg: 'bg-success/10', text: 'text-success' },
    { label: 'ناموجود', value: inventoryStats?.out_of_stock ?? 0, icon: <path d="M12 9v2m0 4h.01" />, bg: 'bg-destructive/10', text: 'text-destructive' },
    { label: 'بازدید امروز', value: dealerStats?.views ?? 0, icon: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />, bg: 'bg-accent-blue-bg', text: 'text-accent-blue' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">آمار فروشگاه</h1>
        <p className="text-sm text-muted-foreground mt-1">آمار و عملکرد فروشگاه قطعات یدکی</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-5 border border-border-subtle">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.text}`}>
                <SvgIcon className="h-4 w-4">{card.icon}</SvgIcon>
              </div>
            </div>
            <p className="text-2xl font-black text-foreground">{card.value.toLocaleString('fa-IR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
