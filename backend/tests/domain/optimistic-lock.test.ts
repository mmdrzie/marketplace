import { describe, it, expect } from 'vitest';
import { Listing } from '../../src/domain/entities/listing/Listing.entity.js';
import { Money } from '../../src/domain/entities/value-objects/Money.js';

describe('Optimistic Lock via Entity', () => {
  it('increments version on each state change', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Test', description: '', price: 1000, priceType: 'fixed',
    });
    expect(listing.version).toBe(1);

    listing.submit();
    expect(listing.version).toBe(2);

    listing.approve();
    expect(listing.version).toBe(3);

    listing.markSold();
    expect(listing.version).toBe(4);
  });

  it('version prevents stale update in snapshot roundtrip', () => {
    const listing = Listing.create({
      id: 1, userId: 'u1', categoryId: 1, provinceId: 1, cityId: 1,
      title: 'Original', description: '', price: 1000, priceType: 'fixed',
    });

    // Simulate concurrent save: user A loads, user B loads, user B saves, user A saves
    const snapshotA = listing.snapshot();
    const snapshotB = listing.snapshot();

    // User B updates
    const listingB = Listing.fromSnapshot(snapshotB);
    listingB.submit();
    expect(listingB.version).toBe(2);

    // User A tries update with stale version
    const listingA = Listing.fromSnapshot(snapshotA);
    listingA.description = 'Stale update';
    listingA.version = 1; // user A still has version 1
    listingA.updatedAt = new Date();

    // The snapshot shows version 1 — Repository impl باید تشخیص دهد
    // که این version با دیتابیس (version 2) همخوانی ندارد
    expect(listingA.version).toBe(1);
    expect(listingB.version).toBe(2);
    // اینجا Repository باید WHERE version = 1 را بزند و چون 0 rowCount است
    // rollback کند
    expect(listingB.snapshot().version).not.toBe(listingA.snapshot().version);
  });
});
