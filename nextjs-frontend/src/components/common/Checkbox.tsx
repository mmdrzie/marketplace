'use client';

import { InputHTMLAttributes, useId } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export function Checkbox({ id, className, label, ...props }: CheckboxProps) {
  const uid = useId();
  const checkboxId = id || uid;

  return (
    <label htmlFor={checkboxId} className={`cbx-wrapper inline-flex items-center gap-3 cursor-pointer select-none ${className ?? ''}`}>
      <div className="relative">
        <input type="checkbox" id={checkboxId} className="peer sr-only" {...props} />
        <div className="cbx-check">
          <svg viewBox="0 0 24 24">
            <path d="M3 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9-9-4.03-9-9z" />
            <polyline points="8 12 11 15 16 9" />
          </svg>
        </div>
      </div>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
