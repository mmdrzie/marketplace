'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import type { Category } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: async () => { const res = await api.get('/categories'); return res.data; },
    staleTime: 60000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => { await api.post('/admin/categories', data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories }); setNewName(''); setNewSlug(''); },
  });

  const categories = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">دسته‌بندی‌ها</h1>

      <div className="glass rounded-2xl p-4">
        <h3 className="font-medium text-sm mb-3 text-foreground">دسته‌بندی جدید</h3>
        <div className="flex gap-3">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="نام" className="flex-1 px-4 py-2.5 bg-surface-2 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="slug" className="flex-1 px-4 py-2.5 bg-surface-2 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
          <button onClick={() => createMutation.mutate({ name: newName, slug: newSlug })} disabled={!newName || !newSlug || createMutation.isPending} className="btn btn-primary">افزودن</button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-surface-2 rounded-xl motion-safe:animate-pulse" />)}</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th className="text-right px-4 py-3 font-medium text-foreground">نام</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">slug</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">زیردسته‌ها</th>
                  <th className="text-right px-4 py-3 font-medium text-foreground">ترتیب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(categories as Category[]).map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{cat.children?.map((c: Category) => c.name).join(', ') || '-'}</td>
                    <td className="px-4 py-3 text-foreground">{cat.sort_order}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
