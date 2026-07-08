'use client';

const BRAND_ORIGIN: Record<string, string> = {
  BMW: 'آلمان', Mercedes: 'آلمان', 'Mercedes-Benz': 'آلمان', آئودی: 'آلمان', Audi: 'آلمان',
  Porsche: 'آلمان', Volkswagen: 'آلمان', Opel: 'آلمان',
  Toyota: 'ژاپن', Honda: 'ژاپن', Nissan: 'ژاپن', Suzuki: 'ژاپن', Mazda: 'ژاپن',
  Lexus: 'ژاپن', Subaru: 'ژاپن', Mitsubishi: 'ژاپن', Daihatsu: 'ژاپن',
  'Hyundai': 'کره جنوبی', 'Kia': 'کره جنوبی', 'SsangYong': 'کره جنوبی', 'Genesis': 'کره جنوبی',
  'BYD': 'چین', 'Chery': 'چین', 'Geely': 'چین', 'Great Wall': 'چین',
  'Ford': 'آمریکا', 'Chevrolet': 'آمریکا', 'Jeep': 'آمریکا', 'Tesla': 'آمریکا',
  'Dodge': 'آمریکا', 'Ram': 'آمریکا', 'Cadillac': 'آمریکا', 'Lincoln': 'آمریکا',
  'Renault': 'فرانسه', 'Peugeot': 'فرانسه', 'Citroën': 'فرانسه', 'Bugatti': 'فرانسه',
  'Fiat': 'ایتالیا', 'Ferrari': 'ایتالیا', 'Lamborghini': 'ایتالیا', 'Maserati': 'ایتالیا',
  'Jaguar': 'انگلستان', 'Land Rover': 'انگلستان', 'Bentley': 'انگلستان', 'Rolls-Royce': 'انگلستان',
  'Volvo': 'سوئد', 'Saab': 'سوئد', 'Dacia': 'رومانی', 'Lada': 'روسیه', 'Tofas': 'ترکیه',
  'Tata': 'هند', 'Mahindra': 'هند',
};

const ORIGIN_COLORS: Record<string, { className: string; style?: React.CSSProperties }> = {
  آلمان: { className: 'text-accent-blue border-accent-blue-border', style: { backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' } },
  ژاپن: { className: 'bg-destructive/10 text-destructive border-destructive/20' },
  'کره جنوبی': { className: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20' },
  چین: { className: 'bg-warning/10 text-warning border-warning/20' },
  آمریکا: { className: 'text-accent-blue border-accent-blue-border', style: { backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' } },
  فرانسه: { className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

interface BrandOriginTagProps {
  brand: string;
  className?: string;
}

export function BrandOriginTag({ brand, className = '' }: BrandOriginTagProps) {
  const origin = Object.entries(BRAND_ORIGIN).find(([key]) =>
    brand.toLowerCase().includes(key.toLowerCase())
  )?.[1];
  if (!origin) return null;

  const colorConfig = ORIGIN_COLORS[origin] || { className: 'bg-surface-2/50 text-muted-foreground border-border' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${colorConfig.className} ${className}`} style={colorConfig.style}>
      {origin}
    </span>
  );
}
