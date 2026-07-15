'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StarRating } from './StarRating';
import { cn, formatRelativeTime } from '@/lib/utils';
import { FadeIn } from './MotionDiv';
import { toast } from '@/components/common/Toast';

interface Review {
  id: number;
  author: string;
  avatar: string | null;
  rating: number;
  text: string;
  created_at: string;
}

interface DealerReviewsProps {
  dealerId: number;
  className?: string;
}

export function DealerReviews({ dealerId, className }: DealerReviewsProps) {
  const { data: reviewsData } = useQuery({
    queryKey: ['dealer-reviews', dealerId],
    queryFn: async () => { const res = await api.get(`/dealers/${dealerId}/reviews`); return res.data.data as Review[]; },
    enabled: !!dealerId,
  });
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const reviews = reviewsData ?? localReviews;
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState('');

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submitMutation = useMutation({
    mutationFn: (data: { rating: number; text: string }) =>
      api.post(`/dealers/${dealerId}/reviews`, data),
    onSuccess: () => {
      toast({ type: 'success', title: 'نظر شما ثبت شد' });
    },
    onError: () => {
      toast({ type: 'error', title: 'خطا در ثبت نظر', message: 'لطفاً مجدداً تلاش کنید' });
    },
  });

  const handleSubmit = () => {
    if (newRating === 0 || !newText.trim()) return;
    const review: Review = {
      id: Date.now(),
      author: 'شما',
      avatar: null,
      rating: newRating,
      text: newText.trim(),
      created_at: new Date().toISOString(),
    };
    setLocalReviews((prev) => [review, ...prev]);
    setShowForm(false);
    setNewRating(0);
    setNewText('');
    submitMutation.mutate({ rating: newRating, text: newText.trim() });
  };

  return (
    <div className={cn('glass rounded-3xl p-6 border border-border-subtle', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-foreground">{avgRating.toFixed(1)}</span>
            <StarRating value={Math.round(avgRating)} size="sm" />
          </div>
          <span className="text-xs text-muted-foreground">({reviews.length} نظر)</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[11px] font-bold bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-xl transition-colors"
        >
          ثبت نظر
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <FadeIn>
          <div className="mb-6 p-4 bg-surface-2 rounded-2xl border border-border-subtle space-y-3">
            <StarRating value={newRating} onChange={setNewRating} size="md" />
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="نظرت درباره این فروشنده چیه؟"
              rows={3}
              className="w-full bg-background border border-border-subtle rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 transition-colors resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="text-[11px] text-muted-foreground hover:text-foreground px-3 py-1.5 transition-colors">انصراف</button>
              <button onClick={handleSubmit} disabled={newRating === 0 || !newText.trim() || submitMutation.isPending} className="text-[11px] font-bold bg-primary hover:bg-primary/90 disabled:opacity-40 text-white px-4 py-1.5 rounded-xl transition-all">{submitMutation.isPending ? 'در حال ارسال...' : 'ارسال نظر'}</button>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-accent flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {review.author[0]}
                </div>
                <span className="text-xs font-medium text-foreground">{review.author}</span>
              </div>
              <StarRating value={review.rating} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
            <span className="text-[10px] text-muted-foreground/60 mt-1 block">{formatRelativeTime(review.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
