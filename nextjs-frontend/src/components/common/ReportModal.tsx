'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

interface ReportModalProps {
  listingId: string | number;
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
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-overlay/80 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          tabIndex={-1}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md"
        >
          {/* Glow border */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-destructive/20 via-transparent to-destructive/10 blur-sm pointer-events-none" />

          <div className="relative rounded-2xl p-6" style={{ background: 'var(--color-glass-bg)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid var(--color-glass-border)', boxShadow: 'var(--shadow-glass)' }}>
            <h3 id="report-modal-title" className="text-lg font-bold text-foreground mb-4">گزارش آگهی</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">دلیل گزارش</label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">توضیحات (اختیاری)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 glass-input rounded-xl text-sm min-h-[80px] text-foreground placeholder:text-muted-foreground"
                  placeholder="توضیحات بیشتر..."
                  maxLength={500}
                />
              </div>

              {reportMutation.isError && (
                <p className="text-destructive text-sm">
                  {(reportMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'خطا در ثبت گزارش'}
                </p>
              )}

              {reportMutation.isSuccess && (
                <p className="text-success text-sm">گزارش شما ثبت شد.</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-2 btn btn-ghost rounded-xl text-sm"
              >
                انصراف
              </button>
              <button
                onClick={() => reportMutation.mutate({ reason, description: description || undefined })}
                disabled={!reason || reportMutation.isPending}
                className="flex-1 py-2 btn btn-danger rounded-xl text-sm disabled:opacity-50"
              >
                {reportMutation.isPending ? 'در حال ارسال...' : 'ارسال گزارش'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
