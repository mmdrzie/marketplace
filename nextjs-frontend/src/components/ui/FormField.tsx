'use client';

import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-destructive mr-1">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
