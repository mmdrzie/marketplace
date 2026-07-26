export enum PriceType {
  Fixed = 'fixed',
  Negotiable = 'negotiable',
  Auction = 'auction',
}

export function parsePriceType(value: string): PriceType {
  switch (value) {
    case 'fixed': return PriceType.Fixed;
    case 'negotiable': return PriceType.Negotiable;
    case 'auction': return PriceType.Auction;
    default: throw new Error(`Invalid PriceType: ${value}`);
  }
}
