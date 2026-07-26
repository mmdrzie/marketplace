import { describe, it, expect } from 'vitest';
import { Money } from '../../src/domain/entities/value-objects/Money.js';
import { Slug } from '../../src/domain/entities/value-objects/Slug.js';
import { ListingStatus, parseListingStatus, canTransition } from '../../src/domain/entities/value-objects/ListingStatus.js';
import { PriceType, parsePriceType } from '../../src/domain/entities/value-objects/PriceType.js';

describe('Money', () => {
  it('creates from toman', () => {
    const m = Money.fromToman(100000);
    expect(m.amount).toBe(100000);
  });

  it('rejects negative', () => {
    expect(() => Money.fromToman(-1)).toThrow('negative');
  });

  it('adds correctly', () => {
    const a = Money.fromToman(1000);
    const b = Money.fromToman(2000);
    expect(a.add(b).amount).toBe(3000);
  });

  it('zero check', () => {
    expect(Money.zero().isZero()).toBe(true);
  });

  it('rounds to integer', () => {
    expect(Money.fromToman(1000.7).amount).toBe(1001);
  });
});

describe('Slug', () => {
  it('generates from text', () => {
    expect(Slug.generate('Hello World').value).toBe('hello-world');
  });

  it('falls back to untitled for non-ASCII text', () => {
    expect(Slug.generate('پراید ۱۱۱').value).toBe('untitled');
  });

  it('rejects invalid', () => {
    expect(() => Slug.from('UPPERCASE')).toThrow('Invalid slug');
  });

  it('accepts valid', () => {
    expect(Slug.from('peugeot-206').value).toBe('peugeot-206');
  });
});

describe('ListingStatus', () => {
  it('parses valid statuses', () => {
    expect(parseListingStatus('draft')).toBe(ListingStatus.Draft);
    expect(parseListingStatus('pending')).toBe(ListingStatus.Pending);
    expect(parseListingStatus('published')).toBe(ListingStatus.Published);
    expect(parseListingStatus('rejected')).toBe(ListingStatus.Rejected);
    expect(parseListingStatus('sold')).toBe(ListingStatus.Sold);
    expect(parseListingStatus('archived')).toBe(ListingStatus.Archived);
  });

  it('rejects invalid', () => {
    expect(() => parseListingStatus('invalid')).toThrow();
  });

  it('allows valid transitions', () => {
    expect(canTransition(ListingStatus.Draft, ListingStatus.Pending)).toBe(true);
    expect(canTransition(ListingStatus.Draft, ListingStatus.Archived)).toBe(true);
    expect(canTransition(ListingStatus.Pending, ListingStatus.Published)).toBe(true);
    expect(canTransition(ListingStatus.Pending, ListingStatus.Rejected)).toBe(true);
    expect(canTransition(ListingStatus.Published, ListingStatus.Sold)).toBe(true);
    expect(canTransition(ListingStatus.Published, ListingStatus.Archived)).toBe(true);
    expect(canTransition(ListingStatus.Rejected, ListingStatus.Draft)).toBe(true);
    expect(canTransition(ListingStatus.Sold, ListingStatus.Archived)).toBe(true);
    expect(canTransition(ListingStatus.Archived, ListingStatus.Draft)).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(canTransition(ListingStatus.Draft, ListingStatus.Published)).toBe(false);
    expect(canTransition(ListingStatus.Published, ListingStatus.Draft)).toBe(false);
    expect(canTransition(ListingStatus.Sold, ListingStatus.Published)).toBe(false);
  });
});

describe('PriceType', () => {
  it('parses valid types', () => {
    expect(parsePriceType('fixed')).toBe(PriceType.Fixed);
    expect(parsePriceType('negotiable')).toBe(PriceType.Negotiable);
    expect(parsePriceType('auction')).toBe(PriceType.Auction);
  });

  it('rejects invalid', () => {
    expect(() => parsePriceType('unknown')).toThrow();
  });
});
