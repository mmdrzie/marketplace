'use client';

import { use3DTilt } from '@/hooks/use3DTilt';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  size?: string;
}

export function FeatureCard({ icon, title, description, index, size = '' }: FeatureCardProps) {
  const tiltRef = use3DTilt({ maxTilt: 6, lerp: 0.07 });

  return (
    <div ref={tiltRef} className={`glass-3d ${size}`}>
      <div className="glass-3d__inner">
        <div className="glass-3d__spotlight"></div>
        <div className="glass-3d__content flex flex-col h-full p-6">
          <span className="absolute top-5 left-5 text-4xl font-black text-foreground/[0.03] select-none">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-5 transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)]">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
