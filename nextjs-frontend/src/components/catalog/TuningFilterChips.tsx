'use client';

export interface FilterChip {
  label: string;
  onRemove: () => void;
}

export function TuningFilterChips({ chips }: { chips: FilterChip[] }) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
        >
          {chip.label}
          <button onClick={chip.onRemove} className="hover:text-destructive transition-colors" aria-label="حذف فیلتر">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
}
