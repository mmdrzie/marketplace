'use client';

import { motion } from 'framer-motion';

interface FuelDataPoint {
  month: string;
  consumption: number;
  cost: number;
}

interface FuelChartProps {
  data: FuelDataPoint[];
  className?: string;
}

export function FuelChart({ data, className = '' }: FuelChartProps) {
  if (!data.length) return null;

  const maxConsumption = Math.max(...data.map((d) => d.consumption), 1);

  return (
    <div className={`glass rounded-2xl p-5 border border-border-subtle ${className}`}>
      <h4 className="text-sm font-bold text-foreground mb-4">مصرف سوخت (ماهانه)</h4>
      <div className="flex items-end gap-3 h-36">
        {data.map((d, i) => {
          const h = (d.consumption / maxConsumption) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground">{d.consumption.toLocaleString('fa-IR')}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, 3)}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: 'easeOut' }}
                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-full"
                style={{ minHeight: 4 }}
              />
              <span className="text-[9px] text-muted-foreground">{d.month}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
        <span>میانگین: {Math.round(data.reduce((s, d) => s + d.consumption, 0) / data.filter((d) => d.consumption > 0).length || 1).toLocaleString('fa-IR')} لیتر</span>
        <span>مجموع: {data.reduce((s, d) => s + d.cost, 0).toLocaleString('fa-IR')} تومان</span>
      </div>
    </div>
  );
}
