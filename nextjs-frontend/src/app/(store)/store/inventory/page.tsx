'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { PartsSelector } from '@/components/store/PartsSelector';

function SvgIcon({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

const STATUS_LABELS: Record<string, string> = {
  active: 'فعال',
  inactive: 'غیرفعال',
  out_of_stock: 'ناموجود',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-surface-2 text-muted-foreground border-border',
  out_of_stock: 'bg-destructive/10 text-destructive border-destructive/20',
};

interface InventoryItem {
  id: number;
  store_id: string;
  part_id: number;
  price: number;
  stock_count: number;
  status: string;
  notes: string;
  part_name: string;
  part_number: string;
  part_image: string;
  category_label: string;
  compatibility: string;
  manufacturer: string;
  created_at: string;
  updated_at: string;
}

export default function StoreInventoryPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['store', 'inventory', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await api.get(`/store/inventory${params}`);
      return res.data.data as InventoryItem[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/store/inventory/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['store', 'inventory'] }),
  });

  const items = data || [];

  const accentColor = '#8b5cf6';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت قطعات</h1>
          <p className="text-sm text-muted-foreground mt-1">قطعات یدکی موجود در فروشگاه خود را مدیریت کنید</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary flex items-center gap-2">
          <SvgIcon className="h-4 w-4"><path d="M12 5v14M5 12h14" /></SvgIcon>
          افزودن قطعه
        </button>
      </div>

      {showAddForm && (
        <PartsSelector
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            queryClient.invalidateQueries({ queryKey: ['store', 'inventory'] });
          }}
        />
      )}

      <div className="flex gap-2">
        {['', 'active', 'inactive', 'out_of_stock'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              statusFilter === s
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface-2 text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            {s ? STATUS_LABELS[s] : 'همه'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-border-subtle animate-pulse">
              <div className="h-4 bg-surface-2 rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-2 rounded w-1/2 mb-2" />
              <div className="h-3 bg-surface-2 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-border-subtle">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 10%, transparent)' }}>
            <SvgIcon className="h-8 w-8" style={{ color: accentColor }}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></SvgIcon>
          </div>
          <p className="text-muted-foreground">هیچ قطعه‌ای در انبار شما ثبت نشده است</p>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary mt-4">افزودن اولین قطعه</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-5 border border-border-subtle hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-sm truncate">{item.part_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.part_number}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium ${STATUS_COLORS[item.status] || ''}`}>
                  {STATUS_LABELS[item.status] || item.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{item.category_label}</span>
                <span>{item.compatibility ? `سازگار با ${item.compatibility}` : ''}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">{item.price.toLocaleString('fa-IR')} تومان</p>
                  <p className="text-xs text-muted-foreground">موجودی: {item.stock_count}</p>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/store/inventory/${item.id}/edit`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-2 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <SvgIcon className="h-4 w-4"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></SvgIcon>
                  </Link>
                  <button
                    onClick={() => { if (confirm('حذف شود؟')) deleteMutation.mutate(item.id); }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <SvgIcon className="h-4 w-4"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></SvgIcon>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
