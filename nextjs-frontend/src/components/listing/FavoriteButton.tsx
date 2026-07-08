'use client';

import { useState } from 'react';
import { useToggleFavorite } from '@/hooks/useFavorites';
import { toast } from '@/components/common/Toast';

export function FavoriteButton({ listingId, className, size = 'md' }: { listingId: number; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const [isFav, setIsFav] = useState(false);
  const toggleFav = useToggleFavorite();

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !isFav;
    setIsFav(newState);

    toggleFav.mutate(listingId, {
      onSuccess: () => {
        toast({ type: newState ? 'success' : 'info', title: newState ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد' });
      },
      onError: () => {
        setIsFav(!newState);
        toast({ type: 'error', title: 'خطا', message: 'عملیات ناموفق بود' });
      },
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={toggleFav.isPending}
      className={`rounded-xl flex items-center justify-center transition-all duration-200 bg-background/60 border border-border-subtle ${size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} ${isFav ? 'text-destructive border-destructive/40 bg-destructive/10' : 'text-muted-foreground hover:text-destructive hover:border-destructive/30'} ${className || ''}`}
      title={isFav ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      {toggleFav.isPending ? (
        <svg className={`animate-spin ${size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className={size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}
