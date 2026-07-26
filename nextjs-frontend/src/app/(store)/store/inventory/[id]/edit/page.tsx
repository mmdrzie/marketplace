'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function EditInventoryPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const [price, setPrice] = useState('');
  const [stockCount, setStockCount] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');

  const { data: item } = useQuery({
    queryKey: ['store', 'inventory', 'edit', id],
    queryFn: async () => {
      const res = await api.get('/store/inventory');
      const items = res.data.data as Array<{ id: number; price: number; stock_count: number; status: string; notes: string; part_name: string; part_number: string }>;
      return items.find((i: { id: number }) => i.id === id);
    },
  });

  useEffect(() => {
    if (item) {
      setPrice(String(item.price));
      setStockCount(String(item.stock_count));
      setStatus(item.status);
      setNotes(item.notes || '');
    }
  }, [item]);

  const mutation = useMutation({
    mutationFn: async () => {
      await api.put(`/store/inventory/${id}`, {
        price: Number(price),
        stockCount: Number(stockCount),
        status,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', 'inventory'] });
      router.push('/store/inventory');
    },
  });

  if (!item) return <div className="p-8 text-center text-muted-foreground">در حال بارگذاری...</div>;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ویرایش قطعه</h1>
        <p className="text-sm text-muted-foreground mt-1">{item.part_name} - {item.part_number}</p>
      </div>

      <div className="glass rounded-2xl p-6 border border-border-subtle space-y-5">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">قیمت (تومان)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">تعداد موجودی</label>
          <input type="number" value={stockCount} onChange={(e) => setStockCount(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">وضعیت</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground">
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
            <option value="out_of_stock">ناموجود</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">یادداشت</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 glass-input rounded-xl text-sm text-foreground resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.back()} className="flex-1 py-3 btn btn-ghost rounded-xl">انصراف</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="flex-1 py-3 btn btn-primary rounded-xl">
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </div>
  );
}
