'use client';

import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function OptionCard({ selected, onSelect, title, description, icon, disabled, className }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group relative w-full text-right rounded-xl border p-4 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected
          ? 'border-primary bg-primary/5 shadow-card'
          : 'border-border-subtle bg-surface-2/30 hover:border-primary/30 hover:bg-surface-2/60',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
              selected
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border-subtle bg-surface-2/60 text-muted-foreground group-hover:text-foreground',
            )}
          >
            {icon}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className={cn('block text-sm font-semibold', selected ? 'text-primary' : 'text-foreground')}>
            {title}
          </span>
          {description && (
            <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">{description}</span>
          )}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all',
            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-surface-2/60',
          )}
        >
          {selected && <Check className="h-3 w-3" />}
        </span>
      </span>
    </button>
  );
}
