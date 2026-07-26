'use client';

import { LiquidMetalButton } from '@/components/ui/liquid-metal-button';

interface FilterButtonProps {
  onClick: () => void;
  count: number;
  className?: string;
}

export function FilterButton({ onClick, count, className = '' }: FilterButtonProps) {
  return (
    <div className={className}>
      <LiquidMetalButton
        label="فیلترها"
        onClick={onClick}
        viewMode="text"
        count={count}
      />
    </div>
  );
}
