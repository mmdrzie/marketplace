'use client';

import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  className?: string;
}

export function StarRating({ value, onChange, size = 'sm', count = 5, className }: StarRatingProps) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' };

  return (
    <div className={cn('flex items-center gap-0.5', className)} dir="ltr">
      {Array.from({ length: count }).map((_, i) => {
        const filled = i < value;
        const half = !filled && i < value + 0.5;
        return (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(i + 1)}
            className={cn(
              'transition-all',
              onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={cn(sizes[size], 'transition-colors', filled ? 'text-warning' : half ? 'text-warning/50' : 'text-border-subtle')}
              fill={filled || half ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
