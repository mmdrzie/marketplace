'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CompatiblePart {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  price: number;
  image: string;
  compatibility: string;
  description: string;
}

interface PartCardProps {
  part: CompatiblePart;
}

const PartCard = memo(function PartCard({ part }: PartCardProps) {
  return (
    <Link href={`/parts/${part.id}`}>
      <div className="glass rounded-2xl p-3 border border-border-subtle hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        <div className="w-full aspect-square bg-surface-2 rounded-xl mb-2.5 flex items-center justify-center overflow-hidden relative">
          {part.image ? (
            <Image src={part.image} alt={part.name} fill sizes="200px" className="object-cover" />
          ) : (
            <svg className="h-8 w-8 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          )}
        </div>
        <span className="inline-block text-[9px] font-bold text-primary tracking-widest uppercase mb-1 bg-primary/10 px-2 py-0.5 rounded-full">
          {part.category}
        </span>
        <h4 className="text-xs font-bold text-foreground leading-tight mb-0.5">{part.name}</h4>
        <p className="text-[10px] text-muted-foreground mb-1.5 line-clamp-1">{part.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-foreground">{part.price.toLocaleString('fa-IR')}<span className="text-[9px] text-muted-foreground font-normal mr-0.5">تومان</span></span>
          <span className="text-[8px] text-muted-foreground" title="مدل‌های سازگار">{part.compatibility}</span>
        </div>
      </div>
    </Link>
  );
});

export { PartCard };
