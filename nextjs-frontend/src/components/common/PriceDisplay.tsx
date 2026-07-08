'use client';

import { formatPriceWithUnit } from '@/lib/utils';

interface PriceDisplayProps {
  price: number | null;
  priceType?: string;
}

export function PriceDisplay({ price, priceType = 'fixed' }: PriceDisplayProps) {
  return (
    <span className="font-semibold">
      {formatPriceWithUnit(price, priceType)}
    </span>
  );
}
