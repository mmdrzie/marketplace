# طرح کاتالوگ تیونینگ (Catalog Tuning) — نسخه ۸ (LOCKED)

## هدف
اضافه کردن بخش قطعات تیونینگ به بازارگاه با معماری **Generic Catalog Domain**:
- کاربر با دو مسیر وارد بخش تیونینگ می‌شود: «همه قطعات تیونینگ» یا «جستجو با برند و مدل خودرو»
- دسته‌بندی سه‌سطحی: نوع وسیله ← گروه (موتور، دورچین موتور، زیربندی و...) ← نوع قطعه (پیستون، شاتون، کیت مکش، هدرز و...)
- بدون ساخت Aggregate موازی: یک جدول `parts` واحد برای همه قطعات
- زیرساخت عمومی برای کاتالوگ‌های آینده (Audio، Lighting، Camping، Detailing و...) بدون Migration ساختاری

---

## ۱. تصمیمات معماری

| موضوع | تصمیم |
|---|---|
| موجودیت قطعه | یک جدول `parts` — بدون `tuning_parts`، بدون `part_kind` (رد Parallel Aggregate) |
| نوع قطعه | Lookup `part_types` (الگوی `content_types`) — slug immutable، `is_active`، قابل گسترش با INSERT |
| دسته‌بندی | `catalog_categories` + `catalog_types` — عمومی برای همه کاتالوگ‌ها |
| ویژگی اختصاصی تیونینگ | `part_specs` عمومی — schema تیونینگ داخل JSONB با `schema_version` |
| Inventory / فروشنده / پیشنهاد | صفر تغییر ساختاری — همه روی FK موجود `store_inventory` |
| سازگاری مدل | استفاده مجدد کامل از `part_compatible_models` |
| path / depth | توسط Trigger دیتابیس تولید می‌شود (نه Seeder، نه Frontend) |
| ادمین | یک پنل کاتالوگ + تب‌های `part_types` — بدون CRUD جدا برای Lookupها |
| API | Generic: `/v2/catalogs/{slug}/...` — نه `/v2/tuning/*` |
| URL | `/catalog/tuning/...` + ریدایرکت 308 از `/tuning` |

---

## ۲. جریان‌های کاربری

### جریان ورود (`/catalog/tuning`)
```
/catalog/tuning
├── کارت ۱: همه قطعات تیونینگ        → /catalog/tuning/parts
└── کارت ۲: جستجو با برند و مدل خودرو → /catalog/tuning/search
```

### مسیر ۱ — همه قطعات تیونینگ (`/catalog/tuning/parts`)
```
سایدبار ۳ سطحی (وسیله ← گروه ← نوع قطعه)
+ فیلتر اختیاری برند/مدل/سال (VehicleSelector)
+ باکس جستجوی متنی
+ گرید نتایج (PartCard با بج part_type)
```

### مسیر ۲ — ویزارد جستجوی خودرو (`/catalog/tuning/search` — کوئری‌محور)
```
مرحله ۱: انتخاب برند ← مدل ← سال (VehicleSelector)
مرحله ۲: انتخاب گروه (کارت) + چیپ‌های نوع قطعه داخل هر گروه
         مثال: دورچین موتور ← [کیت مکش، هدرز، پولی سبک، کاور موتور]
               موتور        ← [پیستون، شاتون، میل‌لنگ، ...]
مرحله ۳: نتایج — لیست قطعات فیلترشده با چیپ‌های قابل تعویض نوع قطعه
         + دکمه تغییر خودرو/گروه + جستجوی متنی
```

### جزئیات قطعه (`/catalog/tuning/parts/[id]`)
- تصویر، شماره قطعه، OEM، سازنده، گارانتی، توضیحات
- جدول Specs تیونینگ: Stage، بازه افزایش HP/تورک، Boost/AFR/Lambda، نمودار داینو، نیاز به ریمپ/نصب تخصصی
- رندر بر اساس schema در `part_specs` — برای کاتالوگ‌های آینده فقط رندر جدید لازم است
- سازگاری برند/مدل/سال + `StorePriceTable` (فروشندگان با لینک چت)

---

## ۳. معماری دیتابیس — `049_catalog_domain.sql`

```sql
-- ۱) LOOKUP: part_types — slug immutable، قابل گسترش با INSERT
CREATE TABLE part_types (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label TEXT NOT NULL, icon TEXT, color TEXT,
  sort_order INT NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ۲) LOOKUP: catalog_types — ثابت (Configuration)، نسخه‌دار
CREATE TABLE catalog_types (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label TEXT NOT NULL, icon TEXT, color TEXT,
  sort_order INT NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{"hero":{},"theme":{},"filters":{},"landing":{}}',
  settings_version INT NOT NULL DEFAULT 1
);

-- ۳) دسته‌بندی — path/depth با Trigger
CREATE TABLE catalog_categories (
  id BIGSERIAL PRIMARY KEY,
  catalog_type_id BIGINT NOT NULL REFERENCES catalog_types(id) ON DELETE RESTRICT,
  parent_id BIGINT REFERENCES catalog_categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL CHECK (slug = LOWER(slug) AND slug ~ '^[a-z0-9-]+$'),
  title TEXT NOT NULL, title_en TEXT,
  description TEXT, description_en TEXT, icon TEXT,
  path TEXT NOT NULL,            -- 'tuning/car/engine-dressing' ← Trigger
  depth INT NOT NULL DEFAULT 0,  -- ۰ = ریشه
  sort_order INT NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ        -- Soft Delete
);

-- fn_catalog_cat_derive: BEFORE INSERT/UPDATE — با CTE بازگشتی، path و depth را
-- از زنجیره والدها می‌سازد (شامل prefx slug کاتالوگ)
-- trg_catalog_cat_derive_after: AFTER UPDATE OF slug, parent_id — آبشار اصلاح
-- path/depth همه فرزندان زیردرخت

CREATE UNIQUE INDEX uq_catalog_cat_path  ON catalog_categories(path);
CREATE UNIQUE INDEX uq_catalog_cat_root  ON catalog_categories(catalog_type_id, slug)
  WHERE parent_id IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX uq_catalog_cat_child ON catalog_categories(parent_id, slug)
  WHERE parent_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_catalog_cat_type_parent_order ON catalog_categories(catalog_type_id, parent_id, sort_order);
CREATE INDEX idx_catalog_cat_parent   ON catalog_categories(parent_id);
CREATE INDEX idx_catalog_cat_path_trgm ON catalog_categories USING GIN (path gin_trgm_ops);
-- pg_trgm از migration 005 موجود است (بوت‌استرپ)

-- ۴) parts — عضویت کاتالوگ (Nullable: قطعات OEM عضو هیچ کاتالوگی نیستند)
ALTER TABLE parts ADD COLUMN part_type_id BIGINT REFERENCES part_types(id) ON DELETE RESTRICT;
UPDATE parts SET part_type_id = (SELECT id FROM part_types WHERE slug='aftermarket');
ALTER TABLE parts ALTER COLUMN part_type_id SET NOT NULL;
ALTER TABLE parts ADD COLUMN catalog_category_id BIGINT REFERENCES catalog_categories(id) ON DELETE RESTRICT;
-- بدون ستون دنرمالایز catalog_type_id → همیشه JOIN (بدون Trigger، بدون Drift)

-- ۵) SPECS عمومی — یک جدول برای همه کاتالوگ‌ها
CREATE TABLE part_specs (
  id BIGSERIAL PRIMARY KEY,
  part_id BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  catalog_type_id BIGINT NOT NULL REFERENCES catalog_types(id) ON DELETE RESTRICT,
  specs JSONB NOT NULL DEFAULT '{"schema_version":1}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (part_id, catalog_type_id)
);
CREATE INDEX idx_part_specs_catalog ON part_specs(catalog_type_id);

-- ۶) پیشنهادات فروشنده
ALTER TABLE part_suggestions ADD COLUMN part_type_id BIGINT REFERENCES part_types(id) ON DELETE RESTRICT;
UPDATE part_suggestions SET part_type_id = (SELECT id FROM part_types WHERE slug='aftermarket');
ALTER TABLE part_suggestions ALTER COLUMN part_type_id SET NOT NULL;
ALTER TABLE part_suggestions ADD COLUMN catalog_category_id BIGINT REFERENCES catalog_categories(id) ON DELETE RESTRICT;
```

### Schema `part_specs.specs` برای تیونینگ (schema_version: 1)
```json
{
  "schema_version": 1,
  "stage_label": "Stage 2",
  "horsepower_gain": { "min": 15, "max": 20 },
  "torque_gain": { "min": 18, "max": 25 },
  "performance_metrics": { "boost": "1.2 bar", "afr": "12.5", "lambda": "0.85" },
  "dyno_charts": [ { "type": "stock", "url": "..." } ],
  "ecu_required": false,
  "professional_install": false,
  "notes": ""
}
```
اعتبارسنجی schema در لایه سرویس بک‌اند انجام می‌شود.

---

## ۴. دیتای Seed (`seed-catalog-tuning.mjs` — idempotent)

### ۴.۱ Lookupها (ON CONFLICT DO UPDATE)
- `part_types`: oem (اصلی)، aftermarket (تأمینی)، performance (تیونینگ)، racing (مسابقه‌ای)، universal (یونیورسال) — قابل گسترش با INSERT
- `catalog_types`: tuning (is_public=true)، audio، lighting، camping، detailing، accessory

### ۴.۲ درخت دسته‌بندی تیونینگ (بدون path — Trigger می‌سازد)
| نوع وسیله (depth 0) | گروه‌ها (depth 1) | انواع قطعه (depth 2) |
|---|---|---|
| خودرو `car` | موتور `engine` | پیستون، شاتون، میل‌لنگ، میل سوپاپ، رینگ پیستون، تسمه/زنجیر تایمینگ، واشر سرسیلندر |
| | دورچین موتور `engine-dressing` | کیت مکش، هدرز، پولی سبک، کاور موتور، بادگیر |
| | زیربندی و تعلیق `suspension` | کمک‌فنر اسپرت، فنر اسپرت، بوش پلی‌اورتان، میل موجگیر |
| | اگزوز `exhaust` | اگزوز اسپرت، تیوب اگزوز، منیفولد اگزوز، کاتالیزور اسپرت |
| | ترمز `brakes` | دیسک اسپرت، لنت اسپرت، کالیپر، شلنگ ترمز فولادی |
| | ECU و برق `ecu` | چیپ تیونینگ، ریمپ ECU، فلش ECU |
| | گیربکس و کلاچ `drivetrain` | کیت کلاچ اسپرت، دیفرانسیل LSD، فلایویل سبک |
| | بدنه و آیرودینامیک `body` | کیت بدنه، اسپویلر، رکاب |
| کامیون `truck` | موتور، زیربندی، اگزوز، ترمز، ECU، گیربکس | ... |
| موتورسیکلت `motorcycle` | موتور، دورچین موتور، زیربندی، اگزوز، ترمز، گیربکس | ... |
| راه‌سازی `construction` | موتور، زیربندی، اگزوز، ترمز، ECU | ... |
| کشاورزی `agricultural` | موتور، زیربندی، اگزوز، ترمز | ... |

### ۴.۳ قطعات نمونه (~۵۰)
- درج در `parts` با `part_type_id=performance` + `catalog_category_id`
- `part_specs` با schema تیونینگ
- سازگاری برند/مدل/سال در `part_compatible_models`

---

## ۵. API

```
عمومی:
GET /v2/catalogs                          → کاتالوگ‌های is_public && is_active
GET /v2/catalogs/:slug                    → جزئیات + settings/settings_version
GET /v2/catalogs/:slug/categories         → درخت (depth) + تعداد قطعه هر دسته
GET /v2/catalogs/:slug/categories/:id     → دسته با id + فرزندان
GET /v2/catalogs/:slug/parts              → فیلتر: vehicle, category(id), brand_id, model_id, year, q, page, limit, sort
GET /v2/catalogs/:slug/parts/:id          → جزئیات + part_specs + سازگاری
GET /v2/catalogs/:slug/parts/:id/stores   → فروشندگان (از store_inventory — بدون تغییر)

فروشنده: بدون endpoint جدید (inventory موجود، با ارسال part از هر دو کاتالوگ)

ادمین:
GET/POST/PUT/DELETE /admin/catalog-categories?type=tuning   → CRUD عمومی + Soft Delete
/admin/parts                              → موجود، با فیلدهای part_type_id / catalog_category_id / part_specs
بدون /admin/catalog-types و بدون /admin/part-types CRUD   (Lookupها Configuration هستند)
```

Query core: محدوده کاتالوگ = `JOIN catalog_categories cc ON p.catalog_category_id = cc.id` + فیلتر با `cc.path LIKE 'tuning/%'` (GIN trgm) یا `cc.catalog_type_id = ?`؛ زیردسته‌ها با `path` prefix یا `depth`.

---

## ۶. فرانت‌اند

### صفحات (روت: `/catalog/tuning`)
| مسیر | محتوا |
|---|---|
| `/tuning` → 308 | ریدایرکت به `/catalog/tuning` |
| `/catalog/tuning` | صفحه ورود: ۲ کارت (همه قطعات / جستجوی برند و مدل) — از `/v2/catalogs` تغذیه می‌شود |
| `/catalog/tuning/parts` | مسیر ۱: سایدبار ۳ سطحی + فیلتر اختیاری برند/مدل + جستجو + گرید |
| `/catalog/tuning/search` | مسیر ۲: ویزارد کوئری‌محور ۳ مرحله‌ای + چیپ‌های قابل تعویض |
| `/catalog/tuning/parts/[id]` | جزئیات + جدول Specs (بر اساس schema) + `StorePriceTable` |

### هوک‌ها (`hooks/useCatalogs.ts` — عمومی)
`useCatalogs`، `useCatalog`، `useCatalogCategories`، `useCatalogParts`، `useCatalogPart`، `useCatalogPartStores`

### کامپوننت‌ها
- جدید: `CatalogEntry`، `CatalogSidebar` (۳ سطحی)، `TuningGroupSelector`، `TuningFilterChips`، `CatalogSpecsTable`
- استفاده مجدد: `VehicleSelector`، `PartCard` (با بج از `part_types`)، `PartSearchBar`، `StorePriceTable`

### منوها
لینک «قطعات تیونینگ» → `/catalog/tuning` در: `app/(public)/layout.tsx`، `Sidebar`، `Dock`، `MobileIslandNav`، `Footer`، ناوبری داشبورد و دیلر. منو می‌تواند از `/v2/catalogs` تغذیه شود.

### فروشنده
بدون تغییر — قطعات تیونینگ خودکار در جستجوی `PartsSelector` ظاهر می‌شوند (همان جدول `parts`).

### ادمین
- `/admin/parts`: تب‌های `part_types` (همه/اصلی/تأمینی/تیونینگ/مسابقه‌ای) + فرم واحد با انتخابگر دسته ۳ سطحی و ویرایش `part_specs`
- `/admin/parts/categories`: تب «دسته‌بندی کاتالوگ» — CRUD درخت با Soft Delete (path/depth توسط Trigger)

---

## ۷. ADR-011 — Generic Catalog Domain Architecture

محتویات مستند `docs/adr/ADR-011-catalog-domain.md`:
1. چرا Aggregate جدید نساختیم (رد `tuning_parts` — Parallel Aggregate)
2. چرا Catalog Domain عمومی (`catalog_categories` = سلسله‌مراتب عمومی کاتالوگ تجارت)
3. چرا Lookup Tables (`part_types`، `catalog_types` — slug immutable، Configuration نه Data)
4. چرا JSONB + `schema_version` — استراتژی Expand → Migrate → Contract
5. چرا API Generic (`/v2/catalogs/{slug}/...`) — Controller فقط Facade است؛ منطق Query در `PartsService`
6. چرا path/depth با Trigger (یک منبع حقیقت؛ Seeder/Frontend هرگز path نمی‌نویسند)
7. چرا آینده Audio/Camping/... بدون Migration اضافه می‌شود (فقط Seed + رندر جدید)
8. گزینه‌های ردشده: `tuning_parts` جدا، `tuning_categories` مستقل، `is_tuning` boolean، `part_kind` در inventory
9. ایندکس‌ها: UNIQUE(path) = B-tree برای `path = / ORDER BY` + GIN trgm برای `LIKE` + ترکیبی `(catalog_type_id, parent_id, sort_order)`
10. i18n آتی (`title_en`/`description_en` از ابتدا) و Localization plan

---

## ۸. فایل‌های جدید / تغییرات

| نوع | فایل |
|---|---|
| Migration | `backend/migrations/049_catalog_domain.sql` |
| Seed | `backend/scripts/seed-catalog-tuning.mjs` |
| بک‌اند | `backend/src/domain/presentation/catalog/CatalogController.ts` (جدید)، متدهای جدید در `partsService.ts`، `backend/src/routes/v2-catalogs.ts` (جدید)، اکستنشن `admin.ts` و `index.ts` |
| فرانت | `hooks/useCatalogs.ts`، `components/catalog/*`، `app/(public)/catalog/tuning/*`، ریدایرکت `/tuning`، منوها، فرم ادمین |
| مستندات | `docs/adr/ADR-011-catalog-domain.md` |

---

## ۹. فازهای اجرا

1. Migration `049_catalog_domain.sql` + دیپلوی Supabase
2. Seed `seed-catalog-tuning.mjs` + اجرا (idempotent)
3. بک‌اند: `CatalogController` (Facade) + متدهای `partsService` + `routes/v2-catalogs.ts` + اکستنشن ادمین
4. هوک‌ها و کامپوننت‌ها
5. صفحات `/catalog/tuning/*` + ریدایرکت + منوها
6. پنل ادمین (تب‌ها + فرم واحد + دسته‌بندی با Soft Delete)
7. `docs/adr/ADR-011-catalog-domain.md` + کامپایل/تست/دیپلوی

---

## نکته: قفل اسکیما
اسکیمای دیتابیس این پلن قفل نهایی شده است (Migration شماره 049). تغییرات ساختاری بعدی در قالب ADR و برای نسخه‌های آینده ثبت می‌شوند، نه بازنویسی این Migration.
