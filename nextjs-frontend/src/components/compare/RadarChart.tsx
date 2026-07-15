'use client';

import { motion } from 'framer-motion';

interface RadarChartSeries {
  label: string;
  data: number[];
  color: string;
}

interface RadarChartProps {
  series: RadarChartSeries[];
  categories: string[];
  size?: number;
  className?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.sin(angle), y: cy - r * Math.cos(angle) };
}

export function RadarChart({ series, categories, size = 320, className = '' }: RadarChartProps) {
  if (!categories.length || !series.length) return null;

  const padding = 60;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size - padding * 2) / 2;
  const levels = 5;
  const angleStep = (2 * Math.PI) / categories.length;
  const startAngle = -Math.PI / 2;

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (maxR * (l + 1)) / levels;
    const points = categories
      .map((_, i) => {
        const p = polarToCartesian(cx, cy, r, startAngle + angleStep * i);
        return `${p.x},${p.y}`;
      })
      .join(' ');
    return { points, opacity: (l + 1) / levels };
  });

  const axisLines = categories.map((_, i) => {
    const p = polarToCartesian(cx, cy, maxR, startAngle + angleStep * i);
    return { x1: cx, y1: cy, x2: p.x, y2: p.y };
  });

  const labelPositions = categories.map((_, i) => {
    const p = polarToCartesian(cx, cy, maxR + 28, startAngle + angleStep * i);
    return { x: p.x, y: p.y, label: categories[i] };
  });

  const allValues = series.flatMap((s) => s.data);
  const globalMax = Math.max(...allValues, 1);

  const dataPolygons = series.map((s) => {
    const points = s.data
      .map((v, i) => {
        const r = (v / globalMax) * maxR;
        const p = polarToCartesian(cx, cy, r, startAngle + angleStep * i);
        return { x: p.x, y: p.y };
      });
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
    return { label: s.label, color: s.color, pathD, points };
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible w-full max-w-[320px] h-auto">
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`radar-fill-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.05" />
            </linearGradient>
          ))}
        </defs>

        {gridPolygons.map((g, i) => (
          <polygon
            key={i}
            points={g.points}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1 + i * 0.04}
            strokeWidth="0.5"
          />
        ))}

        {axisLines.map((line, i) => (
          <line key={i} {...line} stroke="currentColor" strokeOpacity="0.08" strokeWidth="0.5" />
        ))}

        {dataPolygons.map((poly, i) => (
          <g key={i}>
            <motion.path
              d={poly.pathD}
              fill={`url(#radar-fill-${i})`}
              stroke={poly.color}
              strokeWidth="2"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
            />
            {poly.points.map((pt, j) => (
              <motion.circle
                key={j}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill={poly.color}
                stroke="currentColor"
                strokeWidth="1.5"
                className="stroke-background"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.15 + j * 0.03 }}
              />
            ))}
          </g>
        ))}

        {labelPositions.map((pos, i) => (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.x > cx + 5 ? 'start' : pos.x < cx - 5 ? 'end' : 'middle'}
            dominantBaseline={pos.y > cy + 5 ? 'hanging' : pos.y < cy - 5 ? 'auto' : 'central'}
            className="fill-muted-foreground"
            fontSize="10"
            fontWeight="500"
          >
            {pos.label}
          </text>
        ))}
      </svg>

      {series.length > 1 && (
        <div className="flex items-center gap-4 mt-3" dir="ltr">
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
