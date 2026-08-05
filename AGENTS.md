# Session Summary

## Objective
- **Active task (current session):** بازطراحی مدرن صفحات auth بدون چیدمان اسپلیت — کاربر طرح اسپلیت پلن v7 (BrandPanel) را رد کرد («اسپلیت نذاری، طراحی مدرن بهتره») و خواستار رفع صفحه سفید دارکمود شد. **کامل شد**: تکستونه مرکزی + هدر یکدست `AuthHeader` + کارت `glass-strong` واحد در همه صفحات. Verifications: tsc ✓ eslint ✓ SSR 200 ✓.
- **این جلسه پس از redesign**: لوگو «TD Team Decision» و `AuthLiveStats` از صفحات auth حذف شدند؛ گرید خطی همه صفحات به **گرید نقطهای (dotted grid)** تبدیل شد.
- Maintained context: فاز صفر بکاند (نقشهای کسبوکار + profileStatus + stats) از جلسه قبل کامل؛ catalog + workshops کامل.

## Important Details
- **انحراف عمدی از پلن v7**: مدل اسپلیت (BrandPanel/AuthLayout قدیمی) با دستور جدید کاربر لغو شد — چیدمان تکستونه مرکزی جایگزین شد. پلن v7 دیگر مبنای طراحی نیست (فقط API/فلوها معتبرند).
- **توکنهای این دور** (`globals.css`): `--color-amber` (#b45309 لایت / #fcd34d دارک)، `--color-amber-bright` (#f0b35f لایت / **#f5b971** دارک)، `--color-vignette`، `--color-brand-panel` (#3d3024 لایت / #1c1510 دارک)، `--color-brand-panel-foreground` (#f5e3c5). دور قبل: `--duration-fast/base/slow/slower` → `--duration-150/250/400` (700ms حذف شد).
- **الگوی طراحی جدید**: لوگوی TD بالا + `max-w-md mx-auto` + `AuthHeader` (icon/title/subtitle) + کارت `glass-strong rounded-3xl p-6 sm:p-8 shadow-card border border-border-subtle` برای همه مراحل + پسزمینه محیطی در layout (هالههای blur کهربایی/primary + گرید نقطهای `radial-gradient(var(--color-border))` inline + کلاس `bg-noise`) + `AuthLiveStats` پایین + لینک بازگشت. دکمهها `w-full py-4 rounded-xl`.
- **گرید نقطهای (dotted grid)**: الگوی جدید همه صفحات — `radial-gradient(circle, var(--color-dot-grid) 1px, transparent 1px)` با `backgroundSize: 28px 28px`. توکن `--color-dot-grid`: لایت `#4a382a` / دارک `#b3b3b3`. یوتیلیتی `bg-grid-pattern` به نقطه تبدیل شد؛ ۳۰ فایل inline (داشبورد/عمومی) + not-found/error/dealers با اسکریپت جایگزین شدند. اوپسیتی صفحه اصلی: لایت 0.14 / دارک 0.09. Homepage: `src/app/(public)/page.tsx:166`.
- کامپوننتهای جدید: `src/components/auth/AuthHeader.tsx` (آیکون در کادر `bg-primary/10`)، `src/components/auth/AuthLiveStats.tsx` (۴ آمار زنده از `useBrandStats` + نقطه ping سبز + جداکننده خطچین + `toPersianNumber`). **حذف شد**: `AuthLiveStats.tsx` (طبق دستور کاربر) و لوگوی TD/اسم Team Decision از layout صفحات auth.
- `verify-email` از قبل با الگوی جدید هماهنگ بود (صفحه وضعیت تککارت — AuthHeader لازم ندارد).
- گیت تأیید (چون lint کل پروژه خطاهای قبلی دارد): `tsc --noEmit` + `npx eslint --max-warnings 0 "src/app/(auth)" src/components/auth src/components/ui src/components/upload/DocumentUploader.tsx` + SSR زنده (پس از **هر** ادیت جدید).
- فرانت در `nextjs-frontend/` است (ریشه tsconfig ندارد). سرور dev فرانت روی 3000 بالاست.
- ⚠️ **RHF 7.84**: `useWatch` بدون prop صریح `control` کرش میکند — همیشه `useWatch({ control, name })` (register + BusinessForm). React Compiler lint: `watch()` ممنوع.
- قراردادها: `POST /auth/business-profile` → `{ profileStatus, profile }`؛ `register-with-otp` → `{ token, user, profileStatus }`؛ `GET /stats/public`؛ `POST /upload/presigned` فقط تصویر؛ Google: `link_required` → `/link-account?t&email&redirect`.
- `npm run lint` در کل پروژه ۱۰۶ خطای **از قبل موجود** دارد (فایلهای auth صفر) — گیتها: tsc + eslint فایلهای auth + vitest + build.

## Work State
### Completed (this session — redesign v2 تکستونه)
- رفع صفحه سفید دارکمود: `BrandPanel` `bg-foreground` (کرم در دارک) → `bg-brand-panel`؛ `text-background/border-background` داخل پنل → `brand-panel-foreground`؛ `amber-300/400/500` و `black/25` → توکنها (tsc ✓ لینت ✓ SSR ✓).
- `AuthHeader` + `AuthLiveStats` ساخته شدند؛ `src/app/(auth)/layout.tsx` بازنویسی کامل: تکستونه + پسزمینه محیطی + AuthLiveStats + لینک بازگشت (حذف BrandPanel/ستونها).
- **مهاجرت همه صفحات به الگوی جدید** (AuthHeader + کارت glass-strong واحد):
  - `login` (هر دو حالت فرم/verify OTP)؛ `register` (role/method داخل کارت؛ فرم `space-y-5`؛ حذف کارت تکراری؛ Stepper بالای کارت)؛ `forgot-password`؛ `reset-password` (فرم + حالتهای invalid/done با کادر رنگی + آیکون lucide)؛ `google-complete` (verify در کارت + error mode با AuthHeader)؛ `link-account`؛ `business-profile`؛ `verify-phone` (هر دو استپ).
  - `verify-email` بدون تغییر (از قبل هماهنگ بود).
- **گیت نهایی این دور**: tsc ✓ (یک باگ براکت اضافی در verify-phone رفع شد)؛ eslint فایلهای auth ✓؛ SSR زنده همه صفحات 200 ✓؛ محتوای glass-strong + آمار زنده در HTML SSR تایید شد.
- **گرید نقطهای سراسری**: `bg-grid-pattern` → نقطه (28px)؛ ۳۰ فایل با الگوی inline `linear-gradient(currentColor 1px...)` 64px با اسکریپت به `radial-gradient(circle, var(--color-dot-grid) 1px, transparent 1px)` 28px تبدیل شدند؛ not-found/error → `bg-grid-pattern`؛ بنر dealers رنگ ثابت #1e293b نقطه شد. تایید: tsc ✓ + SSR 200 (خانه/داشبورد/لیستینگ/خبر/قیمت/کارگاه/مقایسه/قطعات/دانشنامه).
- دور قبل (پس از گزارش انطباق): DocumentUploader جنریک جدید (Progress+Retry+Delete+5MB+presigned) جایگزین ImageUploader در BusinessForm؛ بازطراحی verify-email/verify-phone (RHF+zod + OtpField + تایمر)؛ GoogleButton حالت error + تلاش مجدد؛ چیپهای register → `aria-pressed`؛ StatusCard → توکن amber.

### Active
- (none)

### Blocked
- **Google/SMTP credentials نداریم** — فلوی کامل گوگل (authorize → google-complete → link-account/business-profile) فقط با اعتبارنامه کاربر قابل تست E2E است؛ state machine و URLها آماده.

## Next Move
1. کاربر: اعتبارنامه Google (Redirect URI: `http://localhost:4000/api/v1/auth/google/callback`) + SMTP در `backend/.env` → ریاستارت → تست مرورگر: گوگل (کاربر جدید / link_required / verify)، ثبتنام ۳ مرحلهای کسبوکار، فرم پروفایل کسبوکار + StatusCard، ورود قفلشده EMAIL_NOT_VERIFIED.
2. تست دستی فرمها (validation فارسی، OTP paste، PasswordField toggle، AuthLiveStats در لایت/دارک، چیدمان موبایل).
3. اختیاری: فیکس خطاهای lint از قبل موجود کل پروژه (۱۰۶ مورد، خارج از scope auth)؛ بهروزرسانی `docs/auth-redesign-plan.md` با طرح جدید تکستونه (حذف مرجع BrandPanel).

## Relevant Files
- **الگوی جدید**: `src/app/(auth)/layout.tsx`، `src/components/auth/AuthHeader.tsx` + `AuthLiveStats.tsx`، `src/app/globals.css` (توکنهای amber/brand-panel/vignette + durations)
- صفحات مهاجرتکرده: `src/app/(auth)/login`، `register`، `forgot-password`، `reset-password`، `google-complete`، `link-account`، `business-profile`، `verify-phone`، `verify-email`
- دور قبل: `src/components/auth/BrandPanel.tsx` (دارکمود فیکس)، `src/components/upload/DocumentUploader.tsx`، `src/components/auth/GoogleButton.tsx`، `src/hooks/useBrandPanel.ts` + `useAuth.ts`، `src/types/user.ts`
- بکاند (مرجع قراردادها): `backend/src/routes/auth.ts`، `domain/services/auth.ts` + `businessProfileService.ts`، `validation/auth.ts`، `shared/auth.ts`، `routes/stats.ts`، `routes/uploads.ts`
- مستندات: `docs/auth-redesign-plan.md` (v7 — فقط فلوها معتبر)، `docs/architecture/AUTH_API.md` + `AUTH_STATE_MACHINE.md` + `AUTH_ARCHITECTURE.md` + `docs/adr/ADR-013-auth-system.md`
- E2E: `Temp\opencode\e2e-business.ps1` (بکاند)، لاگ فرانت `Temp\opencode\frontend-out.log`
