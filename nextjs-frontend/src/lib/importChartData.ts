import { generatePriceSeries, generateVolumeSeries } from './chartData';

const BRAND_BASE_PRICES: Record<string, number> = {
  BMW: 9500, Toyota: 7200, Hyundai: 4200, Mercedes: 11000,
  Porsche: 18000, Kia: 3800, Nissan: 6500, 'Range Rover': 22000,
  Audi: 12000, Lexus: 14000,
};

export function generateImportPriceTrend(brand?: string): { date: string; price: number }[] {
  const base = (brand && BRAND_BASE_PRICES[brand]) || 8000;
  const prices = generatePriceSeries(base, 12, { volatility: 0.09, trend: 0.04 });
  const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  return prices.map((p, i) => ({
    date: persianMonths[(3 + i) % 12],
    price: p * 1000,
  }));
}

export function generateCountryShare(): { country: string; share: number; volume: number; color: string }[] {
  const raw = [
    { country: 'آلمان', share: 28, color: 'var(--color-accent-blue)' },
    { country: 'ژاپن', share: 22, color: 'var(--color-accent-indigo)' },
    { country: 'کره جنوبی', share: 18, color: 'var(--color-success)' },
    { country: 'چین', share: 12, color: 'var(--color-warning)' },
    { country: 'آمریکا', share: 8, color: 'var(--color-destructive)' },
    { country: 'فرانسه', share: 5, color: 'color-mix(in srgb, var(--color-warning), var(--color-destructive))' },
    { country: 'ایتالیا', share: 4, color: 'color-mix(in srgb, var(--color-accent-indigo), var(--color-accent-blue))' },
    { country: 'سایر', share: 3, color: 'var(--color-muted-foreground)' },
  ];
  return raw.map((r) => ({
    ...r,
    volume: Math.round(r.share * (110 + Math.random() * 40)),
  }));
}

export function generateCustomsVolumeByMonth(): { month: string; volume: number; revenue: number }[] {
  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const volumes = generateVolumeSeries(2800, 12, { volatility: 0.22, seasonality: true });
  return volumes.map((v, i) => ({
    month: months[i],
    volume: v,
    revenue: Math.round(v * (420 + Math.random() * 80)),
  }));
}

export function generateSegmentDistribution(): { segment: string; percentage: number; color: string }[] {
  return [
    { segment: 'SUV', percentage: 34, color: 'var(--color-accent-blue)' },
    { segment: 'سدان', percentage: 28, color: 'var(--color-accent-indigo)' },
    { segment: 'کوپه', percentage: 12, color: 'var(--color-success)' },
    { segment: 'هاچبک', percentage: 10, color: 'var(--color-warning)' },
    { segment: 'پیکاپ', percentage: 8, color: 'color-mix(in srgb, var(--color-warning), var(--color-destructive))' },
    { segment: 'مینی‌ون', percentage: 5, color: 'var(--color-destructive)' },
    { segment: 'کروک', percentage: 3, color: 'color-mix(in srgb, var(--color-accent-indigo), var(--color-accent-blue))' },
  ];
}

export function generateTopModels(n: number = 10): { model: string; count: number; avgPrice: number }[] {
  const all = [
    { model: 'Toyota Camry', count: 420, avgPrice: 7500 },
    { model: 'Hyundai Santa Fe', count: 380, avgPrice: 4600 },
    { model: 'BMW X5', count: 310, avgPrice: 10800 },
    { model: 'Kia Sportage', count: 290, avgPrice: 4100 },
    { model: 'Mercedes-Benz GLE', count: 250, avgPrice: 12500 },
    { model: 'Nissan Qashqai', count: 220, avgPrice: 5800 },
    { model: 'Toyota RAV4', count: 210, avgPrice: 6800 },
    { model: 'Hyundai Tucson', count: 190, avgPrice: 4400 },
    { model: 'BMW X3', count: 170, avgPrice: 9200 },
    { model: 'Porsche Cayenne', count: 140, avgPrice: 16000 },
    { model: 'Audi Q5', count: 120, avgPrice: 11000 },
    { model: 'Lexus NX', count: 100, avgPrice: 9800 },
  ];
  return all.slice(0, n).map((m) => ({
    ...m,
    count: Math.round(m.count * (0.85 + Math.random() * 0.3)),
    avgPrice: Math.round(m.avgPrice * (0.9 + Math.random() * 0.2)),
  }));
}

export function generateImportForecast(): { year: string; volume: number; lower: number; upper: number }[] {
  const base = 18000;
  return Array.from({ length: 5 }, (_, i) => {
    const year = 1404 + i;
    const growth = 1 + 0.08 * i + (Math.random() - 0.5) * 0.1;
    const volume = Math.round(base * growth);
    const band = Math.round(volume * (0.15 + Math.random() * 0.1));
    return { year: `${year}`, volume, lower: volume - band, upper: volume + band };
  });
}
