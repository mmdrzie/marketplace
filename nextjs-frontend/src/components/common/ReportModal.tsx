'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface ReportModalProps {
  listingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS = [
  { value: 'spam', label: 'اسپم' },
  { value: 'inappropriate', label: 'محتوای نامناسب' },
  { value: 'fake', label: 'آگهی جعلی' },
  { value: 'sold', label: 'فروخته شده' },
  { value: 'other', label: 'سایر' },
];

export function ReportModal({ listingId, onClose, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: async (data: { reason: string; description?: string }) => {
      const res = await api.post(`/listings/${listingId}/report`, data);
      return res.data;
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-800">
        <h3 className="text-lg font-bold text-white mb-4">گزارش آگهی</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">دلیل گزارش</label>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">توضیحات (اختیاری)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-sm min-h-[80px] text-white placeholder:text-slate-500"
              placeholder="توضیحات بیشتر..."
              maxLength={500}
            />
          </div>

          {reportMutation.isError && (
            <p className="text-rose-400 text-sm">
              {(reportMutation.error as any)?.response?.data?.message || 'خطا در ثبت گزارش'}
            </p>
          )}

          {reportMutation.isSuccess && (
            <p className="text-emerald-400 text-sm">گزارش شما ثبت شد.</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={() => reportMutation.mutate({ reason, description: description || undefined })}
            disabled={!reason || reportMutation.isPending}
            className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-rose-700 transition-colors"
          >
            {reportMutation.isPending ? 'در حال ارسال...' : 'ارسال گزارش'}
          </button>
        </div>
      </div>
    </div>
  );
}

