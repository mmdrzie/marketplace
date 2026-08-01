'use client';

import type { ContentType } from '@/types/content';
import { contentTypeThemeColor, difficultyThemeColor } from '@/types/content';

export function ContentTypeBadge({ type }: { type: ContentType }) {
  const c = contentTypeThemeColor(type.slug);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors"
      style={{ backgroundColor: `color-mix(in srgb, ${c} 15%, transparent)`, color: c, borderColor: `color-mix(in srgb, ${c} 30%, transparent)` }}
    >
      {type.label}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const labels: Record<string, string> = { beginner: 'مبتدی', intermediate: 'متوسط', expert: 'پیشرفته' };
  const c = difficultyThemeColor(difficulty);
  return (
    <span
      className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
      style={{ backgroundColor: `color-mix(in srgb, ${c} 10%, transparent)`, color: c, borderColor: `color-mix(in srgb, ${c} 20%, transparent)` }}
    >
      {labels[difficulty] ?? difficulty}
    </span>
  );
}
