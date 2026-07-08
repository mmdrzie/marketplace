import { describe, it, expect } from 'vitest';
import { cn, formatPrice, formatPriceWithUnit, formatDate, formatRelativeTime, toPersianNumber, throttle } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});

describe('formatPrice', () => {
  it('returns توافقی for null', () => {
    expect(formatPrice(null)).toBe('توافقی');
  });

  it('converts to tomans and formats', () => {
    const result = formatPrice(150000);
    expect(result).toContain('تومان');
    expect(result).not.toContain('15000');
  });
});

describe('formatPriceWithUnit', () => {
  it('returns رایگان for free type', () => {
    expect(formatPriceWithUnit(null, 'free')).toBe('رایگان');
  });

  it('returns توافقی for null price', () => {
    expect(formatPriceWithUnit(null, 'paid')).toBe('توافقی');
  });

  it('delegates to formatPrice otherwise', () => {
    const result = formatPriceWithUnit(200000, 'paid');
    expect(result).toContain('تومان');
  });
});

describe('formatDate', () => {
  it('returns dash for null/undefined', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
  });

  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15T10:00:00Z');
    expect(result).not.toBe('-');
    expect(typeof result).toBe('string');
  });
});

describe('formatRelativeTime', () => {
  it('returns empty for null/undefined', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime(undefined)).toBe('');
  });

  it('returns همین حالا for very recent dates', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe('همین حالا');
  });

  it('returns minutes for recent dates', () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toContain('دقیقه');
  });

  it('returns hours for older dates', () => {
    const past = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(formatRelativeTime(past)).toContain('ساعت');
  });

  it('returns days for even older dates', () => {
    const past = new Date(Date.now() - 10 * 86400 * 1000).toISOString();
    expect(formatRelativeTime(past)).toContain('روز');
  });
});

describe('toPersianNumber', () => {
  it('converts English digits to Persian', () => {
    expect(toPersianNumber('123')).toBe('۱۲۳');
  });

  it('handles numbers', () => {
    expect(toPersianNumber(456)).toBe('۴۵۶');
  });

  it('leaves non-digit characters untouched', () => {
    expect(toPersianNumber('شماره 1')).toBe('شماره ۱');
  });
});

describe('throttle', () => {
  it('only calls function once within delay', () => {
    let count = 0;
    const fn = () => { count++; };
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(count).toBe(1);
  });
});
