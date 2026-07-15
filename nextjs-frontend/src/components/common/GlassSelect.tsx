'use client';

import { forwardRef, useState, useRef, useEffect, useCallback, useMemo } from 'react';

export interface GlassOption {
  value: string;
  label: string;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: GlassOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const GlassSelect = forwardRef<HTMLDivElement, GlassSelectProps>(function GlassSelect({ value, onChange, options, placeholder = 'انتخاب کنید', disabled, className = '' }, ref) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const innerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const highlightedIndexRef = useRef(highlightedIndex);
  useEffect(() => { highlightedIndexRef.current = highlightedIndex; }, [highlightedIndex]);

  const resolvedRef = (ref ?? innerRef) as React.RefObject<HTMLDivElement | null>;

  const close = useCallback(() => {
    setOpen(false);
    setHighlightedIndex(-1);
    previousActiveElement.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    previousActiveElement.current = document.activeElement as HTMLElement;
    setOpen(true);
    setHighlightedIndex(options.findIndex(o => o.value === value));
  }, [disabled, value, options]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        return;
      }

      if (!options.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, options.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (highlightedIndexRef.current >= 0) {
          onChange(options[highlightedIndexRef.current].value);
          close();
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlightedIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
      } else if (e.key === 'Tab') {
        close();
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (resolvedRef.current && !resolvedRef.current.contains(e.target as Node)) {
        close();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, close, options, onChange, resolvedRef]);

  useEffect(() => {
    if (open && highlightedIndex >= 0) {
      const optionElement = document.getElementById(`option-${highlightedIndex}`);
      optionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedIndex]);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  return (
    <div ref={resolvedRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        id="glass-select-trigger"
        onClick={() => !disabled && openMenu()}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="glass-select-options"
        aria-activedescendant={highlightedIndex >= 0 ? `option-${highlightedIndex}` : undefined}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 glass-input rounded-xl text-sm text-foreground cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            ref={optionsRef}
            id="glass-select-options"
            role="listbox"
            aria-labelledby="glass-select-trigger"
            className="absolute z-50 inset-x-0 top-full mt-1.5 glass rounded-xl border border-border-subtle shadow-2xl overflow-y-auto max-h-60 animate-dropdown scrollbar-dropdown"
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center" role="option" aria-selected={false} aria-disabled="true">موردی یافت نشد</div>
            ) : (
              options.map((option, index) => (
                <button
                  key={option.value}
                  id={`option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => { onChange(option.value); close(); }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-right transition-colors duration-150 ${
                    option.value === value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-surface-2'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    option.value === value ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {option.value === value && (
                      <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  {option.label}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
});