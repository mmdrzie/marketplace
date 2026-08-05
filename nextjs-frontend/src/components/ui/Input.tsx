'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 appearance-none',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        invalid &&
          'border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
