'use client';

import { useState, useMemo } from 'react';
import type { Message } from '@/types/listing';

export function MessageSearch({
  messages = [],
  onJumpTo,
  onClose,
}: {
  messages?: Message[];
  onJumpTo?: (id: number) => void;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return messages.filter((m) =>
      m.body?.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, messages]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در پیام‌ها..."
            className="w-full pr-9 pl-3 py-2 glass-input rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoFocus
          />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            بستن
          </button>
        )}
      </div>
      {results.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-border-subtle bg-surface p-1">
          {results.map((m) => (
            <button
              key={m.id}
              onClick={() => onJumpTo?.(m.id)}
              className="w-full text-right px-3 py-2 rounded-lg text-xs text-foreground hover:bg-surface-2 transition-colors"
            >
              {m.body}
            </button>
          ))}
        </div>
      )}
      {query && results.length === 0 && (
        <p className="text-xs text-muted-foreground px-2 py-1">نتیجه‌ای یافت نشد</p>
      )}
    </div>
  );
}
