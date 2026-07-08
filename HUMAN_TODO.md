# HUMAN_TODO — کارهایی که شما باید انجام دهید

> این فایل شامل کارهایی است که **فقط انسان می‌تواند انجام دهد**.
> ثبت‌نام، ساخت پروژه، گرفتن API Key، اجرای migration در دشبورد، دیپلوی و ...
> کارهای کدنویسی در `FIX_PLAN.md` است و توسط هوش مصنوعی انجام می‌شود.

---

## ⚡ مرحله ۰: پیش‌نیازها (یکبار انجام دهید)

- [ ] **ایمیل و شماره تلفن**: یک ایمیل فعال و یک شماره ایرانسل/همراه داشته باشید
- [ ] **حساب Supabase**: اگر ندارید در https://supabase.com ثبت‌نام کنید (با GitHub)
- [ ] **حساب Vercel**: اگر ندارید در https://vercel.com ثبت‌نام کنید (با GitHub)
- [ ] **Node.js**: مطمئن شوید `node -v` → v18 یا بالاتر است
- [ ] **Git**: مطمئن شوید `git --version` کار می‌کند
- [ ] **Vercel CLI**: `npm i -g vercel` (برای دیپلوی بعداً نیاز می‌شود)

---

## ☁️ ۱. تنظیم Supabase

### ۱.۱. ایجاد پروژه
- [ ] رفتن به https://supabase.com/dashboard/projects
- [ ] کلیک **New Project**
- [ ] Organization: (شخصی یا سازمانی)
- [ ] Name: `marketplace-production`
- [ ] Database Password: یک رمز قوی بزنید و **جای امن ذخیره کنید**
- [ ] Region: **Singapore** (نزدیک‌ترین region به ایران با کانفیگ قابل قبول)
- [ ] Pricing Plan: **Free** (برای شروع کافی است)
- [ ] منتظر بمانید تا پروژه ساخته شود (~۲ دقیقه)

### ۱.۲. گرفتن کلیدها
- [ ] از صفحه پروژه → **Project Settings** → **API**
- [ ] کپی کنید و **جای امن ذخیره کنید**:
  - `Project URL` (مثلاً `https://xxxxx.supabase.co`)
  - `anon public` key
  - `service_role` key (این را به کسی ندهید!)
- [ ] از **Project Settings** → **Database** → `Connection string` → **URI** را کپی کنید
  - این `DATABASE_URL` است. پسورد داخلش را با رمزی که مرحله ۱.۱ زدید جایگزین کنید

### ۱.۳. اجرای Migration‌ها
- [ ] رفتن به **SQL Editor** در دشبورد Supabase
- [ ] فایل‌های `backend/migrations/` را به **ترتیب شماره** باز کنید و در SQL Editor اجرا کنید:
  - [ ] `001_auth.sql`
  - [ ] `002_verifications.sql`
  - [ ] `003_categories.sql`
  - [ ] `004_listings.sql`
  - [ ] `005_search.sql`
  - [ ] `006_chat.sql`
  - [ ] `007_features.sql`
  - [ ] `008_payments.sql`
  - [ ] `009_dealers.sql`
  - [ ] `010_notifications.sql`
  - [ ] `011_seed.sql`
  - > نکته: فایل‌ها را یک‌یکی اجرا کنید، نه همه با هم. بعد از هر کدام صبر کنید "Success" نشان دهد.

### ۱.۴. ایجاد Storage Bucket
- [ ] رفتن به **Storage** در دشبورد Supabase
- [ ] کلیک **New Bucket**
- [ ] Name: `listings`
- [ ] Public: ✅ (تیک بزنید)
- [ ] تکرار کنید: Name: `avatars`, Public: ✅
- [ ] برای هر باکت: رفتن به **Policies** → **New Policy** → **Give public access to all users** (برای اینکه تصاویر قابل مشاهده باشند)

---

## 🚀 ۲. تنظیم Vercel

### ۲.۱. Backend
- [ ] رفتن به https://vercel.com/new
- [ | ] Import Git Repository → انتخاب `marketplace` → (یا اگر Git نیست: **Deploy without Git**)
- [ | ] اگر Deploy without Git: `vercel deploy` بعداً
- [ ] Root Directory: `backend/`
- [ | ] Framework Preset: **Other**
- [ ] Build Command: `npm run build`
- [ | ] Output Directory: (پیش‌فرض)
- [ | ] کلیک **Deploy**
- [ ] بعد از دیپلوی، رفتن به **Project Settings** → **Environment Variables**
- [ ] افزودن:

  | Name | Value |
  |---|---|
  | `DATABASE_URL` | (از مرحله ۱.۲) |
  | `JWT_SECRET` | یک رشته ۶۴ کاراکتری تصادفی (مثلاً `openssl rand -hex 32`) |
  | `SUPABASE_URL` | (از مرحله ۱.۲) |
  | `SUPABASE_SERVICE_KEY` | (از مرحله ۱.۲) |
  | `CORS_ORIGIN` | URL فرانت‌اند (بعد از دیپلوی frontend مقدارش را بدهید) |
  | `APP_URL` | URL بک‌اند (بعد از دیپلوی) |

### ۲.۲. Frontend
- [ ] رفتن به https://vercel.com/new
- [ | ] Root Directory: `nextjs-frontend/`
- [ | ] Framework: **Next.js**
- [ ] کلیک **Deploy**
- [ ] بعد از دیپلوی، رفتن به **Project Settings** → **Environment Variables**
- [ ] افزودن:

  | Name | Value |
  |---|---|
  | `NEXT_PUBLIC_API_URL` | (URL بک‌اند از مرحله ۲.۱) |
  | `NEXT_PUBLIC_SUPABASE_URL` | (از مرحله ۱.۲) |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (از مرحله ۱.۲) |

### ۲.۳. بروزرسانی CORS
- [ | ] بعد از اینکه frontend دیپلوی شد، URL آن را در متغیر `CORS_ORIGIN` بک‌اند در Vercel قرار دهید

---

## 🔄 ۳. دیپلوی نهایی (بعد از اتمام کدنویسی)

- [ | ] اجرای `cd backend && vercel deploy --prod`
- [ | ] اجرای `cd nextjs-frontend && vercel deploy --prod`
- [ ] تست کل سایت روی دامنه واقعی:
  - [ ] ثبت‌نام کاربر جدید
  - [ ] تایید ایمیل
  - [ | ] ورود و ایجاد آگهی
  - [ | ] جستجو
  - [ | ] ارسال پیام
  - [ ] ارتقا به Dealer

---

## 💳 ۴. سرویس‌های خارجی (برای بعد از MVP)

> این موارد برای MVP لازم نیست، ولی برای پروداکشن نهایی نیاز است.

### پرداخت (Zarinpal)
- [ ] ثبت‌نام در https://zarinpal.com
- [ ] دریافت `MERCHANT_ID`
- [ | ] پیاده‌سازی `ZarinpalProvider` در `backend/src/services/payment/providers/`

### ایمیل
- [ | ] انتخاب provider (Chapar, Faras, یا SendGrid)
- [ | ] دریافت API Key
- [ | ] پیاده‌سازی `SmtpEmailProvider` در `backend/src/services/email/providers/`

### پیامک
- [ | ] انتخاب provider (Kavenegar, Farapayam, یا مشابه)
- [ | ] دریافت API Key
- [ | ] پیاده‌سازی واقعی به جای `ConsoleSMSProvider`

---

## ❓ ۵. اگر به راهنمایی نیاز داشتید

برای هر کدام از مرحله‌های بالا که سوال داشتید، از من بپرسید:
- کدام region برای Supabase بهتر است؟
- رمز JWT چطور تولید کنم؟
- CORS_ORIGIN چیست و چطور مقدارش را پیدا کنم؟
- migrationها را چطور اجرا کنم؟
- error دیپلوی را چطور دیباگ کنم؟

---

## 📊 خلاصه کارهای شما

| مرحله | زمان تخمینی | سطح سختی |
|---|---|---|
| ثبت‌نام در سرویس‌ها | ۱۵ دقیقه | آسان |
| ساخت Supabase + گرفتن کلیدها | ۱۰ دقیقه | آسان |
| اجرای ۱۱ migration | ۲۰ دقیقه | متوسط |
| تنظیم Vercel + Deploy | ۳۰ دقیقه | متوسط |
| تست نهایی | ۳۰ دقیقه | آسان |
| **مجموع** | **~۱.۵ ساعت** | |
