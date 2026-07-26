import { describe, it, expect } from 'vitest';
import { Listing } from '../../src/domain/entities/listing/Listing.entity.js';

describe('Listing Entity', () => {
  it('creates as draft', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test Listing', description: 'Desc', price: 100000, priceType: 'fixed',
    });
    expect(listing.status).toBe('draft');
    expect(listing.version).toBe(1);
    expect(listing.isFeatured).toBe(false);
    expect(listing.views).toBe(0);
  });

  it('generates slug from title', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Peugeot 206', description: 'Desc', price: 100000, priceType: 'fixed',
    });
    expect(listing.slug.value).toBe('peugeot-206');
  });

  it('transitions draft → pending on submit', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: '', price: 0, priceType: 'fixed',
    });
    listing.submit();
    expect(listing.status).toBe('pending');
    expect(listing.version).toBe(2);
  });

  it('transitions pending → published on approve', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: '', price: 0, priceType: 'fixed',
    });
    listing.submit();
    listing.approve();
    expect(listing.status).toBe('published');
    expect(listing.publishedAt).toBeTruthy();
  });

  it('blocks invalid transitions', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: '', price: 0, priceType: 'fixed',
    });
    expect(() => listing.approve()).toThrow('Cannot transition');
  });

  it('soft delete marks deletedAt', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: '', price: 0, priceType: 'fixed',
    });
    listing.softDelete();
    expect(listing.deletedAt).toBeTruthy();
  });

  it('ownership check', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: '', price: 0, priceType: 'fixed',
    });
    expect(listing.isOwnedBy('u1')).toBe(true);
    expect(listing.isOwnedBy('u2')).toBe(false);
  });

  it('snapshot roundtrip', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: 'Desc', price: 50000, priceType: 'negotiable',
    });
    listing.submit();
    listing.approve();
    const snapshot = listing.snapshot();
    const restored = Listing.fromSnapshot(snapshot);
    expect(restored.title).toBe(listing.title);
    expect(restored.slug.value).toBe(listing.slug.value);
    expect(restored.price.amount).toBe(listing.price.amount);
    expect(restored.status).toBe(listing.status);
  });
});
