'use client';

const COUNTRY_FLAGS: Record<string, string> = {
  آلمان: 'M4 15c2-2 4-4 8-4s6 2 8 4M4 9c2-2 4-4 8-4s6 2 8 4M4 21c4-3 8-5 12-5s4 2 4 2M4 3c4 3 8 5 12 5s4-2 4-2',
  ژاپن: 'M4 15c2-1 5-2 8-2s6 1 8 2M4 9c2-1 5-2 8-2s6 1 8 2M4 21c3-2 6-3 10-3s6 1 6 3M4 3c3 2 6 3 10 3s6-1 6-3',
  'کره جنوبی': 'M4 15c3-1 6-2 10-2s4 1 4 2M4 9c3-1 6-2 10-2s4 1 4 2M4 21c4-2 8-3 12-3s4 2 4 2M4 3c4 2 8 3 12 3s4-2 4-2',
  چین: 'M4 15c2 0 5-2 8-2s6 2 8 2M4 9c2 0 5-2 8-2s6 2 8 2M4 21c3-1 7-2 10-2s7 1 10 2M4 3c3 1 7 2 10 2s7-1 10-2',
  آمریکا: 'M4 15c3 1 6 0 8 0s5 1 8 0M4 9c3-1 6 0 8 0s5-1 8 0M4 21c4 0 8-2 12-2s4 2 4 2M4 3c4 0 8 2 12 2s4-2 4-2',
  فرانسه: 'M4 15c4-1 7 0 10 0s6-1 6 0M4 9c4 1 7 0 10 0s6 1 6 0M4 21c5-1 9-1 14-1M4 3c5 1 9 1 14 1',
  ایتالیا: 'M4 15c5-1 8 0 12 0s4-1 4 0M4 9c5 1 8 0 12 0s4 1 4 0M4 21c6-1 10-1 16-1M4 3c6 1 10 1 16 1',
  انگلستان: 'M4 15c3 0 6-1 8-1s5 1 8 1M4 9c3 0 6 1 8 1s5-1 8-1M4 21c4-1 8-1 12-1s4 1 4 1M4 3c4 1 8 1 12 1s4-1 4-1',
  سوئد: 'M4 15c3-1 7 0 10 0s3-1 3 0M4 9c3 1 7 0 10 0s3 1 3 0M4 21c5 0 9-1 14-1M4 3c5 0 9 1 14 1',
  رومانی: 'M4 16c2-1 6 0 8 0s2-1 4 0M4 10c2 1 6 0 8 0s2 1 4 0M4 22c3 0 7-1 10-1s3 1 3 1M4 4c3 0 7 1 10 1s3-1 3-1',
  روسیه: 'M4 15c3-1 6 0 9 0s5-1 8 0M4 9c3 1 6 0 9 0s5 1 8 0M4 21c4-1 8-1 12-1s4 2 4 2M4 3c4 1 8 1 12 1s4-2 4-2',
  ترکیه: 'M4 15c3 0 5-1 8-1s5 1 8 1M4 9c3 0 5 1 8 1s5-1 8-1M4 21c4 0 8-1 12-1s4 1 4 1M4 3c4 0 8 1 12 1s4-1 4-1',
  هند: 'M4 15c3-1 6 0 9 0s5-2 8-1M4 9c3 1 6 0 9 0s5 2 8 1M4 21c5 0 8-1 12-1s5 1 5 1M4 3c5 0 8 1 12 1s5-1 5-1',
};

const COUNTRY_COLORS: Record<string, [string, string]> = {
  آلمان: ['#DD0000', '#FFCE00'],
  ژاپن: ['#BC002D', '#ffffff'],
  'کره جنوبی': ['#003478', '#ffffff'],
  چین: ['#DE2910', '#FFDE00'],
  آمریکا: ['#B22234', '#ffffff'],
  فرانسه: ['#002395', '#ffffff'],
  ایتالIA: ['#009246', '#ffffff'],
  انگلستان: ['#C8102E', '#ffffff'],
  سوئد: ['#005B99', '#FECC02'],
  رومانی: ['#002B7F', '#FCD116'],
  روسیه: ['#D52B1E', '#ffffff'],
  ترکیه: ['#E30A17', '#ffffff'],
  هند: ['#FF9933', '#ffffff'],
};

interface CountryFlagIconProps {
  country: string;
  size?: number;
  className?: string;
}

export function CountryFlagIcon({ country, size = 20, className = '' }: CountryFlagIconProps) {
  const path = COUNTRY_FLAGS[country];
  const colors = COUNTRY_COLORS[country] || ['#666', '#999'];
  if (!path) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="12" r="10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <text x="12" y="15" textAnchor="middle" fontSize="10" fill="#64748b">?</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id={`flag-${country}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[0]} />
        </linearGradient>
      </defs>
      <rect x="2" y="3" width="20" height="18" rx="2" fill={`url(#flag-${country})`} />
      <path d={path} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
    </svg>
  );
}
