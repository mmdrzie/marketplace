import { describe, it, expect } from 'vitest';
import { transformListing, transformListingDetail, transformUser, transformArticle } from '@/lib/transformers';
import type { BackendListing, BackendListingDetail, BackendUser, BackendArticle } from '@/types/backend';

describe('transformers', () => {
  it('transformListing maps backend fields to frontend Listing', () => {
    const backend: BackendListing = {
      id: '42',
      user_id: 'u9',
      title: 'تراکتور ماشین',
      slug: 'tractor',
      description: '',
      price: 15000000,
      price_type: 'fixed',
      status: 'published',
      is_featured: true,
      views: 12,
      primary_image: 'img.jpg',
      category_name: 'ماشین',
      category_slug: 'machines',
      category_id: 3,
      province_name: 'تهران',
      province_id: 1,
      city_id: 2,
      city_name: 'تهران',
      seller_id: 'u9',
      seller_name: 'فروشنده',
      published_at: '2024-01-01',
      expires_at: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    const out = transformListing(backend);

    expect(out.id).toBe('42');
    expect(out.title).toBe('تراکتور ماشین');
    expect(out.price).toBe(15000000);
    expect(out.is_featured).toBe(true);
    expect(out.seller_id).toBe('u9');
    expect(out.city_name).toBe('تهران');
  });

  it('transformListingDetail includes images and attributes', () => {
    const backend: BackendListingDetail = {
      id: '7',
      user_id: 'u1',
      title: 'دستگاه',
      slug: 'device',
      description: 'توضیحات',
      price: 0,
      price_type: 'negotiable',
      status: 'published',
      is_featured: false,
      views: 0,
      primary_image: null,
      category_name: null,
      category_slug: null,
      category_id: 1,
      province_name: null,
      province_id: null,
      city_id: null,
      city_name: null,
      seller_id: null,
      seller_name: null,
      published_at: null,
      expires_at: null,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      images: [
        { id: '1', url: 'a.jpg', thumbnail_url: 'a_t.jpg', medium_url: 'a_m.jpg', is_primary: true, sort_order: 0 },
      ],
      attributes: [{ id: 1, attribute_id: 1, name: 'brand', label: 'برند', type: 'text', unit: null, value: 'x' }],
      renew_count: 0,
      rejection_reason: null,
      is_favorited: false,
    };

    const out = transformListingDetail(backend);

    expect(out.description).toBe('توضیحات');
    expect(out.images).toHaveLength(1);
    expect(out.images[0].url).toBe('a.jpg');
    expect(out.attributes).toHaveLength(1);
  });

  it('transformUser derives verified flags from timestamps', () => {
    const backend: BackendUser = {
      id: 'u1',
      name: 'User',
      email: 'a@b.com',
      phone: null,
      avatar: null,
      city: null,
      role: 'dealer',
      status: 'active',
      phone_verified_at: '2024-01-01',
      email_verified_at: null,
      created_at: '2024-01-01',
      dealer_profile: null,
    } as BackendUser;

    const out = transformUser(backend);
    expect(out.phoneVerified).toBe(true);
    expect(out.emailVerified).toBe(false);
    expect(out.role).toBe('dealer');
  });

  it('transformArticle falls back to announcement for unknown category', () => {
    const backend: BackendArticle = {
      id: '1',
      title: 't',
      slug: 's',
      excerpt: '',
      body: '',
      cover_image: null,
      category: 'unknown-cat',
      category_label: '',
      author: '',
      tags: [],
      is_pinned: false,
      views: 0,
      reading_time: 1,
      published_at: '2024-01-01',
      created_at: '2024-01-01',
    } as BackendArticle;

    expect(transformArticle(backend).category).toBe('announcement');
  });
});
