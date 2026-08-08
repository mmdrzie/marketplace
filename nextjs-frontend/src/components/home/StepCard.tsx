'use client';

import { use3DTilt } from '@/hooks/use3DTilt';

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

export function StepCard({ icon, title, description, index }: StepCardProps) {
  const tiltRef = use3DTilt({ maxTilt: 8, lerp: 0.08 });

  return (
    <div ref={tiltRef} className="glass-3d">
      <div className="glass-3d__inner">
        <div className="glass-3d__spotlight"></div>
        <div className="glass-3d__content flex flex-col items-center text-center p-6">
          <div className="relative z-10 w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary mb-5">
            {icon}
            <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {(index + 1).toLocaleString('fa-IR')}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{description}</p>
        </div>
      </div>
    </div>
  );
}
