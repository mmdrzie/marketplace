'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CostItem {
  label: string;
  amount: number;
  color: string;
}

interface ImportCostBreakdownProps {
  items: CostItem[];
  total: number;
  className?: string;
}

export function ImportCostBreakdown({ items, total, className = '' }: ImportCostBreakdownProps) {
  if (!items.length || !total) return null;

  const size = 140;
  const strokeWidth = 24;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const nonZeroTotal = items.reduce((s, i) => s + i.amount, 0) || 1;

  const segments = items.map((item, i) => {
    const share = item.amount / nonZeroTotal;
    const cumulativeBefore = items.slice(0, i).reduce((s, it) => s + it.amount, 0);
    const dashOffset = circumference - (cumulativeBefore / nonZeroTotal) * circumference;
    return { ...item, share, dashOffset };
  });

  return (
    <div className={cn('glass rounded-2xl p-5 border border-border-subtle', className)}>
      <h4 className="text-sm font-bold text-foreground mb-4">شکست هزینه واردات</h4>
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            {segments.map((item) => (
              <motion.circle
                key={item.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${item.share * circumference} ${circumference - item.share * circumference}`}
                strokeDashoffset={item.dashOffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: item.dashOffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[18px] font-black text-foreground leading-none">{total.toLocaleString('fa-IR')}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">تومان</p>
            </div>
          </div>
        </div>

        <div className="w-full space-y-2">
          {items.map((item) => {
            const pct = ((item.amount / nonZeroTotal) * 100).toFixed(1);
            return (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">{pct}%</span>
                  <span className="font-bold text-foreground">{item.amount.toLocaleString('fa-IR')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
