'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface OtpFieldProps {
  value: string[];
  onChange: (code: string[]) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  length?: number;
  className?: string;
}

export function OtpField({
  value,
  onChange,
  onComplete,
  disabled,
  autoFocus,
  invalid,
  length = 6,
  className,
}: OtpFieldProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, input: string) => {
    if (!/^\d*$/.test(input)) return;
    const next = [...value];
    next[index] = input.slice(-1);
    onChange(next);
    if (input && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
    if (next.every((c) => c !== '')) {
      onComplete?.(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = value.map((_, i) => pasted[i] || '');
    onChange(next);
    const nextEmpty = next.findIndex((c) => !c);
    refs.current[nextEmpty === -1 ? length - 1 : nextEmpty]?.focus();
    if (next.every((c) => c !== '')) {
      onComplete?.(next.join(''));
    }
  };

  return (
    <div className={cn('flex gap-2 justify-center', className)} dir="ltr" onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={value[i] ?? ''}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          aria-label={`رقم ${i + 1} کد تایید`}
          aria-invalid={invalid || undefined}
          className={cn(
            'w-12 h-14 text-center text-lg font-bold bg-surface-2 border border-border rounded-xl text-foreground transition-all',
            'focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none',
            'disabled:opacity-50',
            invalid && 'border-destructive/50 focus:border-destructive/50 focus:ring-destructive/20',
          )}
        />
      ))}
    </div>
  );
}
