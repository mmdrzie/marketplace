import { describe, it, expect } from 'vitest';
import { Brand } from '../../src/domain/entities/vehicle/Brand.entity.js';

describe('Brand Entity', () => {
  it('creates with slug from name', () => {
    const brand = Brand.create({ id: 1, name: 'Peugeot' });
    expect(brand.slug.value).toBe('peugeot');
    expect(brand.isActive).toBe(true);
  });

  it('creates with custom slug', () => {
    const brand = Brand.create({ id: 1, name: 'Peugeot', slug: 'peugeot-france' });
    expect(brand.slug.value).toBe('peugeot-france');
  });

  it('deactivate/activate', () => {
    const brand = Brand.create({ id: 1, name: 'Test' });
    brand.deactivate();
    expect(brand.isActive).toBe(false);
    brand.activate();
    expect(brand.isActive).toBe(true);
  });

  it('snapshot roundtrip', () => {
    const brand = Brand.create({
      id: 1, name: 'Toyota', nameEn: 'Toyota', country: 'Japan', foundedYear: 1937,
    });
    Brand.fromSnapshot(brand.snapshot());
    expect(() => Brand.fromSnapshot(brand.snapshot())).not.toThrow();
  });
});
