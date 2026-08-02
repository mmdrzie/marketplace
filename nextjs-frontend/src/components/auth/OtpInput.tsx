'use client';

import { useRef } from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (code: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, disabled, autoFocus }: OtpInputProps) {
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, input: string) => {
    if (!/^\d*$/.test(input)) return;
    const next = [...value];
    next[index] = input.slice(-1);
    onChange(next);
    if (input && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = value.map((_, i) => pasted[i] || '');
    onChange(next);
    const nextEmpty = next.findIndex((c) => !c);
    codeRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { codeRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleCodeChange(i, e.target.value)}
          onKeyDown={(e) => handleCodeKeyDown(i, e)}
          disabled={disabled}
          className="w-12 h-14 text-center text-lg font-bold bg-surface-2 border border-border rounded-xl text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
