'use client';

import { GlassSelect } from '@/components/common/GlassSelect';

const SORT_OPTIONS = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'price_asc', label: 'ارزان‌ترین' },
  { value: 'price_desc', label: 'گران‌ترین' },
  { value: 'most_viewed', label: 'پربازدیدترین' },
];

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative inline-block w-full sm:w-auto">
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center z-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M7 12h10M11 18h2" />
        </svg>
      </span>
      <GlassSelect value={value} onChange={onChange} options={SORT_OPTIONS} className="w-full sm:w-44" />
    </div>
  );
}