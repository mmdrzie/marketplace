export function generatePriceSeries(base: number, months: number, options?: { volatility?: number; trend?: number; seed?: number }): number[] {
  const { volatility = 0.08, trend = 0.025 } = options || {};
  const series: number[] = [];
  let val = base;

  for (let i = 0; i < months; i++) {
    const noise = (Math.random() - 0.5) * 2 * volatility * base;
    const drift = trend * base;
    const spike = Math.random() < 0.08 ? base * (Math.random() * 0.12 + 0.08) * (Math.random() > 0.5 ? 1 : -1) : 0;
    val = Math.max(base * 0.5, val + drift + noise + spike);
    series.push(Math.round(val));
  }

  return series;
}

export function generateVolumeSeries(base: number, months: number, options?: { volatility?: number; seasonality?: boolean }): number[] {
  const { volatility = 0.2, seasonality = true } = options || {};
  return Array.from({ length: months }, (_, i) => {
    const noise = (Math.random() - 0.5) * 2 * volatility * base;
    const seasonal = seasonality ? Math.sin((i / months) * Math.PI * 2) * base * 0.1 : 0;
    const weekendDip = Math.random() < 0.15 ? -base * (Math.random() * 0.25 + 0.1) : 0;
    return Math.max(1, Math.round(base + noise + seasonal + weekendDip));
  });
}

export function generateViewsSeries(base: number, days: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    const weekendFactor = (i % 7 === 5 || i % 7 === 6) ? 0.4 : 1;
    const noise = (Math.random() - 0.5) * 2 * 0.3 * base;
    const trend = (i / days) * base * 0.15;
    const spike = Math.random() < 0.05 ? base * (Math.random() * 0.5 + 0.3) : 0;
    return Math.max(1, Math.round((base + noise + trend + spike) * weekendFactor));
  });
}

export function generateMessagesSeries(base: number, days: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    const weekendFactor = (i % 7 === 5 || i % 7 === 6) ? 0.3 : 1;
    const noise = Math.random() * base * 0.6;
    const spike = Math.random() < 0.05 ? base * (Math.random() * 0.8 + 0.2) : 0;
    const val = (base * 0.1 + noise + spike) * weekendFactor;
    return Math.max(0, Math.round(val));
  });
}

export function generatePriceHistory(startPrice: number, months: number, label: string): { date: string; price: number }[] {
  const prices = generatePriceSeries(startPrice, months, { volatility: 0.06, trend: -0.008 });
  const persianMonths = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  return prices.map((p, i) => ({
    date: `${label || ''} ${persianMonths[(6 + i) % 12].slice(0, 4)}`,
    price: p,
  }));
}
