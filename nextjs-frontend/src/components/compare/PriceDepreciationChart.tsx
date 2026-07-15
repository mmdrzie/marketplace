'use client';

import { motion } from 'framer-motion';

interface DepreciationItem {
  id: string | number;
  title: string;
  price: number;
  color: string;
}

const MONTHS = ['ماه ۱', 'ماه ۱۲', 'ماه ۲۴', 'ماه ۳۶', 'ماه ۴۸', 'ماه ۶۰'];

function simulateDepreciation(price: number): number[] {
  const rates = [1, 0.88, 0.78, 0.70, 0.63, 0.58];
  return rates.map((r) => Math.round(price * r));
}

interface PriceDepreciationChartProps {
  items: DepreciationItem[];
  className?: string;
}

export function PriceDepreciationChart({ items, className = '' }: PriceDepreciationChartProps) {
  if (items.length < 2) return null;

  const allCurves = items.map((item) => ({
    label: item.title,
    color: item.color,
    values: simulateDepreciation(item.price),
  }));

  const w = 600;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 65 };

  const allValues = allCurves.flatMap((c) => c.values);
  const max = Math.max(...allValues, 1);
  const min = 0;
  const range = max - min || 1;

  function xPos(i: number) {
    return pad.left + (i / (MONTHS.length - 1)) * (w - pad.left - pad.right);
  }

  function yPos(val: number) {
    return pad.top + (h - pad.top - pad.bottom) - ((val - min) / range) * (h - pad.top - pad.bottom);
  }

  return (
    <div className={`glass rounded-2xl p-5 border border-border-subtle ${className}`}>
      <h4 className="text-sm font-bold text-foreground mb-4">پیش‌بینی استهلاک قیمت (۵ ساله)</h4>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 220 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = pad.top + (h - pad.top - pad.bottom) - frac * (h - pad.top - pad.bottom);
          const val = Math.round(min + frac * range);
          return (
            <g key={frac}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="currentColor" className="text-border-subtle" strokeWidth="0.5" strokeDasharray="4,4" />
              <text x={pad.left - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">
                {val.toLocaleString('fa-IR')}
              </text>
            </g>
          );
        })}

        {MONTHS.map((m, i) => (
          <text key={i} x={xPos(i)} y={h - 5} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
            {m}
          </text>
        ))}

        {allCurves.map((curve, ci) => {
          const pts = curve.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
          const areaPts = `${pts} L${xPos(curve.values.length - 1)},${yPos(0)} L${xPos(0)},${yPos(0)} Z`;
          return (
            <g key={ci}>
              <motion.path
                d={areaPts}
                fill={curve.color}
                fillOpacity="0.08"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <motion.path
                d={`M${pts}`}
                fill="none"
                stroke={curve.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: ci * 0.15 }}
              />
              {curve.values.map((v, i) => (
                <motion.circle
                  key={i}
                  cx={xPos(i)}
                  cy={yPos(v)}
                  r="3"
                  fill={curve.color}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + ci * 0.15 + i * 0.05 }}
                />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-3" dir="ltr">
        {allCurves.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: c.color }} />
            <span className="text-[11px] text-muted-foreground">{c.label.length > 18 ? c.label.slice(0, 18) + '...' : c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
