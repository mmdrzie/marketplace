# طرح بازطراحی بخش قطعات یدکی (Spare Parts)

## هدف
ایجاد یک فروشگاه قطعات یدکی کامل با قابلیت:
- فروشنده ثبت‌نام + آپلود مدارک + تأیید ادمین
- فروشنده مدیریت انبار و پیشنهاد قطعه جدید
- کاربر جستجو در کاتالوگ قطعات با دو مسیر ورود
- ادمین مدیریت کامل دسته‌بندی، کاتالوگ و تأیید درخواست‌ها

---

## ۱. جریان‌های کاربری

### جریان ثبت فروشگاه (Store Registration)
```
۱. کاربر ثبت‌نام می‌کند (role = store)
۲. به پنل فروشگاه هدایت می‌شود → /store/register
     └── فرم: نام فروشگاه، توضیحات، آدرس، تلفن
     └── آپلود مدارک: کارت ملی + جواز کسب (اجباری)
۳. ادمین در پنل /admin/stores می‌بیند
     └── مشاهده مدارک آپلود شده
     └── تأیید (فعال شدن فروشگاه) / رد با یادداشت
۴. بعد از تأیید → فروشنده می‌تواند قطعه به انبارش اضافه کند
     └── قبل از تأیید → پیغام "در انتظار تأیید مدارک"
```

### جریان فروشنده (Store Owner)
```
ورود به پنل /store/
├── مشاهده وضعیت تأیید مدارک
├── مدیریت انبار (CRUD روی store_inventory)
│     ├── قطعه در کاتالوگ هست → انتخاب از لیست + قیمت/موجودی خودش
│     └── قطعه در کاتالوگ نیست → پیشنهاد به ادمین
├── پیشنهادات ارسال شده (مشاهده وضعیت)
└── ویرایش پروفایل فروشگاه
```

### جریان کاربر عادی
```
دو مسیر ورود:
├── /stores → لیست فروشگاه‌ها → انتخاب → /stores/[slug]
│     └── مشاهده پروفایل فروشگاه + تمام قطعات آن فروشگاه
│
└── /parts → کاتالوگ قطعات
      ├── سایدبار: انتخاب نوع وسیله (خودرو/کامیون/...) → زیردسته
      ├── فیلتر: برند + مدل + سال
      ├── جستجوی متنی
      └── هر قطعه → نام فروشگاه‌هایی که دارند + قیمت + دکمه استعلام
```

### جریان ادمین (Admin)
```
پنل /admin/
├── /stores → درخواست‌های فروشگاه (تأیید/رد)
├── /parts → مدیریت کاتالوگ قطعات (CRUD)
├── /parts/categories → مدیریت دسته‌بندی قطعات (CRUD)
└── /parts/suggestions → پیشنهادات فروشندگان (تأیید/رد)
```

---

## ۲. معماری دیتابیس

> **نکته:** `brands.id` و `vehicle_models.id` در دیتابیس واقعی از نوع `BIGINT` هستند (نه `UUID`)، چون جدول `brands` قبل از میگریشن 025 که با `UUID` تعریف شده بود ایجاد شده است. بنابراین همه FKهای جدید `BIGINT` هستند.

### Migration 043 — `store_profiles.sql`
```sql
CREATE TABLE store_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  store_name    TEXT NOT NULL,
  store_slug    TEXT NOT NULL UNIQUE,
  description   TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  logo          TEXT DEFAULT '',
  cover_image   TEXT DEFAULT '',
  documents     TEXT[] DEFAULT '{}',   -- مسیر فایل‌های آپلود شده
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  admin_note    TEXT DEFAULT '',
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Migration 044 — `parts_categories.sql`
```sql
CREATE TABLE parts_categories (
  id          SERIAL PRIMARY KEY,
  parent_id   INT REFERENCES parts_categories(id),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  icon        VARCHAR(100) DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**ساختار درخت (۵ شاخه اصلی + زیرشاخه‌ها):**
```
قطعات یدکی (root)
├── خودرو (car)
│   ├── قطعات موتور (car-engine)
│   ├── قطعات گیربکس (car-transmission)
│   ├── قطعات ترمز (car-brake)
│   ├── قطعات بدنه (car-body)
│   ├── قطعات تعلیق (car-suspension)
│   ├── قطعات برقی (car-electrical)
│   ├── قطعات خنک‌کننده (car-cooling)
│   ├── قطعات سوخت‌رسانی (car-fuel)
│   ├── قطعات اگزوز (car-exhaust)
│   ├── قطعات فرمان (car-steering)
│   ├── قطعات تهویه (car-ac)
│   ├── لاستیک و رینگ (car-tires)
│   ├── روغن و سیالات (car-fluids)
│   └── لوازم جانبی (car-accessories)
├── کامیون (truck) ← زیرشاخه‌ها مشابه خودرو با پیشوند truck-
├── موتورسیکلت (motorcycle) ← زیرشاخه‌ها مشابه با پیشوند motorcycle-
├── ماشین‌آلات راهسازی (construction) ← مشابه با پیشوند construction-
└── ماشین‌آلات کشاورزی (agricultural) ← مشابه با پیشوند agricultural-
```

### Migration 045 — `parts_enhanced.sql` (FAILED — rolled back)
```sql
-- PRODUCED ERROR: brand_id UUID REFERENCES brands(id) failed because
-- brands.id is BIGINT, not UUID. Migration 045 was fully rolled back.
```

### Migration 046 — `parts_enhanced_fix.sql` (applied)
```sql
-- Same columns/tables as 045 but WITHOUT FK constraints:
ALTER TABLE parts ADD COLUMN parts_category_id INT;
ALTER TABLE parts ADD COLUMN brand_id BIGINT;     -- ← BIGINT, not UUID
ALTER TABLE parts ADD COLUMN model_id BIGINT;
ALTER TABLE parts ADD COLUMN year_from INT DEFAULT 0;
ALTER TABLE parts ADD COLUMN year_to INT DEFAULT 0;
ALTER TABLE parts ADD COLUMN oem_number TEXT DEFAULT '';
ALTER TABLE parts ADD COLUMN images TEXT[] DEFAULT '{}';
```

### Migration 047 — `fix_brand_id_type.sql` (applied)
```sql
-- 046 created brand_id as UUID (wrong), so 047 fixes to BIGINT:
ALTER TABLE parts DROP COLUMN brand_id;
ALTER TABLE parts ADD COLUMN brand_id BIGINT;

-- Recreate part_compatible_models (dropped & recreated with BIGINT brand_id)
-- Recreate part_suggestions (dropped & recreated with BIGINT brand_id, UUID store_id)
```

---

## ۳. API Endpoints

> همه مسیرها با پیشوند `/api/v1` در دسترس هستند.

### Public (`/api/v1/v2/parts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/v2/parts/categories` | درخت دسته‌بندی قطعات |
| GET | `/api/v1/v2/parts/categories/:slug` | یک دسته با زیرشاخه‌ها |
| GET | `/api/v1/v2/parts` | لیست قطعات (فیلتر: category, brand_id, model_id, year, q, price_min/max) |
| GET | `/api/v1/v2/parts/search/vehicle` | قطعات سازگار با خودرو (brand_id + model_id + year) |
| GET | `/api/v1/v2/parts/:id` | جزئیات قطعه + فروشندگان دارای موجودی |
| GET | `/api/v1/v2/parts/:id/stores` | فروشندگان یک قطعه (قیمت + موجودی) |
| GET | `/api/v1/v2/parts/stores` | لیست فروشگاه‌های تأیید شده |
| GET | `/api/v1/v2/parts/stores/:slug` | پروفایل فروشگاه + موجودی قطعاتش |

### Store (auth: store, `/api/v1/store`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/store/register` | ثبت فروشگاه + آپلود مدارک |
| GET | `/api/v1/store/profile` | پروفایل فروشگاه من |
| PUT | `/api/v1/store/profile` | ویرایش پروفایل |
| GET | `/api/v1/store/inventory` | موجودی من |
| POST | `/api/v1/store/inventory` | افزودن قطعه به انبارم (part_id + price + stock) |
| PUT | `/api/v1/store/inventory/:id` | ویرایش آیتم انبار |
| DELETE | `/api/v1/store/inventory/:id` | حذف از انبار |
| POST | `/api/v1/store/suggestions` | پیشنهاد قطعه جدید به کاتالوگ |
| GET | `/api/v1/store/suggestions` | لیست پیشنهادات من |
| GET | `/api/v1/store/stats` | آمار فروشگاه |
| GET | `/api/v1/store/subscription` | وضعیت اشتراک |

### Admin (auth: admin, `/api/v1/admin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/admin/stores` | درخواست‌های فروشگاه (فیلتر status) |
| PUT | `/api/v1/admin/stores/:id/approve` | تأیید فروشگاه |
| PUT | `/api/v1/admin/stores/:id/reject` | رد فروشگاه (body: `{note}`) |
| GET | `/api/v1/admin/parts` | کاتالوگ قطعات |
| POST | `/api/v1/admin/parts` | ایجاد قطعه جدید |
| PUT | `/api/v1/admin/parts/:id` | ویرایش قطعه |
| DELETE | `/api/v1/admin/parts/:id` | حذف قطعه |
| GET | `/api/v1/admin/parts-categories` | دسته‌بندی قطعات |
| POST | `/api/v1/admin/parts-categories` | ایجاد دسته جدید |
| PUT | `/api/v1/admin/parts-categories/:id` | ویرایش دسته |
| DELETE | `/api/v1/admin/parts-categories/:id` | حذف دسته |
| GET | `/api/v1/admin/parts/suggestions` | پیشنهادات فروشندگان |
| PUT | `/api/v1/admin/parts/suggestions/:id/approve` | تأیید پیشنهاد |
| PUT | `/api/v1/admin/parts/suggestions/:id/reject` | رد پیشنهاد (body: `{note}`) |

---

## ۴. صفحات فرانت‌اند

### عمومی (Public)

1. **`/parts`** — کاتالوگ قطعات
   - سایدبار راست: درخت دسته‌بندی (۵ شاخه اصلی + زیرشاخه‌ها)
   - باکس جستجو: متن + VehicleSelector (برند → مدل → سال)
   - گرید قطعات با: نام، دسته، OEM، تگ فروشندگان، قیمت از/تا، دکمه استعلام

2. **`/parts/categories/[slug]`** — قطعات یک دسته خاص

3. **`/parts/[id]`** — جزئیات قطعه
   - تصاویر، نام، OEM number، دسته‌بندی
   - بخش "فروشندگان این قطعه": جدول (نام فروشگاه، قیمت، موجودی، دکمه استعلام)
   - بخش "مدل‌های سازگار": برند/مدل/سال
   - قطعات مرتبط

4. **`/stores`** — لیست فروشگاه‌ها
   - کارت هر فروشگاه: لوگو، نام، تعداد قطعات، وضعیت
   - جستجو در فروشگاه‌ها

5. **`/stores/[slug]`** — فروشگاه اختصاصی
   - هدر: لوگو، نام، توضیحات، آدرس، تلفن
   - جستجو داخل فروشگاه
   - لیست قطعات فروشگاه با قیمت و موجودی

### پنل فروشنده (`/store/*`)

6. **`/store`** — داشبورد
   - اگر ثبت‌نام نکرده → لینک به /store/register
   - اگر در انتظار تأیید → پیغام + وضعیت
   - اگر تأیید شده → آمار موجودی

7. **`/store/register`** — فرم ثبت فروشگاه
   - نام فروشگاه، توضیحات، آدرس، تلفن
   - آپلود مدارک: کارت ملی + جواز کسب (با DocumentUploader)
   - دکمه "ارسال برای بررسی"

8. **`/store/profile`** — ویرایش پروفایل

9. **`/store/inventory`** — مدیریت موجودی (الان وجود دارد + بهبود)
   - فیلتر بر اساس دسته قطعه
   - نمایش برند/مدل سازگار

10. **`/store/inventory/new`** — افزودن قطعه به انبار
    - حالت ۱: جستجو در کاتالوگ → انتخاب → قیمت/موجودی خودش
    - حالت ۲: "قطعه مورد نظر در کاتالوگ نیست؟" → لینک به پیشنهاد جدید

11. **`/store/suggestions`** — پیشنهادات من
12. **`/store/suggestions/new`** — فرم پیشنهاد قطعه جدید

### پنل ادمین (`/admin/*`)

13. **`/admin/stores`** — مدیریت درخواست‌های فروشگاه
    - جدول: نام، فروشنده، تاریخ ثبت، مدارک (لینک مشاهده)، وضعیت
    - دکمه‌های تأیید/رد با مودال تأیید + یادداشت

14. **`/admin/parts`** — مدیریت کاتالوگ قطعات
    - جدول CRUD + جستجو و فیلتر

15. **`/admin/parts/categories`** — مدیریت دسته‌بندی قطعات
    - نمایش درختی با ایجاد/ویرایش/حذف

16. **`/admin/parts/suggestions`** — بررسی پیشنهادات
    - تب‌های: در انتظار / تأیید شده / رد شده
    - مودال جزئیات + دکمه تأیید/رد

---

## ۵. کامپوننت‌های جدید

```
components/parts/
├── PartsCategoryTree.tsx       # درخت دسته‌بندی (recursive, expand/collapse)
├── PartsCategoryCard.tsx       # کارت دسته در صفحه اصلی
├── PartsFilterSidebar.tsx      # سایدبار فیلتر (دسته + برند + مدل + سال)
├── PartCard.tsx                # کارت قطعه (بازطراحی شده با نام فروشگاه)
├── PartDetailStores.tsx        # جدول فروشندگان در صفحه جزئیات
├── PartCompatibilityBadge.tsx  # تگ‌های برند/مدل سازگار
├── VehicleSelector.tsx         # انتخاب خودرو (برند → مدل → سال)
├── PartSearchBar.tsx           # نوار جستجوی ترکیبی
└── PartSuggestForm.tsx         # فرم پیشنهاد قطعه جدید

components/store/
├── StoreCard.tsx               # کارت فروشگاه در /stores
├── StoreHeader.tsx             # هدر فروشگاه در /stores/[slug]
├── StoreRegistrationForm.tsx   # فرم ثبت فروشگاه
├── DocumentUploader.tsx        # آپلود مدارک با پیش‌نمایش
└── StoreInventoryFilter.tsx    # فیلتر موجودی فروشنده
```

---

## ۶. دیتای Seed

### `seed-parts-categories.mjs`
- ایجاد ۵ شاخه اصلی (خودرو، کامیون، موتورسیکلت، راه‌سازی، کشاورزی)
- ایجاد ۱۴ زیرشاخه برای هر کدام (مجموعاً ~۷۰ دسته)

### `seed-parts-v2.mjs`
- ایجاد ~۱۵۰ قطعه با اتصال به:
  - `parts_category_id` (دسته قطعه)
  - `brand_id` + `model_id` (برند/مدل خودرو)
  - `part_compatible_models` (سازگاری چندگانه)

---

## ۷. فایل‌های بک‌اند جدید

```
backend/src/
├── routes/
│   ├── v2-parts.ts              ← public parts + stores routes (/v2/parts)
│   └── index.ts                 ← mounts v2-parts at /v2/parts
├── domain/
│   ├── presentation/
│   │   └── parts/
│   │       └── PartsController.ts
│   └── services/
│       └── partsService.ts
```

تغییرات در فایل‌های موجود:
- `backend/src/routes/store.ts` — افزودن `/register`, `/profile`, `/suggestions`, `/stats`
- `backend/src/routes/admin.ts` — افزودن `/stores/*`, `/parts/*`, `/parts-categories/*`, `/parts/suggestions/*`
- `backend/src/routes/index.ts` — افزودن `import { partsV2Router }` و `router.route('/v2/parts', partsV2Router)`
- `backend/src/container.ts` — ثبت `PartsController` و `partsService` و `storeController`
