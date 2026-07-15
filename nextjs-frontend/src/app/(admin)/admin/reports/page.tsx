'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { GlassSelect } from '@/components/common/GlassSelect';
import { formatRelativeTime } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/Toast';

export default function AdminReportsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.reports,
    queryFn: async () => { const res = await api.get('/admin/reports'); return res.data; },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => { await api.put(`/admin/reports/${id}`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports }); toast({ type: 'success', title: 'گزارش بروزرسانی شد' }); },
    onError: () => { toast({ type: 'error', title: 'خطا', message: 'بروزرسانی گزارش با مشکل مواجه شد' }); },
  });

  const reports = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">گزارشات</h1>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-surface-2 rounded-xl motion-safe:animate-pulse" />)}</div>
      ) : reports.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">گزارشی ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(reports as Array<{ id: number; reporter?: { name: string }; reason: string; description?: string; status: string; created_at: string }>).map((report) => (
            <div key={report.id} className="glass rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">گزارش دهنده:</span>
                    <span className="text-foreground">{report.reporter?.name || 'کاربر'}</span>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(report.created_at)}</span>
                  </div>
                  <p className="text-sm mt-1">
                    <span className="font-medium text-foreground">دلیل:</span>{' '}
                    {report.reason === 'spam' ? 'اسپم' : report.reason === 'inappropriate' ? 'نامناسب' : report.reason === 'fake' ? 'جعلی' : report.reason === 'sold' ? 'فروخته شده' : 'سایر'}
                  </p>
                  {report.description && <p className="text-xs text-muted-foreground mt-1">{report.description}</p>}
                </div>
                <GlassSelect
                  value={report.status}
                  onChange={(val) => updateMutation.mutate({ id: report.id, status: val })}
                  options={[
                    { value: 'pending', label: 'در انتظار' },
                    { value: 'reviewed', label: 'بررسی شده' },
                    { value: 'dismissed', label: 'رد شده' },
                  ]}
                  className="w-36"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
