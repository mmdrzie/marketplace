'use client';

import { motion } from 'framer-motion';

interface FleetSummaryCardProps {
  label: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: React.ReactNode;
  color?: string;
}

export function FleetSummaryCard({ label, value, change, changePositive, icon, color = 'text-primary' }: FleetSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 border border-border-subtle"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-current/10`}>
          {icon}
        </span>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold ${changePositive ? 'text-success' : 'text-destructive'}`}>
            <svg className={`h-3 w-3 ${changePositive ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6" /></svg>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-black text-foreground">{value}</div>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}
