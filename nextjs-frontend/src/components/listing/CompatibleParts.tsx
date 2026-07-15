'use client';

import { useParts } from '@/hooks/useParts';
import { PartCard } from './PartCard';

interface CompatiblePartsProps {
  categorySlug?: string | null;
  categoryName?: string;
  limit?: number;
}

const COMPATIBLE_CATEGORIES: Record<string, string[]> = {
  excavator: ['excavator'],
  loader: ['loader'],
  bulldozer: ['bulldozer'],
  crane: ['crane'],
  truck: ['truck'],
  tractor: ['tractor'],
  forklift: ['forklift'],
  'combine-harvester': ['combine-harvester'],
  trailer: ['trailer'],
  pickup: ['pickup'],
  car: ['car', 'sedan'],
  sedan: ['car', 'sedan'],
  motorcycle: ['motorcycle'],
  generator: ['generator'],
  bicycle: ['bicycle'],
};

export function CompatibleParts({ categorySlug, categoryName, limit = 6 }: CompatiblePartsProps) {
  const { data: allParts } = useParts();

  if (!categorySlug) return null;

  const allowed = COMPATIBLE_CATEGORIES[categorySlug];
  if (!allowed) return null;

  const parts = (allParts ?? []).filter((p: { category: string }) => allowed.includes(p.category));
  const displayParts = parts.slice(0, limit);

  if (!displayParts.length) return null;

  return (
    <div className="glass rounded-2xl p-5 border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <h3 className="text-sm font-bold text-foreground">قطعات و ادوات سازگار</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">{categoryName || categorySlug}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayParts.map((part: { id: number; name: string; price: number; image: string; category: string; partNumber: string; inStock: boolean; compatibility: string; description: string }) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
}
