'use client';

import { use3DTilt } from '@/hooks/use3DTilt';

interface Glass3DCardProps {
  children: React.ReactNode;
  className?: string;
  tiltOptions?: {
    maxTilt?: number;
    lerp?: number;
  };
}

export function Glass3DCard({ children, className = '', tiltOptions = {} }: Glass3DCardProps) {
  const { maxTilt = 6, lerp = 0.07 } = tiltOptions;
  const tiltRef = use3DTilt({ maxTilt, lerp });

  return (
    <div ref={tiltRef} className={`glass-3d ${className}`}>
      <div className="glass-3d__inner">
        <div className="glass-3d__spotlight"></div>
        <div className="glass-3d__content">
          {children}
        </div>
      </div>
    </div>
  );
}
