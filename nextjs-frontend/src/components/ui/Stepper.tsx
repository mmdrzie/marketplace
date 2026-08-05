'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cn('flex items-center w-full', className)} aria-label="مراحل ثبت‌نام">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <span className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active && 'border-primary bg-primary/10 text-primary ring-4 ring-primary/10',
                  !done && !active && 'border-border bg-surface-2/40 text-muted-foreground',
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-[11px] whitespace-nowrap',
                  active ? 'text-foreground font-medium' : done ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn('mx-2 mb-5 h-px flex-1 transition-colors duration-300', i < current ? 'bg-primary/60' : 'bg-border')}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
