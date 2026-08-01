'use client';

import { forwardRef, useState, useRef, useEffect, useCallback, useMemo, useId } from 'react';

export interface SearchableOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
}

export const SearchableSelect = forwardRef<HTMLDivElement, SearchableSelectProps>(function SearchableSelect({
  value, onChange, options, placeholder = 'انتخاب کنید', disabled, className = '', searchPlaceholder = 'جستجو...',
}, ref) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const innerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const baseId = useId();

  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const highlightedIndexRef = useRef(highlightedIndex);
  useEffect(() => { highlightedIndexRef.current = highlightedIndex; }, [highlightedIndex]);
  useEffect(() => { setHighlightedIndex(-1); }, [query]);

  const resolvedRef = (ref ?? innerRef) as React.RefObject<HTMLDivElement | null>;

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHighlightedIndex(-1);
    previousActiveElement.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    if (disabled) return;
    previousActiveElement.current = document.activeElement as HTMLElement;
    setOpen(true);
    setQuery('');
    setHighlightedIndex(-1);
  }, [disabled]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return; }
      if (!filtered.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndexRef.current >= 0 && highlightedIndexRef.current < filtered.length) {
          onChange(filtered[highlightedIndexRef.current].value);
          close();
        }
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
  }, [open, close, filtered, onChange, resolvedRef]);

  useEffect(() => {
    if (open && highlightedIndex >= 0) {
      const el = document.getElementById(`${baseId}-option-${highlightedIndex}`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, highlightedIndex, baseId, filtered.length]);

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  return (
    <div ref={resolvedRef} className={`relative ${className}`}>
      <button
        type="button"
        id={`${baseId}-trigger`}
        onClick={openMenu}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${baseId}-options`}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 glass-input rounded-xl text-sm text-foreground cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
      >
        <span className={`truncate ${selected ? 'text-foreground' : 'text-muted-foreground'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} />
          <div
            id={`${baseId}-options`}
            role="listbox"
            aria-labelledby={`${baseId}-trigger`}
            className="absolute z-50 inset-x-0 top-full mt-1.5 glass rounded-xl border border-border-subtle shadow-2xl overflow-hidden animate-dropdown"
          >
            {/* Search input */}
            <div className="p-2 border-b border-border/50">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2/50 border border-border focus-within:border-primary/40 transition-colors">
                <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.34-4.34" /></svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                  onKeyDown={(e) => { if (e.key === ' ') e.stopPropagation(); }}
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="overflow-y-auto max-h-52 scrollbar-dropdown">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground text-center">موردی یافت نشد</div>
              ) : (
                filtered.map((option, index) => (
                  <button
                    key={option.value}
                    id={`${baseId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => { onChange(option.value); close(); }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-right transition-colors duration-150 ${
                      option.value === value
                        ? 'bg-primary/10 text-primary font-medium'
                        : highlightedIndex === index
                          ? 'bg-surface-2 text-foreground'
                          : 'text-foreground hover:bg-surface-2'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      option.value === value ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {option.value === value && (
                        <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
