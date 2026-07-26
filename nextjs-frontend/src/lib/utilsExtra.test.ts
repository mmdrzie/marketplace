import { describe, it, expect } from 'vitest';
import { formatPrice, formatPriceWithUnit, formatRelativeTime, toPersianNumber } from '@/lib/utils';

describe('utils.formatPrice (related to 1.16 helpers)', () => {
  it('returns توافقی for null price', () => {
    expect(formatPrice(null)).toBe('توافقی');
  });

  it('formats a numeric price in toman', () => {
    const res = formatPrice(1000000);
    expect(res).toContain('تومان');
    expect(res).not.toContain('1000000');
  });

  it('formatPriceWithUnit returns رایگان for free type', () => {
    expect(formatPriceWithUnit(0, 'free')).toBe('رایگان');
  });

  it('formatPriceWithUnit returns توافقی for null paid price', () => {
    expect(formatPriceWithUnit(null, 'paid')).toBe('توافقی');
  });
});

describe('utils.formatRelativeTime', () => {
  it('returns همین حالا for the current moment', () => {
    expect(formatRelativeTime(new Date().toISOString())).toBe('همین حالا');
  });

  it('returns minutes ago for recent dates', () => {
    const past = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toContain('دقیقه');
  });

  it('returns days ago for older dates', () => {
    const past = new Date(Date.now() - 5 * 86400 * 1000).toISOString();
    expect(formatRelativeTime(past)).toContain('روز');
  });

  it('returns empty string for null', () => {
    expect(formatRelativeTime(null)).toBe('');
  });
});

describe('utils.toPersianNumber', () => {
  it('converts latin digits to persian', () => {
    expect(toPersianNumber('12345')).toBe('۱۲۳۴۵');
  });
});
