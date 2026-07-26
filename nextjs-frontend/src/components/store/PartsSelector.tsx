'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface Part {
  id: number;
  name: string;
  part_number: string;
  price: number;
  image: string;
  category_label: string;
  compatibility: string;
  manufacturer: string;
  in_stock: boolean;
}

interface PartsSelectorProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function PartsSelector({ onClose, onSuccess }: PartsSelectorProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [customPrice, setCustomPrice] = useState('');
  const [stockCount, setStockCount] = useState('1');
  const [notes, setNotes] = useState('');

  const { data: partsData, isLoading } = useQuery({
    queryKey: ['parts', 'catalog', search],
    queryFn: async () => {
      const params = search ? `?q=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/parts${params}`);
      return res.data.data as Part[];
    },
  });

  const parts = partsData || [];

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPart) return;
      await api.post('/store/inventory', {
        partId: selectedPart.id,
        price: Number(customPrice) || selectedPart.price,
        stockCount: Number(stockCount) || 1,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', 'inventory'] });
      onSuccess?.();
      onClose();
    },
  });

  return (
    <div className="glass rounded-2xl p-6 border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-foreground">انتخاب قطعه از کاتالوگ</h2>
        <button onClick={onClose} className="btn btn-ghost btn-sm">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {!selectedPart ? (
        <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی قطعه..."
            className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground mb-4"
            autoFocus
          />

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-surface-2 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1">
              {parts.map((part) => (
                <button
                  key={part.id}
                  onClick={() => { setSelectedPart(part); setCustomPrice(String(part.price)); }}
                  className="w-full text-right px-4 py-3 rounded-xl hover:bg-surface-2 transition-all text-sm flex items-center justify-between"
                >
                  <div>
                    <span className="text-foreground font-medium">{part.name}</span>
                    <span className="text-muted-foreground mr-2 font-mono text-xs">{part.part_number}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{part.category_label}</span>
                </button>
              ))}
              {parts.length === 0 && search && (
                <p className="text-center text-sm text-muted-foreground py-4">قطعه‌ای یافت نشد</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-surface-2 rounded-xl">
            <div>
              <p className="font-bold text-foreground text-sm">{selectedPart.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{selectedPart.part_number}</p>
              <p className="text-xs text-muted-foreground mt-1">{selectedPart.compatibility}</p>
            </div>
            <button onClick={() => setSelectedPart(null)} className="text-xs text-primary hover:underline">تغییر</button>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">قیمت (تومان)</label>
            <input type="number" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">تعداد موجودی</label>
            <input type="number" value={stockCount} onChange={(e) => setStockCount(e.target.value)} min="1" className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">یادداشت (اختیاری)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 btn btn-ghost rounded-xl">انصراف</button>
            <button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !customPrice}
              className="flex-1 py-3 btn btn-primary rounded-xl"
            >
              {addMutation.isPending ? 'در حال افزودن...' : 'افزودن به انبار'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
