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

### فاز ۶: Mock → API واقعی ✅
- [x] Fleet: ایجاد جدول `fleet_vehicles` + ۳ endpoint در backend
- [x] Fleet: رفع `fleetStore` → اتصال به API واقعی
- [x] Parts: ایجاد جدول `parts` + ۲ endpoint در backend
- [x] Parts: رفع `partStore` → اتصال به API واقعی
- [x] Tenders: اتصال frontend به `GET /tenders` موجود (حذف وابستگی به `tenderStore`)
- [x] Escrow/Deals: ایجاد جدول `escrow_deals` + endpoint در backend
- [x] Escrow/Deals: رفع `escrowStore` → اتصال به API
- [x] Service Logs: ایجاد `useServiceLogs` hook برای fleet service logs
- [x] TradeInWidget: حذف کامل (بی‌استفاده)
- [ ] ~~Analytics charts: جایگزینی random با داده واقعی~~ نیاز به endpoint جدید backend (per-listing views)
- [x] Dashboard home: جایگزینی activities mock با real recent actions

### فاز ۷: رفع کامپوننت باگ‌ها ✅
- [x] SellerCard: trust score هاردکد `8` → `reviews_count` از seller (اگر نبود ۰)
- [x] ListingCard: badge imported — قبلاً اصلاح شده بود (`category_slug` استفاده می‌کرد)
- [x] Footer: social icons placeholder → لینک واقعی (ایتا، بله، آپارات)
- [x] Public layout: `id="main-content"` + `pt-16` (رفع overlap Dock)
- [x] ConversationList: اصلاح `useEffect` deps (`data?.data` spread → `data` پایدار)
- [x] `useConversations`: یکسان‌سازی `res.data` → `res.data.data` (هماهنگ با `useConversation`)
- [x] CompareBar: `height: 'auto'` → `maxHeight: 200` (انیمیت صحیح)
- [x] AuthProvider: `useEffect([ ])` → `[token, isAuthenticated, setUser, logout]`
- [x] Public layout: `pt-16` برای رفع overlap Dock
- [x] ChatRoom: حذف VoiceRecorder (کامپوننت + state + دکمه)

### فاز ۸: ESLint Cleanup ✅
- [x] رفع ۳۴ error (no-explicit-any در ۱۱ فایل، set-state-in-effect، purity)
- [x] رفع ۵۷ warning (imports بی‌استفاده، deps، img-element، jsx-a11y)
- [x] تنظیم `--max-warnings 0` در lint script
- [x] نتیجه نهایی: 0 error, 0 warning

### فاز ۹: Upload + Images ✅
- [x] Backend `uploads.ts`: رفع response به `upload_url` + `object_key` + `public_url`
- [x] Backend: اضافه کردن `@aws-sdk/client-s3` و `@aws-sdk/s3-request-presigner` برای presigned URL واقعی
- [x] Backend: Active کردن S3 presigned URL generation
- [x] Backend: تغییر `z.string().url()` به `z.string()` در schema تصاویر برای پشتیبانی local + S3
- [x] Frontend `ImageUploader.tsx`: استفاده از `public_url` به عنوان object key
- [x] Frontend `ListingForm/index.tsx`: حذف `POST /listings/:id/images` — ارسال تصاویر درون payload اصلی
- [x] نتیجه: آپلود از طریق presigned + ذخیره URL در POST /listings

### فاز ۱۰: تنظیمات دپلوی (فایل‌های کد)
- [x] `backend/vercel.json` + `api/index.ts` با `hono/vercel` از قبل وجود دارد
- [x] `nextjs-frontend/vercel.json` نیازی نیست (Next.js خودکار)
- [x] `backend/.env.example` و `nextjs-frontend/.env.example` از قبل وجود دارد
- [x] Production Cleanup:
  - [x] حذف `NEXT_PUBLIC_DEMO_MODE` از `.env.local`
  - [x] حذف `demo-token-` از `AuthProvider.tsx`
  - [x] حذف تست mock fallback از `useListings.test.tsx`
  - [x] بقیه موارد (`demoLogin`, `DEMO_USERS`, `isDemoMode`, `mockData.ts`, role cards, MOCK fallback) قبلاً حذف شده بودند

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
