# طرح Content Domain یکپارچه
## تبدیل Articles به سیستم محتوای واحد (News + Encyclopedia + ...)

---

## هدف
جایگزینی دو سیستم مجزای فرضی (articles + encyclopedia_articles) با یک **Content Domain واحد** با قابلیت:
- پشتیبانی از ۱۰ نوع محتوا (NEWS, GUIDE, HOW_TO, MAINTENANCE, GLOSSARY, TECH_SPEC, REVIEW, COMPARISON, BUYING_GUIDE, FAQ)
- اتصال محتوا به هر موجودیت (Brand, Model, Variant, Part, Category, Listing, Dealer)
- دسته‌بندی درختی مشترک
- بوکمارک و تاریخچه مطالعه کاربران
- آماده برای CMS تیمی (Draft → Review → Scheduled → Published → Archived)

---

## معماری

### اصل اساسی: Expand → Migrate → Contract
- جدول `articles` **تغییر نام نمی‌یابد** — فقط ستون اضافه می‌شود
- API قدیمی `/v2/articles` هنوز کار می‌کند (فیلتر `content_type = news`)
- API جدید `/v2/contents` همه محتواها را پشتیبانی می‌کند
- تغییر نام جدول (در صورت نیاز) ← فاز جداگانه در آینده

### اسم Domain
**`Content`** — نه `KnowledgeContent` و نه `Article`. چون این Domain شامل همه انواع محتوا می‌شود.

---

## دیتابیس

### ۱. `content_types` (Lookup table جایگزین ENUM)

```sql
CREATE TABLE content_types (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label       TEXT NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);
```

| slug | label | icon | color |
|------|-------|------|-------|
| news | اخبار | newspaper | `#3B82F6` |
| guide | راهنما | book-open | `#10B981` |
| how_to | آموزش | tools | `#8B5CF6` |
| maintenance | نگهداری | wrench | `#F59E0B` |
| glossary | واژه‌نامه | book-type | `#EC4899` |
| tech_spec | مشخصات فنی | cpu | `#06B6D4` |
| review | بررسی | star | `#F97316` |
| comparison | مقایسه | columns | `#6366F1` |
| buying_guide | راهنمای خرید | shopping-cart | `#14B8A6` |
| faq | پرسش‌های متداول | help-circle | `#84CC16` |

### ۲. `articles` (Expand — فقط افزودن ستون)

ستون‌های جدید:

| ستون | نوع | توضیح |
|------|------|--------|
| `content_type_id` | BIGINT → content_types(id) | نوع محتوا |
| `category_id` | BIGINT → content_categories(id) | دسته‌بندی درختی |
| `author_id` | UUID → users(id) | نویسنده (اتصال به کاربر) |
| `status` | TEXT (`draft,review,scheduled,published,archived`) | چرخه انتشار |
| `meta_title` | TEXT | سئو |
| `meta_description` | TEXT | سئو |
| `canonical_url` | TEXT | سئو |
| `og_image` | TEXT | سئو (Open Graph) |
| `robots` | TEXT DEFAULT 'index,follow' | سئو |
| `extra_seo` | JSONB DEFAULT '{}' | سئو پویا |
| `difficulty` | TEXT (`beginner,intermediate,expert`) | فقط برای GUIDE/HOW_TO |
| `scheduled_at` | TIMESTAMPTZ | انتشار زمان‌دار |

> `reading_time` قبلاً وجود دارد — حفظ می‌شود و هنگام انتشار محاسبه می‌گردد.

### ۳. `content_categories` (دسته‌بندی درختی)

```sql
CREATE TABLE content_categories (
  id          BIGSERIAL PRIMARY KEY,
  parent_id   BIGINT REFERENCES content_categories(id),
  slug        TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  path        TEXT,      -- materialized path e.g. "knowledge/engine/oil"
  sort_order  INT NOT NULL DEFAULT 0
);
```

- **parent_id**: سازگار با الگوی categories در پروژه (adjacency list)
- **path**: materialized path برای خواندن سریع زیردرخت‌ها

### ۴. جداول ارتباطی

| جدول | توضیح |
|------|--------|
| `content_tags` | تگ‌های قابل استفاده مجدد |
| `content_tag_map` | many-to-many محتوا ↔ تگ |
| `content_links` | **Polymorphic**: محتوا ↔ (BRAND, MODEL, VARIANT, PART, CATEGORY, LISTING, DEALER) |
| `content_relations` | many-to-many محتوا ↔ محتوا (دوطرفه در لایه Repository) |
| `user_saved_contents` | بوکمارک کاربران |

### ۵. ایندکس‌های کلیدی

```sql
-- مقالات بر اساس نوع محتوا
CREATE INDEX idx_articles_content_type ON articles(content_type_id);

-- content_links برای جستجوی "همه محتوای مربوط به BMW"
CREATE INDEX idx_content_links_entity ON content_links(entity_type, entity_id);

-- content_categories برای پیمایش درخت
CREATE INDEX idx_content_categories_path ON content_categories(path);
```

---

## بک‌اند (Backend)

### لایه‌بندی

```
src/domain/
├── entities/
│   └── content/
│       ├── Content.entity.ts          ← جایگزین Article.entity
│       └── Content.repository.ts      ← interface جدید
├── infrastructure/
│   └── content/
│       └── ContentRepository.impl.ts  ← پیاده‌سازی با JOIN‌های جدید
├── services/
│   └── contentService.ts              ← logic: TOC generation, reading_time, relations
└── presentation/
    └── content/
        └── ContentController.ts       ← ۱۰+ متد
```

### ContentController — متدهای کلیدی

| متد | توضیح |
|------|--------|
| `list(c, type?)` | لیست محتوا با فیلتر نوع |
| `get(slug)` | جزئیات کامل + relations + tags + links |
| `getByEntity(entityType, entityId)` | همه محتوای مربوط به یک موجودیت |
| `getRelated(id)` | محتوای مرتبط |
| `getByCategory(categoryId)` | محتوای یک دسته‌بندی |
| `bookmark/save` | ذخیره توسط کاربر |
| `getBookmarks(userId)` | بوکمارک‌های کاربر |
| `incrementViews(id)` | افزایش بازدید |

### مسیرهای API

```
روت‌های فعلی (بدون تغییر):
  GET  /v2/articles          ← articles با content_type = news
  GET  /v2/articles/:slug    ← جزئیات (backward compat)

روت‌های جدید:
  GET    /v2/contents              ← همه محتواها (فیلتر: ?type=guide&category=...)
  GET    /v2/contents/:slug        ← جزئیات کامل
  POST   /v2/contents              ← ایجاد (ادمین)
  PATCH  /v2/contents/:id          ← ویرایش
  DELETE /v2/contents/:id          ← حذف (soft)

  GET    /v2/contents/types        ← لیست content_types
  GET    /v2/contents/categories   ← درخت دسته‌بندی

  GET    /v2/contents/entity/:type/:id  ← محتوای مرتبط با موجودیت
  GET    /v2/contents/:id/related       ← محتوای مرتبط

  POST   /v2/contents/:id/bookmark     ← بوکمارک
  DELETE /v2/contents/:id/bookmark     ← حذف بوکمارک
  GET    /v2/contents/bookmarks        ← بوکمارک‌های من
```

### Backward Compatibility

فایل `v2-articles.ts` باقی می‌ماند و از `ContentController` با فیلتر `type=news` استفاده می‌کند:

```ts
// v2-articles.ts — بدون تغییر در قرارداد API
router.get('/', (c) => contentController.list(c, 'news'));
router.get('/:slug', (c) => contentController.get(c));
```

---

## فرانت‌اند (Frontend)

### تایپ‌های جدید

```ts
// types/content.ts
interface Content {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  contentType: ContentTypeSlug;  // 'news' | 'guide' | 'how_to' | ...
  category: ContentCategory | null;
  author: { id: string; name: string } | null;
  status: ContentStatus;
  tags: ContentTag[];
  links: ContentLink[];
  relatedContents: Content[];
  isSaved?: boolean;
  readingTime: number;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  viewCount: number;
  publishedAt: string;
  createdAt: string;
}
```

### کامپوننت‌ها

| کامپوننت | جایگزین | توضیح |
|-----------|---------|--------|
| `ContentCard` | `NewsCard` | رندر تطبیقی بر اساس `content_type` |
| `ContentTypeBadge` | — | نشان نوع محتوا با آیکون + رنگ |
| `ContentSidebar` | `ArticleSidebar` | فیلتر بر اساس type + category + tag |
| `ContentDetail` | — | رندر تطبیقی (TOC برای GUIDE، مشخصات برای TECH_SPEC) |
| `DifficultyBadge` | — | سطح دشواری (فقط برای GUIDE/HOW_TO) |
| `BookmarkButton` | — | ذخیره/حذف از بوکمارک |

### مسیرهای جدید

| مسیر | توضیح |
|------|--------|
| `/news` | بدون تغییر — مقالات با type=news |
| `/news/[slug]` | بدون تغییر — جزئیات خبر |
| `/encyclopedia` | **جدید** — نمایش GUIDES, GLOSSARY, TECH_SPEC, BUYING_GUIDE |
| `/encyclopedia/[slug]` | **جدید** — جزئیات محتوای دانشنامه |
| `/encyclopedia/category/[id]` | **جدید** — فیلتر دسته‌بندی |
| `/content/[slug]` | **جدید** — رندر universal بر اساس نوع محتوا |

---

## فازهای اجرایی

### Phase 1 — Expand Schema ✅ (آماده اجرا)

| گام | وضعیت |
|-----|--------|
| ۱. Migration 048 (جداول جدید + ALTER articles) | ✅ نوشته شده |
| ۲. Seed content_types | ✅ داخل Migration |
| ۳. Backfill مقالات موجود → `content_type = news` | ✅ داخل Migration |
| ۴. اعمال Migration روی Supabase | ⏳ |

### Phase 2 — Repository

| گام | توضیح |
|-----|--------|
| ۱. Content.entity.ts | Entity جدید با contentType/status/links/relations |
| ۲. Content.repository.ts | interface با findAll/findByType/findByEntity/getBookmarks |
| ۳. ContentRepository.impl.ts | JOIN‌های content_types, content_tag_map, content_links, content_relations |
| ۴. contentService.ts | TOC generation, reading_time calc, relation bidirectionality |

### Phase 3 — API

| گام | توضیح |
|-----|--------|
| ۱. ContentController.ts | list + get + getByEntity + getRelated + bookmark + ... |
| ۲. v2-contents.ts | مسیرهای جدید |
| ۳. v2-articles.ts refactor | استفاده از ContentController با filter=news |
| ۴. container.ts | ثبت وابستگی‌های جدید |

### Phase 4 — Frontend Types + Hooks

| گام | توضیح |
|-----|--------|
| ۱. types/content.ts | تایپ‌های جدید |
| ۲. queryKeys.ts | keys برای contents |
| ۳. useContents.ts | hooks: useContents, useContent, useContentByEntity, ... |
| ۴. useBookmarks.ts | hooks: useBookmarks, useSaveContent |

### Phase 5 — Frontend Components

| گام | توضیح |
|-----|--------|
| ۱. ContentCard | جایگزین NewsCard با رندر تطبیقی |
| ۲. ContentTypeBadge | آیکون + رنگ بر اساس نوع |
| ۳. ContentSidebar | جایگزین ArticleSidebar |
| ۴. ContentDetail | رندر تطبیقی جزئیات |
| ۵. BookmarkButton | دکمه ذخیره |

### Phase 6 — Encyclopedia Pages

| گام | توضیح |
|-----|--------|
| ۱. /encyclopedia/page.tsx | لیست محتوای دانشنامه |
| ۲. /encyclopedia/[slug]/page.tsx | جزئیات با TOC + Difficulty |
| ۳. /encyclopedia/category/[id]/page.tsx | فیلتر دسته‌بندی |

### Phase 7 — News Pages Refactor

| گام | توضیح |
|-----|--------|
| ۱. /news/page.tsx | استفاده از ContentCard به جای NewsCard |
| ۲. /news/[slug]/page.tsx | استفاده از ContentDetail |

### Phase 8 — Bookmarks + History

| گام | توضیح |
|-----|--------|
| ۱. /profile/bookmarks/page.tsx | لیست بوکمارک‌ها |
| ۲. reading_history | (اختیاری — ذخیره در localStorage یا API) |

---

## تصمیمات معماری

| موضوع | تصمیم | دلیل |
|--------|--------|------|
| Rename جدول | **فعلاً خیر** | Expand → Migrate → Contract — ریسک کمتر |
| content_type | **Lookup table** | عدم نیاز به ALTER TYPE برای اضافه کردن نوع جدید |
| entity links | **Polymorphic** (entity_type + entity_id) | مقیاس‌پذیری برای موجودیت‌های آینده |
| دسته‌بندی | **parent_id + path** | parent_id برای سازگاری، path برای سرعت |
| status | **CHECK constraint** | تعداد محدود و ثابت |
| difficulty | **TEXT + CHECK + nullable** | فقط برای GUIDE/HOW_TO |
| SEO | **ستون مجزا + extra_seo JSONB** | queryability + flexibility |
| TOC | **تولید در زمان Publish** | عدم نیاز به Sync |
| reading_time | **محاسبه در Publish** | دقت + عدم نیاز به محاسبه مکرر |
| relations | **دوطرفه در Repository** | سادگی در استفاده |
| Comments | **فعلاً خیر** | هزینه نگهداری > ارزش در نسخه اول |