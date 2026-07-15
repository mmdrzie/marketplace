# برنامه جامع رفع مشکلات Marketplace
> تاریخ: ۲۰۲۶-۰۷-۱۵
> منبع: حسابرسی کامل کد (بیش از ۲۰۰ فایل بررسی شد)
> تعداد کل مشکلات: ۸۳ (۹ بحرانی، ۲۸ High، ۳۰ Medium، ۱۶ Low)

---

## فهرست فازها

| فاز | عنوان | مدت تخمینی | وابستگی |
|-----|-------|-----------|---------|
| ۰ | پیش‌نیازها و محیط توسعه | ۲ روز | — |
| ۱ | بحرانی‌های Auth و امنیت | ۳ روز | فاز ۰ |
| ۲ | حذف دیتای جعلی (Mock Data) | ۵ روز | فاز ۱ |
| ۳ | باگ‌های بک‌اند | ۴ روز | فاز ۱ |
| ۴ | رفع عدم تطابق فرانت‌اند و بک‌اند | ۴ روز | فاز ۱, ۲ |
| ۵ | Type System و Transformerها | ۳ روز | فاز ۴ |
| ۶ | سرویس‌های خارجی (Email, SMS, Payment) | ۵ روز | فاز ۵ |
| ۷ | Deploy و Infrastructure | ۳ روز | فاز ۰ |
| ۸ | Testing | ۵ روز | فاز ۱-۷ |
| ۹ | Polish و UI/UX | ۳ روز | فاز ۸ |

---

## فاز ۰: پیش‌نیازها و محیط توسعه
> مدت: ۲ روز | وابستگی: ندارد

### ۰.۱. رفع docker-compose.yml
- [ ] حذف `version: '3.8'` (deprecated)
- [ ] سرویس `app`: تغییر از `image` به `build`
- [ ] سرویس `app`: اضافه کردن `command` یا `entrypoint`
- [ ] سرویس `app`: اضافه کردن environment variables
- [ ] سرویس `app`: اضافه کردن port mapping (`4000:4000`)
- [ ] رفع `POSTGRES_PASSWORD` هاردکد → متغیر محیطی
- [ ] رفع `MEILI_MASTER_KEY` هاردکد → متغیر محیطی

**فایل‌ها:** `docker-compose.yml`
**تأیید:** `docker compose up` بدون خطا بالا می‌آید

### ۰.۲. رفع Workspace configuration
- [ ] افزودن `nextjs-frontend` به `workspaces` در root `package.json`
- [ ] یکسان‌سازی اسکریپت‌های root (همه از `-w` استفاده کنند به جای `cd`)

**فایل‌ها:** `package.json`
**تأیید:** `npm run dev:all` هر دو پروژه را همزمان اجرا می‌کند

### ۰.۳. رفع lint-staged (ورژن ناموجود)
- [ ] اصلاح ورژن `lint-staged` از `^17.0.8` به `^15.0.0` یا حذف
- [ ] اصلاح فرمان lint-staged از `vitest run --passWithNoTests` به `eslint` (فقط lint روی staged files)

**فایل‌ها:** `nextjs-frontend/package.json`
**تأیید:** `npx lint-staged` بدون خطا اجرا می‌شود

### ۰.۴. اصلاح env variables
- [ ] اصلاح `NEXT_PUBLIC_API_URL` در `.env.example` از `:8000` به `:4000`
- [ ] افزودن `NEXT_PUBLIC_DEV_ORIGIN` به `.env.example`
- [ ] افزودن `NEXT_PUBLIC_REVERB_*` به `.env.local`
- [ ] رفع `SUPABASE_URL` در backend `.env` (نباید PostgreSQL connection string باشد)
- [ ] یکسان‌سازی `DATABASE_URL` و `DIRECT_URL` (یا یکی را بردارید)

**فایل‌ها:** `nextjs-frontend/.env.example`, `nextjs-frontend/.env.local`, `backend/.env`
**تأیید:** `npm run dev` بدون env warning اجرا می‌شود

### ۰.۵. اضافه کردن migrate script
- [ ] افزودن `"migrate": "tsx src/migrations/run.ts"` به `backend/package.json`

**فایل‌ها:** `backend/package.json`

### ۰.۶. حذف happy-dom بی‌استفاده
- [ ] حذف `happy-dom` از devDependencies (jsdom استفاده می‌شود)

**فایل‌ها:** `nextjs-frontend/package.json`

---

## فاز ۱: بحرانی‌های Auth و امنیت
> مدت: ۳ روز | وابستگی: فاز ۰

### ۱.۱. رفع XSS در article.body
- [ ] افزودن کتابخانه `DOMPurify` (یا `isomorphic-dompurify`)
- [ ] اعمال sanitize روی `article.body` قبل از `dangerouslySetInnerHTML`

**فایل‌ها:** `nextjs-frontend/src/app/(public)/news/[slug]/page.tsx`
**تأیید:** تزریق `<script>alert('xss')</script>` در body article کار نمی‌کند

### ۱.۲. رفع JWT_SECRET هاردکد
- [ ] افزودن validation در startup: اگر `JWT_SECRET` مقدار پیش‌فرض دارد، error بدهد
- [ ] افزودن validation.stringify در `src/config/index.ts`

**فایل‌ها:** `backend/src/config/index.ts`, `backend/src/index.ts`
**تأیید:** با `JWT_SECRET=dev-secret` اپلیکیشن خطا می‌دهد

### ۱.۳. رفع SSL verification
- [ ] تغییر `rejectUnauthorized: false` به مقدار configurable
- [ ] در production: `rejectUnauthorized: true`
- [ ] در development: قابل override با `NODE_TLS_REJECT_UNAUTHORIZED=0`

**فایل‌ها:** `backend/src/config/database.ts`
**تأیید:** اتصال به دیتابیس با SSL validation واقعی کار می‌کند

### ۱.۴. رفع Live DB password در .env
- [ ] جایگزینی مقادیر واقعی در `backend/.env` با placeholderها
- [ ] انتقال مقادیر واقعی به `backend/.env.local` (gitignored) یا Vercel env vars

**فایل‌ها:** `backend/.env`
**تأیید:** `git diff` پسورد واقعی را نشان نمی‌دهد

### ۱.۵. رفع CSRF روی health-check
- [ ] محدود کردن `csrf({ origin: [...] })` فقط به mutation endpoints، نه `'*'`

**فایل‌ها:** `backend/src/app.ts`

### ۱.۶. افزودن security headers
- [ ] افزودن middleware برای: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`

**فایل‌ها:** `backend/src/middleware/security.ts` (از قبل وجود دارد — بررسی شود فعال است یا نه)

### ۱.۷. رفع err.name string check
- [ ] تغییر `err.name === 'JWTExpired'` به `err instanceof specific error` یا `err.code`

**فایل‌ها:** `backend/src/middleware/auth.ts:36`

---

## فاز ۲: حذف دیتای جعلی (Mock Data)
> مدت: ۵ روز | وابستگی: فاز ۱

### ۲.۱. جایگزینی دیتای جعلی صفحه خانه
- [ ] STATS (۱۲۵۰۰+, ۸۵۰+): ایجاد endpoint جدید در بک‌اند `GET /stats` که آمار واقعی برگرداند
- [ ] MARKET_TICKER: ایجاد endpoint جدید `GET /market-ticker`
- [ ] FEATURES: ثابت نگه داشته شود (UI است، دیتا نیست)
- [ ] STEPS: ثابت نگه داشته شود (راهنما است)
- [ ] QUICK_LINKS: از دیتابیس یا config بیاید

**فایل‌ها:** `nextjs-frontend/src/app/(public)/page.tsx`, `backend/src/routes/listings.ts`
**تأیید:** اعداد صفحه خانه با دیتای واقعی دیتابیس مطابقت دارد

### ۲.۲. جایگزینی دیتای جعلی نبض بازار
- [ ] ایجاد endpoint `GET /market-pulse` با قیمت واقعی و حجم واقعی
- [ ] حذف `generatePriceSeries` و `generateVolumeSeries`
- [ ] اتصال نمودارها به API واقعی

**فایل‌ها:** `nextjs-frontend/src/app/(public)/market-pulse/page.tsx`
**تأیید:** نمودارها با `Math.random()` تولید نمی‌شوند

### ۲.۳. جایگزینی دیتای جعلی مقایسه خودرو
- [ ] ایجاد endpoint `GET /cars/:id1/compare/:id2` یا استفاده از listingهای واقعی
- [ ] محاسبه مشخصات از attributeهای واقعی Listing
- **یا** حذف کامل این صفحه (اگر feature نیست)

**فایل‌ها:** `nextjs-frontend/src/app/(public)/car-vs-car/page.tsx`

### ۲.۴. جایگزینی دیتای جعلی همیار خودرو
- [ ] ایجاد endpoint توصیه‌های واقعی بر اساس معیارهای کاربر
- **یا** حذف کامل این صفحه

**فایل‌ها:** `nextjs-frontend/src/app/(public)/car-matchmaker/page.tsx`

### ۲.۵. جایگزینی دیتای جعلی تخمین قیمت
- [ ] ایجاد endpoint `POST /price-estimate` با تخمین واقعی
- [ ] محاسبه قیمت بر اساس listingهای مشابه در دیتابیس
- **یا** حذف کامل

**فایل‌ها:** `nextjs-frontend/src/app/(public)/price-estimator/page.tsx`

### ۲.۶. جایگزینی دیتای جعلی نمودارهای واردات
- [ ] حذف کامل `src/lib/importChartData.ts` و `src/lib/chartData.ts`
- **یا** تبدیل به دیتای واقعی با API

**فایل‌ها:** `nextjs-frontend/src/lib/chartData.ts`, `nextjs-frontend/src/lib/importChartData.ts`

### ۲.۷. رفع Mock در کامپوننت‌ها
- [ ] **AIAssistant**: حذف یا تبدیل به دستیار واقعی با API
- [ ] **FilterPanel**: حذف `MODELS_BY_BRAND` و دریافت از API
- [ ] **TenderForm**: حذف `PROVINCES` هاردکد و استفاده از `useProvinces()`
- [ ] **Preferred**: جایگزینی داده‌های Tier با دریافت از API
- [ ] **PriceDepreciationChart**: حذف نرخ استهلاک هاردکد و محاسبه از دیتای واقعی
- [ ] **partStore.ts**: حذف `CATEGORY_PARTS_MAP` هاردکد و دریافت از API
- [ ] **brands.ts**: حذف `HEAVY_BRANDS` و دریافت از API
- [ ] **FavoriteButton**: رفع state اولیه (بجای `false` همیشه، از سرور بخواند)

### ۲.۸. پاکسازی کتابخانه chartData
- [ ] حذف `lib/chartData.ts`
- [ ] حذف `lib/importChartData.ts`

---

## فاز ۳: باگ‌های بک‌اند
> مدت: ۴ روز | وابستگی: فاز ۱

### ۳.۱. رفع پرداخت auto-complete
- [ ] حذف default `'noop'` برای `payment.provider`
- [ ] افزودن configuration-driven provider selection
- [ ] اطمینان از اینکه `completePayment` فقط بعد از تأیید واقعی صدا زده شود

**فایل‌ها:** `backend/src/repositories/payment.ts:41`, `backend/src/domain/services/payment.ts`
**تأیید:** `payment.provider` هاردکد `'noop'` نیست

### ۳.۲. رفع کش invalidate اشتباه در markSold
- [ ] اصلاح `cache.invalidate(`listing:listing.slug`)` به ``cache.invalidate(`listing:${listing.slug}`)``

**فایل‌ها:** `backend/src/domain/services/listing.ts:251`
**تأیید:** بعد از markSold، کش لیستینگ پاک می‌شود

### ۳.۳. رفع SQL injection potential در admin
- [ ] افزودن allowlist برای column names در `Object.keys(body)`
- [ ] فقط کلیدهایی که در app_settings schema هستند قبول شوند

**فایل‌ها:** `backend/src/routes/admin.ts:148-149`

### ۳.۴. رفع rate limiter name mismatch
- [ ] یکسان‌سازی نام‌ها: `createConversation` → `conversation:create`
- [ ] افزودن fallback: اگر نام rate limit پیدا نشد، warning لاگ کند (نه silent skip)

**فایل‌ها:** `backend/src/routes/conversations.ts:40`, `backend/src/middleware/rateLimiter.ts:17-21`

### ۳.۵. رفع admin rate limit
- [ ] افزودن `'admin'` به `rateLimits.ts`

**فایل‌ها:** `backend/src/config/rateLimits.ts`

### ۳.۶. رفع Notification preferences (استاب)
- [ ] پیاده‌سازی واقعی `GET /notification-preferences`
- [ ] پیاده‌سازی واقعی `PUT /notification-preferences`

**فایل‌ها:** `backend/src/routes/me.ts:33-41`

### ۳.۷. رفع Event Bus fire-and-forget
- [ ] افزودن مکانیزم `publishAndWait` برای events بحرانی
- [ ] افزودن لاگ error برای handlersی که fail می‌شوند

**فایل‌ها:** `backend/src/domain/events/index.ts:22-24`

### ۳.۸. رفع Cache بدون محدودیت
- [ ] افزودن max size برای in-memory cache
- [ ] افزودن eviction policy (LRU)

**فایل‌ها:** `backend/src/services/cache/index.ts`

### ۳.۹. رفع `findLatestPhoneVerification` با rate limiting اشتباه
- [ ] تغییر rate limit از per-phone به per-user برای جلوگیری از OTP exhaustion attack

**فایل‌ها:** `backend/src/domain/services/phoneVerification.ts:26`

---

## فاز ۴: رفع عدم تطابق فرانت‌اند و بک‌اند
> مدت: ۴ روز | وابستگی: فاز ۱, ۲

### ۴.۱. ایجاد endpointهای گمشده در بک‌اند

- [ ] `GET /escrow/:id` — دریافت escrow deal
- [ ] `PATCH /escrow/:id` — به‌روزرسانی escrow deal
- [ ] `GET /dealer/fleet/:id` — دریافت جزئیات fleet vehicle
- [ ] `PUT /dealer/fleet/:id` — به‌روزرسانی fleet vehicle
- [ ] `DELETE /dealer/fleet/:id` — حذف fleet vehicle
- [ ] `GET /dealer/fleet/:id/logs` — دریافت service logs
- [ ] `POST /dealer/fleet/:id/logs` — ثبت service log
- [ ] `POST /notifications/push-subscribe` — ثبت push subscription
- [ ] `PUT /conversations/:id/read` — mark conversations as read

**فایل‌ها:** `backend/src/routes/escrow.ts`, `backend/src/routes/dealers.ts`, `backend/src/routes/notifications.ts`, `backend/src/routes/conversations.ts`

### ۴.۲. رفع refreshToken response
- [ ] افزودن `refreshToken` به response body در `POST /auth/register` و `POST /auth/login`
- [ **یا** ] تغییر فرانت‌اند به خواندن refreshToken فقط از cookie

**فایل‌ها:** `backend/src/routes/auth.ts:41-53`, `nextjs-frontend/src/hooks/useAuth.ts:19`
**تأیید:** `refreshToken` در response body موجود است

### ۴.۳. رفع duplicate routes (/me vs /auth/me)
- [ ] حذف `GET /me` از `routes/me.ts` (هم‌پوشانی با `GET /auth/me`)
- [ ] اطمینان از اینکه فرانت‌اند از `GET /auth/me` استفاده کند

**فایل‌ها:** `backend/src/routes/me.ts`, `backend/src/routes/auth.ts`

---

## فاز ۵: Type System و Transformerها
> مدت: ۳ روز | وابستگی: فاز ۴

### ۵.۱. یکسان‌سازی ID types

| فیلد | Frontend فعلی | Backend واقعی | اقدام |
|------|---------------|---------------|-------|
| `User.id` | `string` | `string` (UUID) | ✅ صحیح است |
| `Listing.id` | `string` | `number` | تغییر به `number` |
| `ListingImage.id` | `number` | `string` | تغییر به `string` |
| `Message.id` | `number` | `number` | ✅ صحیح است |
| `Notification.id` | `string` | `number` | تغییر به `number` |

### ۵.۲. رفع unsafe casts در transformers.ts
- [ ] جایگزینی ۱۳ مورد `as unknown as` با نوع‌های صحیح
- [ ] به‌جای partial object، فقط fieldهایی که واقعاً وجود دارند را map کند
- [ ] اضافه کردن type guardها و validation

**فایل‌ها:** `nextjs-frontend/src/lib/transformers.ts`
**تأیید:** `tsc --noEmit` بدون error

### ۵.۳. یکسان‌سازی enumها

| Enum | Frontend | Backend | اقدام |
|------|----------|---------|-------|
| `price_type` | `'free'` | `'auction'` | تغییر frontend به `'auction'` |
| `status` | `'active'` | `'published'` | تغییر frontend به `'published'` |

### ۵.۴. رفع Conversation shape mismatch
- [ ] یکسان‌سازی `Conversation.buyer` و `Conversation.seller` بین فرانت و بک‌اند
- [ ] بک‌اند فعلی `{ buyer_id, buyer_name }` مسطح می‌دهد
- [ ] فرانت `{ buyer: User }` تو در تو می‌خواهد

### ۵.۵. رفع اشتباه نام‌گذاری storeها
- [ ] تغییر نام `escrowStore.ts` → `escrow.ts`
- [ ] تغییر نام `partStore.ts` → `parts.ts`
- [ ] تغییر نام `fleetStore.ts` → `fleet.ts`
- [ ] تغییر نام `tenderStore.ts` → `tender.ts`

### ۵.۶. حذف dead code
- [ ] حذف `lib/useStore.ts` (هیچجا استفاده نمی‌شود)
- [ ] حذف `backend/src/middleware/errorHandler.ts` (register نشده)
- [ ] حذف تابع تکراری `toPersianNumber` در `serviceLogStore.ts`

---

## فاز ۶: سرویس‌های خارجی (Email, SMS, Payment)
> مدت: ۵ روز | وابستگی: فاز ۵

### ۶.۱. ایمیل (Email)
- [ ] انتخاب provider واقعی:
  - گزینه‌ها: Chapar, Faras, SendGrid, یا SMTP direct
- [ ] پیاده‌سازی `SmtpEmailProvider`
- [ ] تنظیم env varها: `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**فایل‌ها:** `backend/src/services/email/providers/`,
**تأیید:** ایمیل واقعی ارسال می‌شود

### ۶.۲. پیامک (SMS)
- [ ] انتخاب provider واقعی: Kavenegar, Farapayam
- [ ] پیاده‌سازی real provider (به‌جای `ConsoleSmsProvider`)
- [ ] تنظیم env varها: `SMS_PROVIDER`, API key

**فایل‌ها:** `backend/src/services/sms/providers/`
**تأیید:** OTP واقعی ارسال می‌شود

### ۶.۳. پرداخت (Payment)
- [ ] پیاده‌سازی `ZarinpalProvider`
- [ ] رفع `'noop'` هاردکد (مشکل ۳.۱)
- [ ] تنظیم env varها: `PAYMENT_PROVIDER=zarinpal`, `ZARINPAL_MERCHANT_ID`

**فایل‌ها:** `backend/src/services/payment/provider.ts`,
**تأیید:** پرداخت واقعی (هرچند تستی) انجام می‌شود

### ۶.۴. فایل استوریج
- [ ] تنظیم Supabase Storage
- [ ] رفع `public_url` construction (آدرس فعلی اشتباه است)
- [ **یا** ] پیاده‌سازی Local Storage جایگزین با مسیر درست

**فایل‌ها:** `backend/src/routes/uploads.ts`
**تأیید:** آپلود و نمایش تصاویر کار می‌کند

### ۶.۵. رفع noop ریپوزیتوری payment
- [ ] حذف `provider: 'noop'` پیش‌فرض از `paymentRepository.create`
- [ ] استفاده از provider پیکربندی شده

**فایل‌ها:** `backend/src/repositories/payment.ts:41`

---

## فاز ۷: Deploy و Infrastructure
> مدت: ۳ روز | وابستگی: فاز ۰

### ۷.۱. رفع migration 018 (نوع اشتباه)
- [ ] تغییر `user_id INTEGER` → `user_id UUID`
- [ ] افزودن `BEGIN...COMMIT` و `IF NOT EXISTS`

**فایل‌ها:** `backend/migrations/018_push_subscriptions.sql`

### ۷.۲. اجرای migration‌ها در Supabase
- [ ] رفتن به Supabase SQL Editor
- [ ] اجرای ۱۸ فایل migration به ترتیب
- [ ] ایجاد Storage buckets: `listings`, `avatars`

**مستندات:** `HUMAN_TODO.md` (کار دستی)

### ۷.۳. تنظیم Vercel Deploy
- [ ] تنظیم environment variables در Vercel
- [ ] رفع Vercel entry mismatch (تأیید `api/index.ts` و `tsup.config.ts` همراستا هستند)
- [ ] Deploy backend
- [ ] Deploy frontend

**فایل‌ها:** `backend/vercel.json`, `backend/tsup.config.ts`
**مستندات:** `HUMAN_TODO.md`

### ۷.۴. اصلاح .gitignore
- [ ] افزودن `coverage/`
- [ ] افزودن `test-results/`, `playwright-report/`
- [ ] افزودن `uploads/`, `uploads_data/`
- [ ] افزودن `*.tsbuildinfo`

**فایل‌ها:** `.gitignore`

### ۷.۵. اصلاح tsconfig.json
- [ ] تغییر `target: "ES2017"` → `"ES2022"`
- [ ] افزودن `exclude` برای `coverage/`, `e2e/`, `test-results/`

**فایل‌ها:** `nextjs-frontend/tsconfig.json`

---

## فاز ۸: Testing
> مدت: ۵ روز | وابستگی: فاز ۱-۷

### ۸.۱. نوشتن تست برای بک‌اند
- [ ] Auth: register, login, refresh, logout, forgot, reset
- [ ] Listings: CRUD, search, status actions
- [ ] Conversations: create, send message, mark read
- [ ] Categories, Provinces
- [ ] Middleware: auth, rate limiter, error wrapper

**تخمین:** ~۸۰ تست

### ۸.۲. نوشتن تست برای فرانت‌اند
- [ ] Hooks: useAuth, useListings, useChat, useFavorites, useSearch
- [ ] Stores: authStore, compareStore, recentlyViewedStore
- [ ] Components: ListingCard, FilterPanel, etc.
- [ ] Utils: formatPrice, formatRelativeTime, transform functions

**تخمین:** ~۵۰ تست

### ۸.۳. E2E با Playwright
- [ ] ثبت‌نام و ورود کاربر
- [ ] ایجاد و انتشار آگهی
- [ ] جستجو و فیلتر
- [ ] ارسال پیام
- [ ] افزودن به علاقه‌مندی‌ها

**تخمین:** ~۱۰ سناریو

---

## فاز ۹: Polish و UI/UX
> مدت: ۳ روز | وابستگی: فاز ۸

### ۹.۱. Error handling یکپارچه
- [ ] افزودن error state به `ConversationList.tsx`
- [ ] افزودن error state به `NotificationDropdown.tsx`
- [ ] افزودن error state به `useFleet`, `useEscrow`, `useTenders`
- [ ] افزودن error toast به `ListingForm`

### ۹.۲. Loading/Empty states
- [ ] بررسی همه `useQuery` مصرف‌کننده‌ها برای loading state
- [ ] بررسی همه لیست‌ها برای empty state

### ۹.۳. Performance
- [ ] رفع `useCompareStore` بدون selector در `ListingCard.tsx`
- [ ] رفع `FavoriteButton.tsx` state initialization

### ۹.۴. Accessibility
- [ ] افزودن aria-label به دکمه‌های icon-only
- [ ] رفع `* { cursor: none !important; }` در `CustomCursor.tsx`

---

## جدول زمان‌بندی کل

| فاز | روز شروع | روز پایان | وابسته به |
|-----|----------|-----------|----------|
| فاز ۰: پیش‌نیازها | روز ۱ | روز ۲ | — |
| فاز ۱: Auth/امنیت | روز ۳ | روز ۵ | فاز ۰ |
| فاز ۲: Mock Data | روز ۶ | روز ۱۰ | فاز ۱ |
| فاز ۳: Backend Bugs | روز ۶ | روز ۹ | فاز ۱ |
| فاز ۴: Mismatch | روز ۱۱ | روز ۱۴ | فاز ۱, ۲ |
| فاز ۵: Type System | روز ۱۵ | روز ۱۷ | فاز ۴ |
| فاز ۶: سرویس‌ها | روز ۱۸ | روز ۲۲ | فاز ۵ |
| فاز ۷: Deploy | روز ۱۸ | روز ۲۰ | فاز ۰ |
| فاز ۸: Testing | روز ۲۳ | روز ۲۷ | فاز ۱-۷ |
| فاز ۹: Polish | روز ۲۸ | روز ۳۰ | فاز ۸ |

**مجموع تخمینی: ۳۰ روز کاری (~۶ هفته) با یک توسعه‌دهنده full-time**

---

## Summary Dashboard

```
بحرانی  ■■■■■■■■■ (9)
High     ■■■■■■■■■■■■■■■■■■■■■■■■■■■■ (28)
Medium   ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ (30)
Low      ■■■■■■■■■■■■■■ (16)
         ──────────────────────────────────
Total    ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ (83)
```

| فاز | بحرانی | High | Medium | Low | مجموع |
|-----|--------|------|--------|-----|-------|
| فاز ۰ | ۰ | ۱ | ۳ | ۲ | ۶ |
| فاز ۱ | ۱ | ۳ | ۲ | ۱ | ۷ |
| فاز ۲ | ۲ | ۴ | ۶ | ۲ | ۱۴ |
| فاز ۳ | ۱ | ۳ | ۵ | ۱ | ۱۰ |
| فاز ۴ | ۰ | ۴ | ۲ | ۰ | ۶ |
| فاز ۵ | ۰ | ۲ | ۳ | ۲ | ۷ |
| فاز ۶ | ۰ | ۴ | ۲ | ۰ | ۶ |
| فاز ۷ | ۱ | ۱ | ۲ | ۲ | ۶ |
| فاز ۸ | ۰ | ۱ | ۱ | ۱ | ۳ |
| فاز ۹ | ۰ | ۰ | ۲ | ۲ | ۴ |

---

## تعریف Done

یک task تمام شده محسوب می‌شود اگر:

- [ ] `tsc --noEmit` در backend و frontend بدون خطا باشد
- [ ] ESLint (یا ruff) بدون warning و error باشد
- [ ] تست‌های مربوط به آن task پاس شوند
- [ ] API response از `{ success: true, data }` پیروی کند
- [ ] `as unknown as` جدید اضافه نشده باشد
- [ ] `Math.random()` برای داده (نه animation) استفاده نشده باشد
- [ ] خطاهای API بی‌صدا قورت داده نشده باشند
- [ ] mock data در production code وجود نداشته باشد
- [ ] Documentation (این فایل) به‌روز شده باشد
