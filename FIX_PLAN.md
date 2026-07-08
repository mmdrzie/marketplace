# FIX_PLAN — برنامه تعمیر کد (توسط هوش مصنوعی)

> تمام کارهای این فایل **توسط هوش مصنوعی انجام می‌شود**.
> کارهایی که نیاز به دسترسی انسانی دارند در `HUMAN_TODO.md` هستند.
> تاریخ شروع: ۱۴۰۵/۰۴/۱۸

---

## 🎯 محدوده کار

رفع ۸۹ مشکل کد + دپلوی روی Vercel + Supabase.
شامل: اصلاح endpointهای اشتباه، یکسان‌سازی typeها، حذف mock data، تکمیل صفحات، ESLint cleanup، تنظیم فایل‌های دپلوی.

---

## 📋 فازهای اجرایی

### فاز ۱: Foundation — Type System
- [ ] ایجاد `nextjs-frontend/src/types/backend.ts` با تایپ‌های منطبق بر پاسخ بک‌اند
- [ ] ایجاد `nextjs-frontend/src/lib/transformers.ts` برای تبدیل `BackendListing` → `Listing`
- [ ] تغییر `User.id` از `number` به `string` در `authStore.ts` + `types/user.ts`
- [ ] تغییر `Listing.category` از nested به flat: `category_name`, `category_slug`
- [ ] تغییر `Listing.province` از nested به `province_name`
- [ ] اضافه کردن `seller_name`, `seller_id` به `Listing`
- [ ] اصلاح `price_type`: `'free'` → `'auction'`
- [ ] اصلاح `status` مقادیر: `'active'` → `'published'`
- [ ] اصلاح `ListingCard` برای کار با فیلدهای flat
- [ ] اصلاح `RelatedListings`, `ListingDetail` و هر جایی که `listing.category?.name` دارد

### فاز ۲: رفع Endpointهای اشتباه
- [ ] `useListings.ts`: `GET /my-listings` → `GET /listings?scope=me`
- [ ] `useListings.ts`: `POST /listings/:id/submit` → `PATCH /listings/:id {action:'submit'}`
- [ ] `useListings.ts`: `POST /listings/:id/mark-sold` → `PATCH /listings/:id {action:'sold'}`
- [ ] `useListings.ts`: `POST /listings/:id/renew` → `PATCH /listings/:id {action:'renew'}`
- [ ] `useListings.ts`: اصلاح `queryKeys` اشتباه در `onSuccess`
- [ ] `dashboard/page.tsx`: `GET /me` → `GET /auth/me`
- [ ] `wallet/page.tsx`: `GET /me` → `GET /auth/me`
- [ ] `settings/page.tsx`: `PUT /me` → `PUT /auth/me`
- [ ] `(dealer)/dealer/listings/page.tsx`: `GET /dealer/listings` → `GET /listings?scope=me`
- [ ] `notifications/page.tsx`: `POST /mark-all-read` → `PUT /read-all`
- [ ] `admin/listings/page.tsx`: `GET /admin/listings` → `GET /listings` (با auth)
- [ ] `admin/listings/page.tsx`: `POST /approve` → `PATCH /listings/:id {action:'approve'}`
- [ ] `admin/listings/page.tsx`: `POST /reject` → `PATCH /listings/:id {action:'reject'}`
- [ ] `admin/page.tsx`: `GET /admin/listings/pending` → `GET /listings?status=pending`
- [ ] حذف `POST /me/avatar` (ادغام فیلد avatar در `PUT /auth/me`)
- [ ] حذف `POST /listings/:id/images` از Step4Images (ادغام در POST /listings اصلی)
- [ ] ایجاد endpoint جدید در backend: `GET /me/notification-preferences`
- [ ] ایجاد endpoint جدید در backend: `PUT /me/notification-preferences`
- [ ] ایجاد endpoint جدید در backend: `POST /payments/deposit`

### فاز ۳: رفع ListingForm
- [ ] Step3Attributes: رفع `useCategorySlug` — به جای جستجو در MOCK_CATEGORIES، از prop `categorySlug` که parent پاس می‌کند استفاده کند
- [ ] ListingForm/index.tsx: عبور `categorySlug` به Step3Attributes بعد از انتخاب دسته
- [ ] Step5Preview: رفع دریافت `categoryName`, `cityName`, `provinceName` از طریق props
- [ ] ListingForm/index.tsx: resolve کردن نام‌ها از لیست categories و cities
- [ ] حذف document upload از Step3Attributes (فیچر مرده)
- [ ] Step1Category: اضافه کردن loading skeleton هنگام fetch
- [ ] Step1Category: اضافه کردن error toast
- [ ] Step2Basic: اصلاح `JSX` import (`react/jsx-runtime` → `react`)
- [ ] Step3Attributes: اصلاح `JSX` import
- [ ] Step2Basic: اصلاح `price_type` options: `'free'` → `'auction'`

### فاز ۴: Search + Filter
- [ ] اصلاح `useSearch`: ارسال پارامترهای `q, category, province, min_price, max_price`
- [ ] اصلاح `useListings`: ارسال `category` به عنوان ID عددی، نه slug
- [ ] اصلاح `RelatedListings`: ارسال `category` به عنوان ID عددی
- [ ] اصلاح `FilterPanel` L201: گارد `.map()` روی `MOCK_CITIES[provinceId]` که ممکن است undefined باشد
- [ ] Search بدون `q`: مسیریابی به `GET /listings` به جای `GET /search`
- [ ] اصلاح hardcoded سال ۱۴۰۵ → مقدار داینامیک از `new Date()`

### فاز ۵: Error States + صفحات گمشده
- [ ] ایجاد `nextjs-frontend/src/app/(auth)/verify-email/page.tsx`
- [ ] ایجاد `nextjs-frontend/src/app/(dashboard)/dashboard/settings/notifications/page.tsx`
- [ ] Admin sidebar: حذف لینک‌های صفحاتی که وجود ندارند (moderation, categories, attributes, provinces)
- [ ] Admin page: اضافه کردن ErrorBoundary
- [ ] Admin listings: اضافه کردن pagination
- [ ] Admin listings: اضافه کردن error handling به mutations
- [ ] Admin users: اضافه کردن error handling به mutations
- [ ] Admin reports: اضافه کردن pagination + error handling
- [ ] Admin: اصلاح `queryClient.invalidateQueries` از string keys → `queryKeys`
- [ ] `useSearch`: تغییر `retry: 0` → `retry: 2`
- [ ] `RelatedListings`: اضافه کردن error state با دکمه retry
- [ ] `ChatRoom`: catch خالی → نمایش toast error
- [ ] `(dealer)/dealer/listings`: اضافه کردن error + loading state

### فاز ۶: Mock → API واقعی
- [ ] Fleet: ایجاد جدول `fleet_vehicles` + ۳ endpoint در backend
- [ ] Fleet: رفع `fleetStore` → اتصال به API واقعی
- [ ] Parts: ایجاد جدول `parts` + ۲ endpoint در backend
- [ ] Parts: رفع `partStore` → اتصال به API واقعی
- [ ] Tenders: اتصال frontend به `GET /tenders` موجود (حذف وابستگی به `tenderStore`)
- [ ] Escrow/Deals: ایجاد جدول `escrow_deals` + endpoint در backend
- [ ] Escrow/Deals: رفع `escrowStore` → اتصال به API
- [ ] Service Logs: ایجاد endpoint + رفع `serviceLogStore`
- [ ] TradeInWidget: حذف کامل (بی‌استفاده)
- [ ] Analytics charts: جایگزینی random با داده واقعی از `GET /dealer/stats`
- [ ] Dashboard home: جایگزینی activities mock با real recent actions

### فاز ۷: رفع کامپوننت باگ‌ها
- [ ] SellerCard: trust score هاردکد `8` → محاسبه واقعی
- [ ] ListingCard: badge imported اصلاح `category?.slug?.startsWith` → `category_slug?.startsWith`
- [ ] Footer: حذف social icons placeholder (یا اضافه کردن لینک واقعی)
- [ ] Public layout: اضافه کردن `id="main-content"` به `<main>` برای skip-to-content
- [ ] ConversationList: اصلاح `useEffect` deps که spread شده و باعث re-subscribe بی‌مورد می‌شود
- [ ] `useConversations`: یکسان‌سازی `res.data` با `useConversation` (هر دو `res.data.data`)
- [ ] CompareBar: رفع Framer Motion `height: 'auto'` → انیمیت صحیح
- [ ] AuthProvider: اصلاح `useEffect([ ])` → اضافه کردن `logout, setUser` به deps
- [ ] Public layout: اصلاح overlap Dock با اضافه کردن `pt-16`
- [ ] ChatRoom: حذف یا تکمیل voice recording (blob گرفته می‌شود اما ارسال نمی‌شود)

### فاز ۸: ESLint Cleanup
- [ ] رفع ۱۲ مورد `@typescript-eslint/no-explicit-any` در `useListings.ts` و `useNotifications.ts`
- [ ] رفع `react-hooks/exhaustive-deps` در `AuthProvider.tsx`
- [ ] رفع ۲۴ warning باقی‌مانده (imports بی‌استفاده، متغیرهای تعریف‌نشده، و...)
- [ ] تنظیم `--max-warnings 0` در lint script

### فاز ۹: Upload + Images
- [ ] Step4Images: تکمیل انتگراسیون با `POST /upload/presigned` و Supabase Storage
- [ ] Step4Images: حذف `POST /listings/:id/images` (endpoint وجود ندارد)
- [ ] Step4Images: ادغام آپلود تصاویر درون `POST /listings` (آپلود بعد از ایجاد listing)

### فاز ۱۰: تنظیمات دپلوی (فایل‌های کد)
- [ ] ایجاد `backend/vercel.json` با کانفیگ Hono.js Edge Functions
- [ ] ایجاد `nextjs-frontend/vercel.json` (در صورت نیاز)
- [ ] ایجاد `backend/.env.example` با placeholderها
- [ ] ایجاد `nextjs-frontend/.env.example` با placeholderها
- [ ] Production Cleanup (کد):
  - [ ] حذف `demoLogin()` از `useAuth.ts`
  - [ ] حذف `DEMO_USERS`, `DEMO_TOKEN` از `useAuth.ts`
  - [ ] حذف role selection cards از login page
  - [ ] حذف `isDemoMode` از `api.ts`
  - [ ] حذف `mockData.ts` (کل فایل)
  - [ ] حذف MOCK fallback از `useListings.ts`
  - [ ] حذف MOCK fallback از `useChat.ts`
  - [ ] حذف MOCK fallback از `useNotifications.ts`
  - [ ] حذف شرط `NEXT_PUBLIC_DEMO_MODE !== 'true'`

---

## 🗺 وابستگی فازها

```
فاز ۱ (تایپ‌ها) ──→ فاز ۲ (endpointها) ──→ فاز ۳ (ListingForm)
     │                                        │
     └──→ فاز ۴ (Search) ──→ فاز ۵ (Error states)
                                        │
               فاز ۷ (Component bugs) ←──┘
                                        │
               فاز ۶ (Mock→API) ──────────┘
                                        │
               فاز ۸ (ESLint) ────────────┘
                                        │
               فاز ۹ (Upload) ───────────┘
                                        │
               فاز ۱۰ (Deploy configs) ──┘
```

---

## 📊 آمار

| فاز | فایل‌های جدید | فایل‌های اصلاحی | فایل‌های حذفی |
|-----|-------------|----------------|--------------|
| فاز ۱ | ۲ | ~۱۵ | ۰ |
| فاز ۲ | ۰ | ~۱۲ | ۰ |
| فاز ۳ | ۰ | ~۸ | ۱ |
| فاز ۴ | ۰ | ~۵ | ۰ |
| فاز ۵ | ۳ (+admin pages) | ~۱۰ | ۰ |
| فاز ۶ | ~۸ | ~۸ | ۴ |
| فاز ۷ | ۰ | ~۱۰ | ۰ |
| فاز ۸ | ۰ | ~۴ | ۰ |
| فاز ۹ | ۰ | ~۳ | ۰ |
| فاز ۱۰ | ۴ | ~۱۰ | ~۵ |
| **مجموع** | **~۱۷** | **~۸۵** | **~۱۰** |

---

## ✅ بایدها و نبایدهای کدنویسی

- **نباید** از `any` استفاده شود
- **نباید** mock data در production کد باشد
- **نباید** خطا بی‌صدا بلعیده شود
- **باید** همه endpointها از `{ success, data/error }` پیروی کنند
- **باید** همه API calls error handling داشته باشند
- **باید** `tsc --noEmit` و `eslint` پاس شوند
