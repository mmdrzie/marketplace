'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ----------------------------------------------------------------
// Smooth Path Generator (Catmull-Rom Spline)
// ----------------------------------------------------------------
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[i] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

// ----------------------------------------------------------------
// 1. Modern Line Chart (Smooth Line + Glow + Area)
// ----------------------------------------------------------------
interface ModernLineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  className?: string;
}

export function ModernLineChart({ data, labels = [], color = 'var(--color-primary)', height = 240, className }: ModernLineChartProps) {
  const uid = useId();
  if (data.length < 2) return null;

  const w = 600;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: pad.left + (i / (data.length - 1)) * cw,
    y: pad.top + ch - ((v - min) / range) * ch,
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${pad.top + ch} L ${points[0].x},${pad.top + ch} Z`;
  const gradId = `line-grad-${uid}`;
  const glowId = `line-glow-${uid}`;

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.left} y1={pad.top + ch - f * ch} x2={w - pad.right} y2={pad.top + ch - f * ch} stroke="var(--color-border)" strokeWidth="1" opacity="0.5" />
        ))}

        <motion.path d={areaPath} fill={`url(#${gradId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          filter={`url(#${glowId})`}
        />

        {points.map((p, i) => (
          <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 + i * 0.05 }} className="group">
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-background)" stroke={color} strokeWidth="2" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
            {labels[i] && <text x={p.x} y={h - 10} textAnchor="middle" className="fill-muted-foreground" fontSize="10">{labels[i]}</text>}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------
// 2. Modern Bar Chart (Thin, Rounded, Gradient)
// ----------------------------------------------------------------
interface ModernBarChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  className?: string;
}

export function ModernBarChart({ data, labels = [], color = 'var(--color-primary)', height = 240, className }: ModernBarChartProps) {
  const uid = useId();
  const w = 600;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const max = Math.max(...data) || 1;
  const barSpace = cw / data.length;
  const barWidth = barSpace * 0.4; 
  const gradId = `bar-grad-${uid}`;

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: height }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.left} y1={pad.top + ch - f * ch} x2={w - pad.right} y2={pad.top + ch - f * ch} stroke="var(--color-border)" strokeWidth="1" opacity="0.5" />
        ))}

        {data.map((v, i) => {
          const barH = (v / max) * ch;
          const x = pad.left + i * barSpace + (barSpace - barWidth) / 2;
          const y = pad.top + ch - barH;
          return (
            <motion.g key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barH} 
                fill={`url(#${gradId})`} 
                rx="4" 
                className="transition-all duration-300 hover:opacity-80" 
                style={{ filter: `drop-shadow(0 0 8px ${color}40)` }} 
              />
              {labels[i] && i % 2 === 0 && (
                <text x={x + barWidth / 2} y={h - 10} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
                  {labels[i]}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------
// 3. Modern Dot Chart (Scatter with Glow)
// ----------------------------------------------------------------
interface ModernDotChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  className?: string;
}

export function ModernDotChart({ data, labels = [], color = 'var(--color-primary)', height = 240, className }: ModernDotChartProps) {
  const uid = useId();
  const w = 600;
  const h = height;
  const pad = { top: 20, right: 20, bottom: 30, left: 40 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  const dotSpace = cw / data.length;
  const glowId = `dot-glow-${uid}`;

  const points = data.map((v, i) => ({
    x: pad.left + i * dotSpace + dotSpace / 2,
    y: pad.top + ch - ((v - min) / range) * ch,
  }));

  return (
    <div className={cn('w-full', className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: height }}>
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.left} y1={pad.top + ch - f * ch} x2={w - pad.right} y2={pad.top + ch - f * ch} stroke="var(--color-border)" strokeWidth="1" opacity="0.5" />
        ))}

        <path 
          d={buildSmoothPath(points)}
          fill="none" 
          stroke={color} 
          strokeWidth="1" 
          opacity="0.2" 
          strokeDasharray="4,4"
        />

        {points.map((p, i) => (
          <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}>
            <circle cx={p.x} cy={p.y} r="6" fill={color} filter={`url(#${glowId})`} className="transition-all duration-300 hover:r-8" />
            {labels[i] && i % 2 === 0 && (
              <text x={p.x} y={h - 10} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
                {labels[i]}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

// ----------------------------------------------------------------
// 4. Watch / Gauge Chart (Semicircle Progress)
// ----------------------------------------------------------------
interface ModernGaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  size?: number;
  className?: string;
}

export function ModernGaugeChart({ value, max = 100, label, color = 'var(--color-primary)', size = 200, className }: ModernGaugeChartProps) {
  const uid = useId();
  const radius = 80;
  const circumference = Math.PI * radius; 
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);
  const glowId = `gauge-glow-${uid}`;

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)} style={{ width: size, height: size / 1.8 }}>
      <svg width={size} height={size / 1.8} viewBox="0 0 200 120">
        <defs>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <path 
          d="M 20 100 A 80 80 0 0 1 180 100" 
          fill="none" 
          stroke="var(--color-border)" 
          strokeWidth="12" 
          strokeLinecap="round" 
          opacity="0.5"
        />
        
        <motion.path 
          d="M 20 100 A 80 80 0 0 1 180 100" 
          fill="none" 
          stroke={color} 
          strokeWidth="12" 
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          filter={`url(#${glowId})`}
        />
      </svg>
      
      <div className="absolute bottom-0 text-center">
        <span className="text-3xl font-bold text-foreground tracking-tighter">{value.toLocaleString('fa-IR')}</span>
        {label && <span className="block text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</span>}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// 5. Mini Sparkline (For small cards)
// ----------------------------------------------------------------
interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export function MiniSparkline({ data, color = 'var(--color-primary)', height = 40, className }: MiniSparklineProps) {
  const uid = useId();
  if (data.length < 2) return null;
  const w = 120;
  const h = height;
  const max = Math.max(...data) || 1;
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => ({ 
    x: (i / (data.length - 1)) * w, 
    y: h - ((v - min) / range) * (h - 4) - 2 
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('w-full', className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`mini-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#mini-${uid})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

// ----------------------------------------------------------------
// 6. Full Price History Chart (Smooth) - Glassmorphism Updated
// ----------------------------------------------------------------
interface PriceHistoryChartProps {
  data: { date: string; price: number }[];
  className?: string;
}

export function PriceHistoryChart({ data, className }: PriceHistoryChartProps) {
  const uid = useId();
  if (data.length < 2) return null;

  const w = 600;
  const h = 240;
  const pad = { top: 24, right: 24, bottom: 36, left: 72 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;

  const prices = data.map((d) => d.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min || 1;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * cw,
    y: pad.top + ch - ((d.price - min) / range) * ch,
    price: d.price,
    date: d.date,
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${pad.top + ch} L ${points[0].x},${pad.top + ch} Z`;
  const gradId = `price-area-${uid}`;
  const glowId = `price-glow-${uid}`;

  return (
    <div className={cn('glass rounded-3xl p-6 border border-border-subtle', className)}>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full"></span>
          تغییرات قیمت
        </h4>
        <span className="text-[11px] text-muted-foreground">
          {data[0].date} — {data[data.length - 1].date}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 260 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = pad.top + ch - frac * ch;
          const val = Math.round(min + frac * range);
          return (
            <g key={frac}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="var(--color-border)" strokeWidth="1" opacity="0.5" />
              <text x={pad.left - 10} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">{val.toLocaleString('fa-IR')}</text>
            </g>
          );
        })}
        
        <motion.path d={areaPath} fill={`url(#${gradId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          filter={`url(#${glowId})`}
        />
        
        {points.map((p, i) => (
          <motion.g key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 + i * 0.06 }} className="group">
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-background)" stroke="var(--color-primary)" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px var(--color-primary))' }} />
            <circle cx={p.x} cy={p.y} r="10" fill="transparent" stroke="var(--color-primary)" strokeWidth="1" className="opacity-0 group-hover:opacity-100 transition-opacity" />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="9" className="fill-foreground opacity-0 group-hover:opacity-100 transition-opacity font-bold">
              {p.price.toLocaleString('fa-IR')}
            </text>
          </motion.g>
        ))}
        
        {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i) => {
          const idx = data.indexOf(d);
          const x = pad.left + (idx / (data.length - 1)) * cw;
          return <text key={i} x={x} y={h - 8} textAnchor="middle" className="fill-muted-foreground" fontSize="8">{d.date}</text>;
        })}
      </svg>
      <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
        <span>کمترین: {min.toLocaleString('fa-IR')} تومان</span>
        <span className={cn('font-bold', prices[prices.length - 1] >= prices[0] ? 'text-success' : 'text-destructive')}>
          {prices[prices.length - 1] >= prices[0] ? '+' : ''}{Math.round(((prices[prices.length - 1] - prices[0]) / prices[0]) * 100)}%
        </span>
        <span>بیشترین: {max.toLocaleString('fa-IR')} تومان</span>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------
// 7. Mini Stat Card with Sparkline - Glassmorphism Updated
// ----------------------------------------------------------------
interface StatChartCardProps {
  title: string;
  value: string;
  trend?: number;
  chartData?: number[];
  color?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatChartCard({ title, value, trend, chartData, color = 'var(--color-primary)', icon, className }: StatChartCardProps) {
  return (
    <div className={cn('glass rounded-3xl p-5 border border-border-subtle relative overflow-hidden group', className)}>
      <div 
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)` }}
      ></div>
      <div className="relative z-10 flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</span>
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M18 15l-6-6-6 6" />
            </svg>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-foreground mb-2 tracking-tighter relative z-10">{value}</div>
      {chartData && <MiniSparkline data={chartData} color={color} height={36} />}
    </div>
  );
}

// ----------------------------------------------------------------
// 8. Mini Donut Chart
// ----------------------------------------------------------------
interface MiniDonutProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  className?: string;
}

export function MiniDonut({ value, max = 100, size = 48, strokeWidth = 4, color = 'var(--color-primary)', label, className }: MiniDonutProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(value / max, 1);
  const offset = circumference * (1 - progress);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border opacity-50" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      {label && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">{label}</span>
      )}
    </div>
  );
}