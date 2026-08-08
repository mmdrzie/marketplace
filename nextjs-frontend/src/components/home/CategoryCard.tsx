'use client';

import { use3DTilt } from '@/hooks/use3DTilt';

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}

export function CategoryCard({ icon, title, onClick }: CategoryCardProps) {
  const tiltRef = use3DTilt({ maxTilt: 8, lerp: 0.08 });

  return (
    <div ref={tiltRef} className="cat-card glass-3d h-full">
      <div className="glass-3d__inner">
        <div className="glass-3d__spotlight"></div>
        <button type="button" className="cat-card__btn glass-3d__content" onClick={onClick}>
          <span className="cat-card__accent" aria-hidden="true" />
          <span className="cat-card__icon">
            {icon}
          </span>
          <span className="cat-card__title">{title}</span>
        </button>
      </div>
    </div>
  );
}
