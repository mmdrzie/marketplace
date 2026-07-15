'use client';

import { memo } from 'react';
import { formatPriceWithUnit } from '@/lib/utils';

interface PriceDisplayProps {
  price: number | null;
  priceType?: string;
}

export const PriceDisplay = memo(function PriceDisplay({ price, priceType = 'fixed' }: PriceDisplayProps) {
  return (
    <span className="font-semibold tabular-nums">
      {formatPriceWithUnit(price, priceType)}
    </span>
  );
});
