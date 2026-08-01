# Attributes Overhaul Plan — v4 (Final)

## Objective
Fix the broken attribute/filter system end-to-end: seed attributes, fix SQL bugs, refactor listing form state, add brand/model/variant selection, move year/mileage to direct columns, and replace static taxonomy data with API calls.

---

## Architecture

```
listings
├── category_id        FK → categories(id)
├── vehicle_model_id   FK → vehicle_models(id)     ← NOT NULL (mandatory)
├── vehicle_variant_id FK → vehicle_variants(id)    ← NULL (optional)
├── year               INTEGER                      ← direct column
├── mileage            INTEGER                      ← direct column
├── price, title, description, province_id, city_id, status, ...

listing_attributes   ← EAV for truly dynamic attributes only
├── listing_id       FK → listings(id)
├── attribute_id     FK → attributes(id)
├── value            TEXT

attributes           ← definitions per category
├── id, category_id, name, label, type, options, is_filterable, sort_order
```

**NOT in EAV:** brand, model, year, mileage (use direct JOIN via `vehicle_model_id`)

---

## P0 — Fix SQL Bug: `a_*.value` → `la_*.value`

**File:** `backend/src/repositories/listing.ts`

The `attributes` table has NO `value` column. `value` only exists on `listing_attributes`.  
8 EXISTS subqueries incorrectly reference `a_*.value` (alias for `attributes`) instead of `la_*.value` (alias for `listing_attributes`).

### Changes

**findAll method — 8 lines:**

| Line | Alias | Wrong | Correct |
|------|-------|-------|---------|
| 171 | `a_b` (brand) | `a_b.value ILIKE` | `la_b.value ILIKE` |
| 205 | `a_g` (gearbox) | `a_g.value =` | `la_g.value =` |
| 215 | `a_c` (color) | `a_c.value = ANY(...)` | `la_c.value = ANY(...)` |
| 219 | `a_ft` (fuel_type) | `a_ft.value =` | `la_ft.value =` |
| 223 | `a_sc` (special_case) | `a_sc.value =` | `la_sc.value =` |
| 227 | `a_bc` (body_condition) | `a_bc.value =` | `la_bc.value =` |
| 231 | `a_cyl` (cylinders) | `a_cyl.value =` | `la_cyl.value =` |
| 235 | `a_dt` (drivetrain) | `a_dt.value =` | `la_dt.value =` |

**search method — same 8 lines (line numbers offset by ~300):**

Lines 468, 501, 511, 515, 519, 523, 527, 531 — same fix.

### Verification
```bash
# Test that the query doesn't throw "column a_b.value does not exist"
node -e "
const {Pool} = require('pg');
const pool = new Pool({connectionString: '...'});
pool.query(\`EXPLAIN SELECT l.id FROM listings l WHERE EXISTS (
  SELECT 1 FROM listing_attributes la JOIN attributes a ON a.id=la.attribute_id
  WHERE la.listing_id=l.id AND a.name='brand' AND la_b.value ILIKE '%test%'
)\`).then(r => { console.log('OK'); pool.end(); }).catch(e => { console.log('ERROR:', e.message); pool.end(); });
"
```

---

## P1 — Migration: Add `year`, `mileage`, `vehicle_model_id` to `listings`

### New Migration File

**File:** `backend/migrations/032_listing_columns.sql`

```sql
BEGIN;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS mileage INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS vehicle_model_id BIGINT NOT NULL
  REFERENCES vehicle_models(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
CREATE INDEX IF NOT EXISTS idx_listings_mileage ON listings(mileage);
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_model ON listings(vehicle_model_id);
CREATE INDEX IF NOT EXISTS idx_listings_model_year ON listings(vehicle_model_id, year);
CREATE INDEX IF NOT EXISTS idx_listings_model_price ON listings(vehicle_model_id, price);

COMMIT;
```

> **Note:** `ON DELETE RESTRICT` is used (not `SET NULL`) because `vehicle_model_id` is NOT NULL.  
> `vehicle_models` is part of the taxonomy system and should use soft-delete (`is_active`) instead of physical deletion.

### Repository Changes

**File:** `backend/src/repositories/listing.ts`

1. Add fields to `CreateListingData`:
```typescript
export type CreateListingData = {
  user_id: string;
  category_id: number;
  vehicle_model_id: number;
  vehicle_variant_id?: number | null;
  year?: number | null;
  mileage?: number | null;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  price_type?: PriceType;
  province_id?: number | null;
  city_id?: number | null;
  status?: ListingStatus;
};
```

2. Add fields to `UpdateListingData`:
```typescript
year?: number | null;
mileage?: number | null;
vehicle_model_id?: number;
vehicle_variant_id?: number | null;
```

3. Update `ALLOWED_LISTING_FIELDS`:
```typescript
'vehicle_model_id', 'vehicle_variant_id', 'year', 'mileage',
```

4. Update `INSERT` in `create` method:
```sql
INSERT INTO listings (user_id, category_id, vehicle_model_id, vehicle_variant_id, year, mileage,
  province_id, city_id, title, slug, description, price, price_type, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
```

5. **Rewrite year/mileage filters** — from EXISTS subqueries to direct column comparisons:

```typescript
// BEFORE (existing — will be removed after P0 fix):
if (filters.year_from) {
  wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_yf JOIN attributes a_yf ON a_yf.id = la_yf.attribute_id WHERE la_yf.listing_id = l.id AND a_yf.name = 'year' AND la_yf.value::int >= $${p++})`);
}
if (filters.year_to) {
  wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_yt JOIN attributes a_yt ON a_yt.id = la_yt.attribute_id WHERE la_yt.listing_id = l.id AND a_yt.name = 'year' AND la_yt.value::int <= $${p++})`);
}
if (filters.mileage_zero === '1') {
  wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_mz JOIN attributes a_mz ON a_mz.id = la_mz.attribute_id WHERE la_mz.listing_id = l.id AND a_mz.name = 'mileage' AND la_mz.value::int = 0)`);
}
if (filters.mileage_from) {
  wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_mf JOIN attributes a_mf ON a_mf.id = la_mf.attribute_id WHERE la_mf.listing_id = l.id AND a_mf.name = 'mileage' AND la_mf.value::int >= $${p++})`);
}
if (filters.mileage_to) {
  wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_mt JOIN attributes a_mt ON a_mt.id = la_mt.attribute_id WHERE la_mt.listing_id = l.id AND a_mt.name = 'mileage' AND la_mt.value::int <= $${p++})`);
}

// AFTER:
if (filters.year_from) {
  wheres.push(`l.year >= $${p++}`);
  params.push(parseInt(filters.year_from, 10));
}
if (filters.year_to) {
  wheres.push(`l.year <= $${p++}`);
  params.push(parseInt(filters.year_to, 10));
}
if (filters.mileage_zero === '1') {
  wheres.push(`l.mileage = 0`);
}
if (filters.mileage_from) {
  wheres.push(`l.mileage >= $${p++}`);
  params.push(parseInt(filters.mileage_from, 10));
}
if (filters.mileage_to) {
  wheres.push(`l.mileage <= $${p++}`);
  params.push(parseInt(filters.mileage_to, 10));
}
```

### Route Schema Changes

**File:** `backend/src/routes/listings.ts`

```typescript
const createListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().int().min(0).optional(),
  price_type: z.enum(['fixed', 'negotiable', 'auction']).optional(),
  category_id: z.number().int().positive(),
  vehicleModelId: z.number().int().positive(),
  vehicleVariantId: z.number().int().positive().optional(),
  year: z.number().int().min(1300).max(1500).optional(),
  mileage: z.number().int().min(0).optional(),
  province_id: z.number().int().positive().optional(),
  city_id: z.number().int().positive().optional(),
  attributes: z.array(z.object({ attributeId: z.number().int().positive(), value: z.string() })).optional(),
  images: z.array(z.object({
    url: z.string(),
    thumbnail_url: z.string().optional(),
    medium_url: z.string().optional(),
    is_primary: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
  })).optional(),
});
```

Note: `vehicleModelId` is now required (NOT NULL in DB).

---

## P1b — Seed Category-Aware Attributes

**New File:** `backend/scripts/seed-attributes.mjs`

Seed `attributes` rows per category (with `options` JSONB for select types).

### Attribute Definitions Per Category

**Passenger vehicle subcats** (sedan, suv, hatchback, coupe, convertible, crossover, off-road, pickup, classic, race):

| name | label | type | options (select) |
|------|-------|------|------------------|
| `gearbox` | گیربکس | select | `["اتوماتیک", "دنده‌ای"]` |
| `fuel_type` | نوع سوخت | select | `["بنزین", "گازوئیل", "دوگانه سوز", "برقی", "هیبرید"]` |
| `color` | رنگ بدنه | select | `["سفید", "مشکی", "نقره‌ای", "خاکستری", "آبی", "قرمز", "سبز", "زرد", "نارنجی", "بنفش", "طلایی", "سایر"]` |
| `body_condition` | وضعیت بدنه | select | 14 options (سواری list) |
| `cylinders` | تعداد سیلندر | select | `["4", "5", "6", "8", "10", "12"]` |
| `drivetrain` | دیفرانسیل | select | `["تک دیفرانسیل", "دو دیفرانسیل"]` |
| `special_case` | موارد خاص | select | `["مصرف شخصی", "وارداتی", "بدون پلاک"]` |

**Motorcycle subcats** (motorcycles, cruiser, street, scooter, race):

| name | label | type | options |
|------|-------|------|---------|
| `engine_cc` | حجم موتور | select | `["۱۲۵", "۲۰۰", "۲۵۰", "۳۰۰", "۴۰۰", "۵۰۰", "۶۰۰", "۷۰۰", "۸۰۰", "۱۰۰۰", "۱۲۰۰", "۱۳۰۰", "بیشتر"]` |
| `cooling` | سیستم خنک‌کننده | select | `["آب خنک", "باد خنک"]` |
| `starter` | استارت | select | `["الکتریکی", "دستی"]` |
| `fuel_type` | نوع سوخت | select | `["بنزین", "برقی"]` |
| `color` | رنگ | select | (same as passenger) |

**Truck subcats** (truck, kamyvn-tk-mhvr, kamyvn-dv-mhvr, kamyvn-chhar-mhvr):

| name | label | type | options |
|------|-------|------|---------|
| `gearbox` | گیربکس | select | `["دستی", "اتوماتیک"]` |
| `fuel_type` | نوع سوخت | select | `["گازوئیل", "گاز", "دوگانه"]` |
| `color` | رنگ بدنه | select | (same as passenger) |
| `body_condition` | وضعیت بدنه | select | 26 options (commercial list) |

**Bus/Van subcats** (bus-van, bus, minibus, van):

| name | label | type | options |
|------|-------|------|---------|
| `gearbox` | گیربکس | select | (same as truck) |
| `fuel_type` | نوع سوخت | select | (same as truck) |
| `color` | رنگ بدنه | select | (same) |
| `body_condition` | وضعیت بدنه | select | 26 options (commercial) |
| `passenger_capacity` | ظرفیت مسافر | number | — |

**Light-truck & Tractor-head:** same as truck (gearbox, fuel_type, color, body_condition)

**Trailer subcats** (trailer, trylr-*):

| name | label | type | options |
|------|-------|------|---------|
| `color` | رنگ بدنه | select | (same) |
| `body_condition` | وضعیت بدنه | select | 26 options (commercial) |

**Construction machinery** (construction-machinery, lvdr-*, byl-*, tractor):

| name | label | type |
|------|-------|------|
| `hours_used` | ساعت کارکرد | number |
| `weight` | وزن (تن) | number |
| `year` | سال ساخت | number |

### Body Condition Options

**Passenger (14 options):**
```
["نو", "کم کارکرد", "بدون رنگ", "یک لکه رنگ", "دو لکه رنگ", "چند لکه رنگ",
 "لپی رنگ", "دور رنگ", "درب تعویض", "گلگیر تعویض", "کاپوت تعویض",
 "صافکاری بدون رنگ", "کامل رنگ", "تصادفی"]
```

**Commercial (26 options):**
```
["بدون رنگ", "یک لکه رنگ", "دو لکه رنگ", "چند لکه رنگ", "لپی رنگ",
 "لپی تعویض", "سینی جلو رنگ", "سینی جلو تعویض", "قیچی رنگ",
 "دور رنگ", "صافکاری بدون رنگ", "گلگیر رنگ", "کاپوت تعویض",
 "گلگیر تعویض", "کامل رنگ", "درب تعویض", "یک درب رنگ", "کاپوت رنگ",
 "دو درب رنگ", "تصادفی", "اتاق تعویض", "سوخته", "اوراقی",
 "با سابقه تعمیر", "بدون سابقه تعمیر"]
```

### Not in attributes (moved to direct columns):
- `brand` → via `vehicle_model_id` → `vehicle_models.brand_id` → `brands`
- `model` → via `vehicle_model_id` → `vehicle_models`
- `year` → direct column `listings.year`
- `mileage` → direct column `listings.mileage`

### Implementation

```javascript
// seed-attributes.mjs — simplified structure
const CATEGORY_ATTRS = {
  'sedan': [...attrs],
  'suv': [...attrs],
  'hatchback': [...attrs],
  // ... map each category slug to its attribute list
};

for (const [slug, attrs] of Object.entries(CATEGORY_ATTRS)) {
  const cat = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
  if (!cat.rows.length) continue;
  const categoryId = cat.rows[0].id;
  for (const attr of attrs) {
    await pool.query(
      `INSERT INTO attributes (category_id, name, label, type, options, is_filterable, sort_order)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       ON CONFLICT DO NOTHING`,
      [categoryId, attr.name, attr.label, attr.type, JSON.stringify(attr.options || []), attr.sort_order]
    );
  }
}
```

---

## P2 — Refactor Form State to `Array<{attributeId, value}>`

### Problem
Frontend stores attributes as `Record<string, string>` (keyed by attribute name).  
Backend schema expects `Array<{attributeId: number, value: string}>`.  
Currently works only because no attributes exist; after P1b it will break.

### Solution
Frontend uses `attributeId` from the first API response — no name→id mapping needed.

### Changes

**File:** `nextjs-frontend/src/components/listing/ListingForm/index.tsx`

```typescript
// BEFORE:
const [attributes, setAttributes] = useState<Record<string, string>>({});
// const [objectKeys, setObjectKeys] = useState<string[]>([]);
// ...

// AFTER:
type AttributeEntry = { attributeId: number; value: string };
const [attributes, setAttributes] = useState<AttributeEntry[]>([]);
```

Update `initialData` interface:
```typescript
interface ListingFormProps {
  initialData?: {
    // ...
    attributes: AttributeEntry[];
    // ...
  };
}
```

Update `restoreDraft`:
```typescript
// BEFORE: setAttributes(saved.attributes as Record<string, string>);
// AFTER:  setAttributes(saved.attributes as AttributeEntry[]);
```

Update `handleSubmit` — **send directly, no transformation needed**:
```typescript
const payload = {
  // ...
  attributes, // ← already Array<{attributeId, value}>, sent as-is
};
```

**File:** `nextjs-frontend/src/components/listing/ListingForm/Step3Attributes.tsx`

```typescript
// BEFORE:
const setValue = (name: string, value: string) => onChange({ ...values, [name]: value });
// <input value={values[attr.name] || ''} onChange={e => setValue(attr.name, e.target.value)} />

// AFTER:
const setValue = (id: number, value: string) => {
  const next = [...values];
  const idx = next.findIndex(a => a.attributeId === id);
  if (idx >= 0) next[idx] = { attributeId: id, value };
  else next.push({ attributeId: id, value });
  onChange(next);
};
// <input value={values.find(a => a.attributeId === attr.id)?.value || ''}
//        onChange={e => setValue(attr.id, e.target.value)} />

// For select/glass select (same pattern):
// BEFORE: value={values[attr.name] || ''}
// AFTER:  value={values.find(a => a.attributeId === attr.id)?.value || ''}
```

**File:** `nextjs-frontend/src/components/listing/ListingForm/Step5Preview.tsx`

Update display of attributes to iterate over `AttributeEntry[]`.

**File:** `backend/src/routes/listings.ts`

```typescript
// Schema already updated in P1 to use attributeId
// Just ensure consistency:
attributes: z.array(z.object({
  attributeId: z.number().int().positive(),
  value: z.string()
})).optional(),
```

**File:** `backend/src/repositories/listing.ts`

```typescript
async setAttributes(listingId: number, attributes: { attributeId: number; value: string }[]) {
  // INSERT INTO listing_attributes (listing_id, attribute_id, value)
  // using attributes[i].attributeId as attribute_id
}
```

---

## P3 — Transactional create/update in Repository

### New Methods on `ListingRepository`

**File:** `backend/src/repositories/listing.ts`

```typescript
async createWithRelations(data: {
  listing: CreateListingData;
  attributes?: { attributeId: number; value: string }[];
  images?: { url: string; thumbnail_url?: string; medium_url?: string; is_primary?: boolean; sort_order?: number }[];
}): Promise<ListingRow> {
  const db = await getDb();
  try {
    await db.query('BEGIN');
    
    // Validate variant belongs to model
    if (data.listing.vehicleVariantId) {
      const { rows } = await db.query(
        'SELECT model_id FROM vehicle_variants WHERE id = $1',
        [data.listing.vehicleVariantId]
      );
      if (!rows.length) throw new AppError('validation', 'Invalid vehicleVariantId: variant not found');
      if (rows[0].model_id !== data.listing.vehicle_model_id) {
        throw new AppError('validation', 'vehicleVariantId does not belong to the selected model');
      }
    }
    
    const listing = await this.create(data.listing);
    if (data.attributes?.length) await this.setAttributes(listing.id, data.attributes);
    if (data.images?.length) await this.addImages(listing.id, data.images);
    await db.query('COMMIT');
    return listing;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

async updateWithRelations(
  id: number,
  data: {
    listing: UpdateListingData;
    attributes?: { attributeId: number; value: string }[];
  }
): Promise<ListingRow | undefined> {
  const db = await getDb();
  try {
    await db.query('BEGIN');
    
    // Validate variant belongs to model (if both provided)
    if (data.listing.vehicleVariantId && data.listing.vehicle_model_id) {
      const { rows } = await db.query(
        'SELECT model_id FROM vehicle_variants WHERE id = $1',
        [data.listing.vehicleVariantId]
      );
      if (!rows.length) throw new AppError('validation', 'Invalid vehicleVariantId: variant not found');
      if (rows[0].model_id !== data.listing.vehicle_model_id) {
        throw new AppError('validation', 'vehicleVariantId does not belong to the selected model');
      }
    }
    
    const updated = await this.update(id, data.listing);
    if (data.attributes) {
      await this.setAttributes(id, data.attributes);
    }
    await db.query('COMMIT');
    return updated;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}
```

### Route Handler Changes

**File:** `backend/src/routes/listings.ts`

```typescript
// POST /listings
router.post('/', auth(), rateLimiter('publishListing'), zValidator('json', createListingSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');
  permissionService.requireCapability('listing:publish', user);
  
  const category = await categoryRepo.findById(body.category_id);
  if (!category) throw AppError.notFound('Category not found');
  
  const baseSlug = generateSlug(body.title);
  const slug = await ensureUniqueSlug(baseSlug);
  
  const listing = await listingRepo.createWithRelations({
    listing: {
      user_id: user.id,
      category_id: body.category_id,
      vehicle_model_id: body.vehicleModelId,
      vehicle_variant_id: body.vehicleVariantId ?? null,
      year: body.year ?? null,
      mileage: body.mileage ?? null,
      title: body.title,
      slug,
      description: body.description,
      price: body.price,
      price_type: body.price_type || 'fixed',
      province_id: body.province_id ?? null,
      city_id: body.city_id ?? null,
    },
    attributes: body.attributes,
    images: body.images,
  });
  
  await outboxWriter.write({ /* ... */ });
  return c.json({ success: true, data: listing }, 201);
});

// PUT /listings/:id
router.put('/:id', auth(), zValidator('json', updateListingSchema), async (c) => {
  const id = parseInt(c.req.param('id')!, 10);
  const body = c.req.valid('json');
  const user = c.get('user');
  
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound('Listing not found');
  if (listing.user_id !== user.id) throw AppError.forbidden();
  
  const updated = await listingRepo.updateWithRelations(id, {
    listing: body, // extract listing fields
    attributes: body.attributes,
  });
  
  cache.invalidate(`listing:${listing.slug}`);
  cache.invalidatePattern('listings:');
  // ... outbox
  return c.json({ success: true, data: updated });
});
```

### Schema updates

```typescript
// The update schema should NOT omit attributes anymore:
const updateListingSchema = createListingSchema.partial().omit({ images: true });
// attributes stays included
```

---

## P4 — Add Brand → Model → Variant as Dedicated Step

### Step Layout Change

**File:** `nextjs-frontend/src/components/listing/ListingForm/index.tsx`

```typescript
// BEFORE:
const STEPS = ['دسته‌بندی', 'اطلاعات پایه', 'مشخصات', 'تصاویر', 'پیش‌نمایش'];

// AFTER:
const STEPS = ['دسته‌بندی', 'برند و مدل', 'اطلاعات پایه', 'مشخصات فنی', 'تصاویر', 'پیش‌نمایش'];
```

### New State

```typescript
const [vehicleModelId, setVehicleModelId] = useState<number | null>(null);
const [vehicleVariantId, setVehicleVariantId] = useState<number | null>(null);
```

### New Component: `Step2BrandModel.tsx`

**Location:** `nextjs-frontend/src/components/listing/ListingForm/Step2BrandModel.tsx`

**Logic:**

```typescript
'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { SearchableSelect } from '@/components/common/SearchableSelect';

interface Step2BrandModelProps {
  categorySlug: string | null;
  onBrandChange: (brandId: number | null) => void;
  onModelChange: (modelId: number | null) => void;
  onVariantChange: (variantId: number | null) => void;
  selectedBrand: number | null;
  selectedModel: number | null;
  selectedVariant: number | null;
}

export function Step2BrandModel({
  categorySlug, onBrandChange, onModelChange, onVariantChange,
  selectedBrand, selectedModel, selectedVariant
}: Step2BrandModelProps) {
  
  const { data: brands } = useQuery({
    queryKey: ['vehicles', 'brands', categorySlug],
    queryFn: async () => {
      const res = await api.get(`/vehicles/brands?category=${categorySlug}`);
      return res.data.data;
    },
    enabled: !!categorySlug,
    staleTime: 120000,
  });

  const { data: models } = useQuery({
    queryKey: ['vehicles', 'models', selectedBrand, categorySlug],
    queryFn: async () => {
      const res = await api.get(`/vehicles/brands/${selectedBrand}/models?category=${categorySlug}`);
      return res.data.data;
    },
    enabled: !!selectedBrand,
    staleTime: 120000,
  });

  const { data: variants } = useQuery({
    queryKey: ['vehicles', 'variants', selectedModel],
    queryFn: async () => {
      const res = await api.get(`/vehicles/models/${selectedModel}/variants`);
      return res.data.data;
    },
    enabled: !!selectedModel,
    staleTime: 120000,
  });

  return (
    <div className="space-y-8">
      <div>
        <label>برند</label>
        <SearchableSelect
          options={brands?.map(b => ({ value: b.id, label: b.name })) || []}
          value={selectedBrand}
          onChange={onBrandChange}
          placeholder="برند را انتخاب کنید"
        />
      </div>
      {selectedBrand && (
        <div>
          <label>مدل</label>
          <SearchableSelect
            options={models?.map(m => ({ value: m.id, label: m.name })) || []}
            value={selectedModel}
            onChange={onModelChange}
            placeholder="مدل را انتخاب کنید"
          />
        </div>
      )}
      {selectedModel && variants?.length > 0 && (
        <div>
          <label>تیپ (اختیاری)</label>
          <SearchableSelect
            options={variants.map(v => ({ value: v.id, label: v.name }))}
            value={selectedVariant}
            onChange={onVariantChange}
            placeholder="تیپ را انتخاب کنید (در صورت وجود)"
          />
          <p className="text-xs text-muted-foreground mt-1">
            اگر تیپ دقیق را نمی‌دانید، این مرحله را خالی بگذارید
          </p>
        </div>
      )}
    </div>
  );
}
```

### Main Form Integration

```typescript
// ListingForm/index.tsx — in the render
{step === 0 && <Step1Category selected={categoryId} onSelect={setCategoryId} disabled={isEditMode} />}
{step === 1 && categorySlug && (
  <Step2BrandModel
    categorySlug={categorySlug}
    selectedBrand={selectedBrand}
    selectedModel={selectedModel}
    selectedVariant={selectedVariant}
    onBrandChange={setSelectedBrand}
    onModelChange={setSelectedModel}
    onVariantChange={setSelectedVariant}
  />
)}
{step === 2 && <Step2Basic data={basicData} onChange={setBasicData} />}
{step === 3 && categorySlug && (
  <Step3Attributes categorySlug={categorySlug} values={attributes} onChange={setAttributes} />
)}
{step === 4 && (
  <Step4Images /* ... */ />
)}
{step === 5 && (
  <Step5Preview data={{ ...basicData, category_id: categoryId, attributes }} /* ... */ />
)}
```

### Step2Basic Updates

**File:** `nextjs-frontend/src/components/listing/ListingForm/Step2Basic.tsx`

Add `year` and `mileage` fields:
```typescript
// Add to form fields inside YearGlassSelect range
const YEARS = Array.from({ length: 50 }, (_, i) => String(1370 + i));

// Year select
<GlassSelect
  value={data.year || ''}
  onChange={(val) => onChange({ ...data, year: val })}
  options={YEARS.map(y => ({ value: y, label: y }))}
  placeholder="سال ساخت"
/>

// Mileage input
<input
  type="number"
  value={data.mileage || ''}
  onChange={(e) => onChange({ ...data, mileage: e.target.value })}
  placeholder="کارکرد (کیلومتر)"
  className={inputSelectClasses}
/>
```

---

## P5 — Rewrite Brand/Model Filters via JOIN

### Problem
Current filters use `EXISTS` on `listing_attributes` for brand/model.  
After P1, these are no longer in EAV — they're in the taxonomy tables.

### Changes

**File:** `backend/src/repositories/listing.ts`

```typescript
// REMOVE these (no longer in listing_attributes):
// - 'brand' filter
// - 'model' filter

// REPLACE with JOIN-based filters:

if (filters.brand) {
  wheres.push(`EXISTS (SELECT 1 FROM vehicle_models vm
    JOIN brands b ON b.id = vm.brand_id
    WHERE vm.id = l.vehicle_model_id AND b.slug = $${p++})`);
  params.push(filters.brand);
}

if (filters.model) {
  wheres.push(`EXISTS (SELECT 1 FROM vehicle_models vm
    WHERE vm.id = l.vehicle_model_id AND vm.slug = $${p++})`);
  params.push(filters.model);
}
```

> **Note:** Uses `b.slug = $x` (exact match) not `ILIKE`, because:
> - Better index utilization
> - Deterministic behavior
> - Frontend sends slug, not display name

**Same change in `search()` method** (lines ~468-475).

**File:** `backend/src/domain/infrastructure/listing/ListingRepository.impl.ts` (v2 domain layer)

```typescript
// BEFORE (line 59-60):
if (query.brandId) {
  conditions.push(`EXISTS (SELECT 1 FROM listing_attributes la JOIN attributes a ... AND a.name = 'brand' AND la.value::int = $${idx++})`);
}
if (query.modelId) {
  conditions.push(`EXISTS (SELECT 1 FROM listing_attributes la JOIN attributes a ... AND a.name = 'model' AND la.value::int = $${idx++})`);
}

// AFTER:
if (query.brandId) {
  conditions.push(`EXISTS (SELECT 1 FROM vehicle_models vm JOIN brands b ON b.id = vm.brand_id WHERE vm.id = l.vehicle_model_id AND b.id = $${idx++})`);
  params.push(query.brandId);
}
if (query.modelId) {
  conditions.push(`EXISTS (SELECT 1 FROM vehicle_models vm WHERE vm.id = l.vehicle_model_id AND vm.id = $${idx++})`);
  params.push(query.modelId);
}
```

---

## P6 — Replace Static JSON with API Calls

### Current State
`lib/taxonomy-data.json` (237KB) contains all brands and models.  
Loaded by `lib/taxonomy.ts` functions `getBrandsByCategory()` and `getModelsByBrand()`.  
Used in `FilterPanel.tsx`, category pages, and listing pages.

### Changes

1. **Delete** `lib/taxonomy-data.json`

2. **Rewrite** `lib/taxonomy.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useBrandsByCategory(slug: string | null) {
  return useQuery({
    queryKey: queryKeys.vehicles.brands(slug),
    queryFn: async () => {
      const res = await api.get(`/vehicles/brands?category=${slug}`);
      return res.data.data as Array<{ id: number; name: string; slug: string; logo?: string }>;
    },
    enabled: !!slug,
    staleTime: 300000,
  });
}

export function useModelsByBrand(brandId: number | null, categorySlug: string | null) {
  return useQuery({
    queryKey: queryKeys.vehicles.models(brandId, categorySlug),
    queryFn: async () => {
      const res = await api.get(`/vehicles/brands/${brandId}/models?category=${categorySlug}`);
      return res.data.data as Array<{ id: number; name: string; slug: string }>;
    },
    enabled: !!brandId && !!categorySlug,
    staleTime: 300000,
  });
}
```

3. **Add query keys** to `lib/queryKeys.ts`:
```typescript
vehicles: {
  brands: (slug: string | null) => ['vehicles', 'brands', slug],
  models: (brandId: number | null, slug: string | null) => ['vehicles', 'models', brandId, slug],
  variants: (modelId: number | null) => ['vehicles', 'variants', modelId],
},
```

4. **Update** `FilterPanel.tsx`:
```typescript
// BEFORE:
import { getBrandsByCategory, getModelsByBrand } from '@/lib/taxonomy';
const brands = getBrandsByCategory(selectedCategorySlug);
const models = getModelsByBrand(selectedBrandSlug, selectedCategorySlug);

// AFTER:
import { useBrandsByCategory, useModelsByBrand } from '@/lib/taxonomy';
const { data: brands } = useBrandsByCategory(selectedCategorySlug);
const { data: models } = useModelsByBrand(selectedBrandId, selectedCategorySlug);
```

5. **Update** `categories/[slug]/page.tsx` and `listings/page.tsx` — same pattern.

6. **Filter URL params** — use `slug` not `id` or `name`:
```
?brand=bmw&model=series-3
```

---

## Execution Order

```
P0 → P1 → P1b → P2 → P3 → P4 → P5 → P6
```

Rationale:
- P0: Independent bugfix, lowest risk
- P1: Schema changes needed before anything else can work
- P1b: Seed data depends on schema
- P2: State refactor needed before form can work with seeded data
- P3: Transaction support needed for stability
- P4: New step depends on P2 state refactor
- P5: Filter rewrite depends on P1 schema
- P6: Independent, can be done anytime after P4

---

## Files Summary (22 files, 8 steps)

| Step | File | Action |
|------|------|--------|
| P0 | `backend/src/repositories/listing.ts` | Edit (16 lines) |
| P1 | `backend/migrations/032_listing_columns.sql` | **Create** |
| P1 | `backend/src/repositories/listing.ts` | Edit (add fields, rewrite filters) |
| P1 | `backend/src/routes/listings.ts` | Edit (add schema fields) |
| P1b | `backend/scripts/seed-attributes.mjs` | **Create** |
| P2 | `ListingForm/index.tsx` | Edit (state type) |
| P2 | `Step3Attributes.tsx` | Edit (key handler) |
| P2 | `Step5Preview.tsx` | Edit (display) |
| P2 | `backend/src/routes/listings.ts` | Edit (schema) |
| P2 | `backend/src/repositories/listing.ts` | Edit (setAttributes) |
| P3 | `backend/src/repositories/listing.ts` | Edit (createWithRelations, updateWithRelations) |
| P3 | `backend/src/routes/listings.ts` | Edit (use new methods) |
| P4 | `ListingForm/index.tsx` | Edit (STEPS, brand/model state) |
| P4 | `Step2BrandModel.tsx` | **Create** |
| P4 | `Step2Basic.tsx` | Edit (add year/mileage) |
| P4 | `Step3Attributes.tsx` | Edit (shift to step index 3) |
| P5 | `backend/src/repositories/listing.ts` | Edit (brand/model filter) |
| P5 | `ListingRepository.impl.ts` | Edit (brandId/modelId filter) |
| P6 | `lib/taxonomy-data.json` | **Delete** |
| P6 | `lib/taxonomy.ts` | Edit (API-driven) |
| P6 | `lib/queryKeys.ts` | Edit (add vehicle keys) |
| P6 | `FilterPanel.tsx` | Edit (useQuery) |
| P6 | `categories/[slug]/page.tsx` | Edit |
| P6 | `listings/page.tsx` | Edit |
