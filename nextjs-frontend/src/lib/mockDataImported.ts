// FEATURE: imported-vehicles — delete this file to remove all imported data

import type { Category, Attribute, Listing, ListingDetail, AttributeValue } from '@/types';
import { IMPORT_COUNTRIES, CUSTOMS_STATUS_LABELS, ORIGIN_LABELS } from '@/types/imported';

/* ========== Categories ========== */

export const IMPORTED_CATEGORIES: Category[] = [
  {
    id: 15, name: 'خودروی وارداتی', name_en: 'Imported Cars', slug: 'imported-car',
    icon: null, parent_id: null, sort_order: 15,
    children: [
      { id: 151, name: 'سواری وارداتی', name_en: 'Imported Sedan', slug: 'imported-sedan', icon: null, parent_id: 15, sort_order: 1 },
      { id: 152, name: 'SUV وارداتی', name_en: 'Imported SUV', slug: 'imported-suv', icon: null, parent_id: 15, sort_order: 2 },
      { id: 153, name: 'کوپه و اسپرت', name_en: 'Imported Coupe & Sport', slug: 'imported-coupe', icon: null, parent_id: 15, sort_order: 3 },
    ],
  },
  { id: 16, name: 'کامیون وارداتی', name_en: 'Imported Trucks', slug: 'imported-truck', icon: null, parent_id: null, sort_order: 16 },
  { id: 17, name: 'وانت وارداتی', name_en: 'Imported Pickups', slug: 'imported-pickup', icon: null, parent_id: null, sort_order: 17 },
  { id: 18, name: 'موتورسیکلت وارداتی', name_en: 'Imported Motorcycles', slug: 'imported-motorcycle', icon: null, parent_id: null, sort_order: 18 },
  { id: 19, name: 'ماشین‌آلات راهسازی وارداتی', name_en: 'Imported Heavy Equipment', slug: 'imported-heavy', icon: null, parent_id: null, sort_order: 19 },
  { id: 20, name: 'قطعات یدکی خارجی', name_en: 'Imported Parts', slug: 'imported-parts', icon: null, parent_id: null, sort_order: 20 },
];

/* ========== Attributes ========== */

export const IMPORTED_ATTRIBUTES: Record<number, Attribute[]> = {
  15: [
    { id: 201, name: 'import_country', label: 'کشور مبدأ', type: 'select', options: [...IMPORT_COUNTRIES], is_filterable: true, is_required: true },
    { id: 202, name: 'origin', label: 'نوع واردات', type: 'select', options: Object.values(ORIGIN_LABELS), is_filterable: true, is_required: true },
    { id: 203, name: 'customs_status', label: 'وضعیت گمرکی', type: 'select', options: Object.values(CUSTOMS_STATUS_LABELS), is_filterable: true },
    { id: 204, name: 'import_year', label: 'سال واردات', type: 'number', is_filterable: true, unit: 'شمسی' },
    { id: 205, name: 'body_type', label: 'نوع بدنه', type: 'select', options: ['سدان', 'SUV', 'کوپه', 'کروک', 'هاچبک', 'پیکاپ', 'مینی‌ون'], is_filterable: true },
    { id: 206, name: 'fuel_type', label: 'نوع سوخت', type: 'select', options: ['بنزین', 'گازوئیل', 'هیبرید', 'برقی', 'پلاگین هیبرید'], is_filterable: true },
    { id: 207, name: 'transmission', label: 'گیربکس', type: 'select', options: ['دنده‌ای', 'اتوماتیک', 'نیمه اتوماتیک'], is_filterable: true },
    { id: 208, name: 'drive_type', label: 'محور محرک', type: 'select', options: ['FWD', 'RWD', 'AWD', '4WD'], is_filterable: true },
    { id: 209, name: 'mileage', label: 'کارکرد', type: 'number', is_filterable: true, unit: 'km' },
    { id: 210, name: 'engine_cc', label: 'حجم موتور', type: 'number', unit: 'cc' },
    { id: 211, name: 'color', label: 'رنگ', type: 'select', options: ['سفید', 'مشکی', 'نقره‌ای', 'خاکستری', 'آبی', 'قرمز', 'سبز', 'زرد', 'نارنجی', 'سایر'] },
    { id: 212, name: 'warranty', label: 'گارانتی', type: 'boolean' },
  ],
};

/* ========== Listings ========== */

interface ImportedListing extends Listing {
  attributes: { attribute_id: number; value: string }[];
  images?: string[];
}

function p(v: number) { return v * 1000000; }

export const IMPORTED_LISTINGS: ImportedListing[] = [
  {
    id: 1001, title: 'BMW X5 xDrive40i 2023', slug: 'bmw-x5-2023',
    price: p(95), price_type: 'negotiable', status: 'active', is_featured: true, views: 1450,
    primary_image: null, category: { id: 152, name: 'SUV وارداتی', slug: 'imported-suv' },
    province: 'تهران', city: 'تهران', published_at: '۱۴۰۴/۰۱/۱۵',
    attributes: [
      { attribute_id: 201, value: 'آلمان' }, { attribute_id: 202, value: 'وارداتی (طرح نوین)' },
      { attribute_id: 203, value: 'پلاک شده' }, { attribute_id: 204, value: '۱۴۰۲' },
      { attribute_id: 205, value: 'SUV' }, { attribute_id: 206, value: 'بنزین' },
      { attribute_id: 207, value: 'اتوماتیک' }, { attribute_id: 208, value: 'AWD' },
      { attribute_id: 209, value: '۱۲۰۰۰' }, { attribute_id: 210, value: '۲۹۹۸' },
      { attribute_id: 211, value: 'مشکی' }, { attribute_id: 212, value: 'true' },
    ],
    images: [] as string[],
  },
  {
    id: 1002, title: 'Toyota Land Cruiser 300 2024', slug: 'toyota-land-cruiser-300',
    price: p(140), price_type: 'negotiable', status: 'active', is_featured: true, views: 2100,
    primary_image: null, category: { id: 152, name: 'SUV وارداتی', slug: 'imported-suv' },
    province: 'بوشهر', city: 'بوشهر', published_at: '۱۴۰۴/۰۲/۰۱',
    attributes: [
      { attribute_id: 201, value: 'ژاپن' }, { attribute_id: 202, value: 'وارداتی (شمال)' },
      { attribute_id: 203, value: 'گمرکی' }, { attribute_id: 204, value: '۱۴۰۳' },
      { attribute_id: 205, value: 'SUV' }, { attribute_id: 206, value: 'گازوئیل' },
      { attribute_id: 207, value: 'اتوماتیک' }, { attribute_id: 208, value: '4WD' },
      { attribute_id: 209, value: '۵۰۰۰' }, { attribute_id: 210, value: '۳۳۴۶' },
      { attribute_id: 211, value: 'سفید' },
    ],
    images: [] as string[],
  },
  {
    id: 1003, title: 'Mercedes-Benz GLE 450 2024', slug: 'mercedes-gle-450-2024',
    price: p(125), price_type: 'fixed', status: 'active', is_featured: false, views: 980,
    primary_image: null, category: { id: 152, name: 'SUV وارداتی', slug: 'imported-suv' },
    province: 'تهران', city: 'تهران', published_at: '۱۴۰۴/۰۱/۲۰',
    attributes: [
      { attribute_id: 201, value: 'آلمان' }, { attribute_id: 202, value: 'وارداتی (تهران)' },
      { attribute_id: 203, value: 'پلاک شده' }, { attribute_id: 204, value: '۱۴۰۲' },
      { attribute_id: 205, value: 'SUV' }, { attribute_id: 206, value: 'بنزین' },
      { attribute_id: 207, value: 'اتوماتیک' }, { attribute_id: 208, value: 'AWD' },
      { attribute_id: 209, value: '۱۸۰۰۰' }, { attribute_id: 210, value: '۲۹۹۹' },
      { attribute_id: 211, value: 'نقره‌ای' }, { attribute_id: 212, value: 'true' },
    ],
    images: [] as string[],
  },
  {
    id: 1004, title: 'Hyundai Santa Fe 2024 Calligraphy', slug: 'hyundai-santa-fe-2024',
    price: p(55), price_type: 'negotiable', status: 'active', is_featured: false, views: 760,
    primary_image: null, category: { id: 152, name: 'SUV وارداتی', slug: 'imported-suv' },
    province: 'کیش', city: 'کیش', published_at: '۱۴۰۴/۰۲/۱۰',
    attributes: [
      { attribute_id: 201, value: 'کره جنوبی' }, { attribute_id: 202, value: 'وارداتی (منطقه آزاد)' },
      { attribute_id: 203, value: 'پلاک منطقه آزاد' }, { attribute_id: 204, value: '۱۴۰۳' },
      { attribute_id: 205, value: 'SUV' }, { attribute_id: 206, value: 'هیبرید' },
      { attribute_id: 207, value: 'اتوماتیک' }, { attribute_id: 208, value: 'AWD' },
      { attribute_id: 209, value: '۳۰۰۰' }, { attribute_id: 210, value: '۱۵۹۸' },
      { attribute_id: 211, value: 'آبی' },
    ],
    images: [] as string[],
  },
  {
    id: 1005, title: 'Porsche Cayenne GTS 2023', slug: 'porsche-cayenne-gts-2023',
    price: p(175), price_type: 'fixed', status: 'active', is_featured: true, views: 3200,
    primary_image: null, category: { id: 153, name: 'کوپه و اسپرت', slug: 'imported-coupe' },
    province: 'تهران', city: 'تهران', published_at: '۱۴۰۴/۰۱/۰۵',
    attributes: [
      { attribute_id: 201, value: 'آلمان' }, { attribute_id: 202, value: 'وارداتی (طرح نوین)' },
      { attribute_id: 203, value: 'پلاک شده' }, { attribute_id: 204, value: '۱۴۰۱' },
      { attribute_id: 205, value: 'SUV' }, { attribute_id: 206, value: 'بنزین' },
      { attribute_id: 207, value: 'اتوماتیک' }, { attribute_id: 208, value: 'AWD' },
      { attribute_id: 209, value: '۲۵۰۰۰' }, { attribute_id: 210, value: '۳۹۹۶' },
      { attribute_id: 211, value: 'خاکستری' }, { attribute_id: 212, value: 'true' },
    ],
    images: [] as string[],
  },
  {
    id: 1006, title: 'Toyota Camry LE 2024 نیسان', slug: 'toyota-camry-2024',
    price: p(38), price_type: 'negotiable', status: 'active', is_featured: false, views: 540,
    primary_image: null, category: { id: 151, name: 'سواری وارداتی', slug: 'imported-sedan' },
    province: 'اصفهان', city: 'اصفهان', published_at: '۱۴۰۴/۰۲/۰۵',
    attributes: [
      { attribute_id: 201, value: 'ژاپن' }, { attribute_id: 202, value: 'وارداتی (شمال)' },
      { attribute_id: 203, value: 'پلاک شده' }, { attribute_id: 204, value: '۱۴۰۳' },
      { attribute_id: 205, value: 'سدان' }, { attribute_id: 206, value: 'بنزین' },
      { attribute_id: 207, value: 'اتوماتیک' }, { attribute_id: 208, value: 'FWD' },
      { attribute_id: 209, value: '۸۰۰۰' }, { attribute_id: 210, value: '۱۹۹۸' },
      { attribute_id: 211, value: 'سفید' },
    ],
    images: [] as string[],
  },
];

/* ========== Attribute label map ========== */

const ATTR_MAP: Record<number, { label: string; type: string }> = {};
for (const attrs of Object.values(IMPORTED_ATTRIBUTES)) {
  for (const a of attrs) {
    ATTR_MAP[a.id] = { label: a.label, type: a.type };
  }
}

/* ========== Detail builder ========== */

export function buildImportedDetail(l: ImportedListing): ListingDetail {
  const { attributes: rawAttrs, ...rest } = l;
  return {
    ...rest,
    description: `${l.title} — خودروی وارداتی از ${l.attributes.find(a => a.attribute_id === 201)?.value || 'کشور نامشخص'}، ${l.attributes.find(a => a.attribute_id === 202)?.value || ''}`,
    renew_count: 0, rejection_reason: null,
    images: [],
    attributes: (rawAttrs || []).map((a) => {
      const meta = ATTR_MAP[a.attribute_id] || { label: 'مشخصه', type: 'text' };
      return {
        id: a.attribute_id,
        attribute_id: a.attribute_id,
        name: a.attribute_id.toString(),
        label: meta.label,
        type: meta.type,
        unit: null,
        value: a.value,
      } as AttributeValue;
    }),
    is_favorited: false, expires_at: null,
  };
}
