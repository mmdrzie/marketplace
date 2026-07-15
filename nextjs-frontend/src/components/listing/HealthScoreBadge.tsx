'use client';

import { memo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-destructive';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'عالی';
  if (score >= 60) return 'خوب';
  if (score >= 40) return 'متوسط';
  return 'نیازمند بررسی';
}

const sizes = {
  sm: { donut: 28, stroke: 3, text: 'text-[8px]', label: 'text-[9px]' },
  md: { donut: 40, stroke: 4, text: 'text-[10px]', label: 'text-xs' },
  lg: { donut: 56, stroke: 5, text: 'text-sm', label: 'text-sm' },
};

const HealthScoreBadge = memo(function HealthScoreBadge({ score, size = 'md', showLabel = true, className }: HealthScoreBadgeProps) {
  const cfg = sizes[size];
  const r = (cfg.donut - cfg.stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (circleRef.current) {
      requestAnimationFrame(() => {
        if (circleRef.current) circleRef.current.style.strokeDashoffset = String(offset);
      });
    }
  }, [offset]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg width={cfg.donut} height={cfg.donut} className="-rotate-90">
          <circle
            cx={cfg.donut / 2} cy={cfg.donut / 2} r={r}
            fill="none" stroke="currentColor" strokeWidth={cfg.stroke}
            className="text-border-subtle"
          />
          <circle ref={circleRef}
            cx={cfg.donut / 2} cy={cfg.donut / 2} r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: circumference, transition: 'stroke-dashoffset 1.2s ease-out' }}
            className={scoreColor(score)}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-black ${scoreColor(score)} ${cfg.text}`}>
          {score}
        </span>
      </div>
      {showLabel && (
        <div>
          <span className={`font-bold ${scoreColor(score)} ${cfg.label}`}>{scoreLabel(score)}</span>
          <span className="block text-[9px] text-muted-foreground">سلامت</span>
        </div>
      )}
    </div>
  );
});

export { HealthScoreBadge };
