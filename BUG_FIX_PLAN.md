# طرح جامع رفع مشکلات | Marketplace Bug Fix Plan

> تاریخ: ۲۰۲۶-۰۷-۱۵
> منبع: سه سشن حسابرسی کد (Deep Audit + دو دور اعتبارسنجی ادعاها)
> راهنما: `🔍` = تأیید شده با خواندن مستقیم کد | بدون علامت = از سشن قبلی، نیاز به بررسی مجدد

---

## فاز ۱ — بحرانی: Auth و امنیت مستقیم (۱۲ مشکل)

| # | مبدأ | فایل:سطر | شرح | اولویت |
|---|------|----------|------|--------|
| C1 | [A],[C] 🔍 | `nextjs-frontend/src/store/authStore.ts:63-70` | **Token ذخیره نمی‌شود.** `partialize` توکن را حذف کرده. بعد از رفرش `token=null` ← `useIsAuthenticated()` همیشه false ← AuthProvider هرگز `/me` را نمی‌زند. کل auth-flow بعد از رفرش می‌شکند. | بحرانی |
| C2 | [A] 🔍 | `nextjs-frontend/src/providers/AuthProvider.tsx:22` | **No on-hydration refresh.** `enabled: !!token && isAuthenticated` — بعد از رفرش هر دو false. هیچ مکانیزم `refreshToken()` در زمان hydration وجود ندارد. | بحرانی |
| C3 | [B],[C] 🔍 | `backend/src/domain/services/phoneVerification.ts:40-44` | **OTP verification همیشه fail.** `bcrypt.hash(code, 10)` در خط ۴۰ با salt تصادفی هش می‌زند، سپس خط ۴۱ با این هش lookup می‌کند ← هش ذخیره‌شده در DB (خط ۳۲) با salt متفاوت است ← پیدا نمی‌شود ← خطا. `bcrypt.compare` خط ۵۰ هرگز اجرا نمی‌شود. | بحرانی |
| C4 | [B],[C] 🔍 | `backend/src/domain/services/emailVerification.ts:47-51` | **Email verification همیشه fail.** همان باگ C3: خط ۴۷ `bcrypt.hash(token)` با salt متفاوت از خط ۲۵ تولید می‌کند ← lookup خط ۴۸ null. | بحرانی |
| C5 | [C] 🔍 | `nextjs-frontend/src/app/(auth)/verify-email/page.tsx:17` ↔ `backend/src/routes/email.ts:23` | **Route mismatch.** فرانت `POST /auth/verify-email` می‌زند، بک‌اند فقط `GET /email/verify/:token` دارد. | بحرانی |
| C6 | [A],[B] 🔍 | `backend/src/domain/services/auth.ts:115` vs `140` | **Refresh rotation broken در دومین استفاده.** رجیستر/لاگین با `sha256` ذخیره می‌کنند (خط ۴۹, ۸۹) ولی refresh با `bcrypt.hash` (خط ۱۴۰). رفرش بعدی `sha256` لوکاپ می‌کند (خط ۱۱۵) ولی هش ذخیره‌شده bcrypt است ← match نمی‌شود. | بحرانی |
| C7 | [A] 🔍 | `nextjs-frontend/src/app/(public)/news/[slug]/page.tsx:113` | **XSS در article.body.** `dangerouslySetInnerHTML` بدون DOMPurify یا sanitize. | بحرانی |
| C8 | [B],[C] 🔍 | `nextjs-frontend/src/store/authStore.ts:64` + `backend/src/routes/auth.ts:46,62,86` | **Refresh token در localStorage.** بک‌اند httpOnly cookie هم می‌فرستد (`auth.ts:21-29`) ولی refreshToken را در response body هم برمی‌گرداند ← فرانت نسخه body را در localStorage می‌ریزد ← XSS برد. | High |
| C9 | [B] 🔍 | `backend/src/domain/services/auth.ts:210-225` | `sanitizeUser` فیلدهای `status` و `role` را برمی‌گرداند. `GET /auth/me` (auth.ts:110) این اطلاعات را به کلاینت می‌دهد. | High |
| C10 | [B] 🔍 | `backend/src/routes/auth.ts:21-29` | httpOnly cookie برای refreshToken درست تنظیم شده `HttpOnly; Path=/api/v1/auth; SameSite=Lax`. | — |
| C11 | [B] 🔍 | `backend/src/domain/services/phoneVerification.ts:39-44` | **OTP timing attack.** flow از `bcrypt.compare` برای مقایسه امن استفاده نمی‌کند (اصلاً کار نمی‌کند). | Medium |
| C12 | [A] 🔍 | `backend/src/config/index.ts:14` | `JWT_SECRET: 'dev-secret-change-in-production'` هاردکد در کد. | High |

---

## فاز ۲ — Backend API (۲۲ مشکل)

| # | مبدأ | فایل:سطر | شرح | اولویت |
|---|------|----------|------|--------|
| B1 | [A],[B] 🔍 | `backend/src/routes/listings.ts:38-56` | `GET /listings` پارامتر `status` را بدون بررسی role قبول می‌کند ← هر کاربر می‌تواند لیستینگ‌های غیرفعال را ببیند. | High |
| B2 | [B] 🔍 | `backend/src/routes/search.ts:13-18` + `backend/src/domain/services/listing.ts:275-280` | **Search فقط ۴ فیلتر دارد:** `q, category, province, min_price, max_price`. فرانت `brand, model, year, city_id, sort` را ارسال می‌کند ولی backend نادیده می‌گیرد. | High |
| B3 | [A],[B] 🔍 | `backend/src/routes/provinces.ts` | `GET /:slug/cities` وجود ندارد. | High |
| B4 | [A] 🔍 | `backend/src/routes/categories.ts:30-57` | Admin endpoints زیر `/categories` هستند (`POST /categories` و...) نه `/admin/categories`. | Medium |
| B5 | [B] 🔍 | سراسر routes | **Error response inconsistency.** بعضی `{ error: { code, message } }` برمی‌گردانند، بعضی فقط `{ message }`. Type `ApiError` در `api.ts:15-18` فقط `{ message, errors? }` دارد. | Medium |
| B6 | [A] 🔍 | `backend/src/middleware/errorWrapper.ts:16-19` | اگر middlewareای (مثلاً zValidator) خطای غیر `AppError` پرتاب کند، errorWrapper ۵۰۰ برمی‌گرداند. | High |
| B7 | [B] 🔍 | `backend/src/routes/listings.ts:133-189` | `GET /listings/:id/stats` از `optionalAuth()` استفاده می‌کند ← stats لیستینگ بدون auth در دسترس. | High |
| B8 | [A] 🔍 | `backend/src/routes/listings.ts:13-29` | Schema لیستینگ فیلد `location/coordinates` ندارد. | Low |
| B9 | [A] 🔍 | `backend/src/routes/search.ts:27` | Search نتیجه `{ data, meta: { total } }` بدون pagination برمی‌گرداند. | Medium |
| B10 | [B] 🔍 | `backend/src/routes/auth.ts:46,62,86` | `refreshToken` در response body برگردانده می‌شود (موجب C8). | High |
| B11 | [B] 🔍 | `backend/src/routes/admin.ts` | Admin endpoints `rateLimiter` اختصاصی ندارند (فقط global در `app.ts:13`). | Medium |
| B12 | [B] 🔍 | `backend/src/middleware/cors.ts:7` | CORS از allowlist استفاده می‌کند (`[config.frontendUrl, 'localhost:3000', 'localhost:4000']`) — صحیح است. | — |
| B13 | [B] 🔍 | `backend/src/routes/conversations.ts` | بک‌اند `{ buyer_id, buyer_name }` مسطح برمی‌گرداند ولی type فرانت `{ buyer: User }` تو در تو. عدم تطابق. | High |
| B14 | [A] 🔍 | `backend/src/domain/services/listing.ts` | `delete` لیستینگ media files را پاک نمی‌کند. | Medium |
| B15 | [B] 🔍 | `backend/src/config/index.ts:8` | `DATABASE_URL` مقدار پیش‌فرض (`postgres://marketplace:marketplace_pass@localhost:5432/marketplace`). | High |
| B16 | [A] 🔍 | `backend/src/app.ts` | هیچ middleware امنیتی (Helmet/Hono secure-headers) وجود ندارد: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Tranport-Security`. | High |
| B17 | [A] | (پروژه) | CSRF protection وجود ندارد. | High |
| B18 | [A] | (پروژه) | محدودیت حجم request body وجود ندارد. | Medium |
| B19 | [A] | `nextjs-frontend` | Payment/require page — مسیر ۴۰۴ می‌دهد. | High |
| B20 | [A] | (پروژه) | *WebSocket auth token در query string* — نیاز به بررسی. | Medium |
| B21 | [A] | (پروژه) | *Logger بدون request ID* — نیاز به بررسی. | Low |
| B22 | [B] 🔍 | `backend/src/routes/health.ts` | Healthcheck endpoint وجود دارد — صحیح است. | — |

---

## فاز ۳ — Frontend Architecture (۱۴ مشکل)

| # | مبدأ | فایل:سطر | شرح | اولویت |
|---|------|----------|------|--------|
| F1 | [C] 🔍 | `nextjs-frontend/src/lib/queryKeys.ts` | **queryKeys hierarchy نامنظم:** `['my-listings']` باید `['listings','my']` باشد، `['all-listings',params]` باید `['listings','all',params]` باشد، `['notification-preferences']` باید `['auth','notification-preferences']` باشد. `invalidateQueries(['listings'])` برخی کش‌ها را پاک نمی‌کند. | High |
| F2 | [C] 🔍 | `nextjs-frontend/src/lib/api.ts:36` + `queryClient.ts:9` | **Double-retry:** axios-retry ۳ تلاش (`exponentialDelay`) + React Query `retry: 1` ← بعضی خطاها ۶ بار تلاش. | High |
| F3 | [C] 🔍 | `nextjs-frontend/src/components/common/CustomCursor.tsx:46` | `document.elementFromPoint` هر ۵۰ms روی mousemove → forced layout. | Medium |
| F4 | [C] 🔍 | `nextjs-frontend/src/components/listing/ListingCard.tsx:22` | `useCompareStore()` بدون selector ← subscribe به کل store. تغییر در هر compare state همه کارت‌ها را re-render. | Medium |
| F5 | [C] 🔍 | `nextjs-frontend/src/components/listing/ListingForm/index.tsx:118` | Edit mode: `data={}` (object literal جدید هر رندر) ← `useAutoSave` هر رندر `setTimeout`/`clearTimeout`. | Low |
| F6 | [C] 🔍 | `nextjs-frontend/src/app/(public)/listings/[slug]/page.tsx:13-27` | ۱۱ دینامیک import ← ۱۱ درخواست chunk جدا. | Medium |
| F7 | [C] 🔍 | `nextjs-frontend/src/components/common/PWAProvider.tsx:16` | `.catch(() => {})` — خطاهای SW registration قورت داده می‌شوند. | Low |
| F8 | [C] 🔍 | `nextjs-frontend/src/components/common/GlassSelect.tsx:19` | فاقد `forwardRef`. | Low |
| F9 | [C] 🔍 | `nextjs-frontend/src/components/listing/ListingCard.tsx:47` | `<Image>` بدون `priority` — LCP قابل بهینه‌سازی. | Low |
| F10 | [C] 🔍 | `nextjs-frontend/src/components/common/CustomCursor.tsx:24` | `* { cursor: none !important; }` سراسری — تداخل با focus indicator. | Low |
| F11 | [C] 🔍 | `nextjs-frontend/src/components/common/ErrorBoundary.tsx:19` | دکمه retry `setState({ hasError: false })` — صحیح است. | — |
| F12 | [C] 🔍 | `nextjs-frontend/src/components/common/ThemeToggle.tsx:10-17` | Hydration handling صحیح: fallback تا mount. | — |
| F13 | [C] 🔍 | `nextjs-frontend/src/lib/api.ts:16-22` | `getApiErrorMessage` خطای سرور را به UI می‌فرستد. اگر بک‌اند جزئیات داخلی بدهد، نشت می‌کند. | Medium |
| F14 | [C] 🔍 | `nextjs-frontend/next.config.ts:23-27` | `scrollRestoration`, `optimizeServerReact` — احتمالاً deprecated. | Low |

---

## فاز ۴ — Type Safety & Data Consistency (۶ مشکل)

| # | مبدأ | فایل‌ها | شرح | اولویت |
|---|------|---------|------|--------|
| T1 | [B] 🔍 | `backend/.../listings.ts:13-14` ↔ `frontend/.../listing.ts:1-22` | عدم تطابق nullable: `Listing.title` در فرانت non-optional ولی backend ممکن است null بدهد. `category_id: number | null` در فرانت ولی backend `z.number().positive()`. | Medium |
| T2 | [B] 🔍 | `frontend/.../listing.ts:90-101` ↔ `backend.ts:117-129` | Conversation shape mismatch: فرانت `{ buyer: User, seller: User }`, بک‌اند `{ buyer_id, buyer_name }`. | High |
| T3 | [B] 🔍 | `frontend/.../user.ts:8` | `User.role` تایپ فرانت با بک‌اند مطابقت دارد. صحیح. | — |
| T4 | [B] 🔍 | `backend/.../auth.ts:210-225` | SanitizeUser مقادیر `camelCase` برمی‌گرداند (`emailVerified`) که با type فرانت سازگار است. | — |
| T5 | [A] | (پروژه) | TypeScript strict mode gaps: `any`, type assertions. | Low |
| T6 | [A] | (پروژه) | *Backend snake_case ↔ frontend camelCase در برخی موارد.* نیاز به بررسی. | Medium |

---

## فاز ۵ — Polish & Testing (۱۲ مشکل)

| # | مبدأ | شرح | اولویت |
|---|------|------|--------|
| P1 | [A],[B] | Test coverage: صفر تست در هر دو پروژه | High |
| P2 | [A] | UI/UX: RTL issues, loading/empty/skeleton states, focus management | Medium |
| P3 | [A] | API docs / Swagger پیکربندی نشده | Low |
| P4 | [A] | Heavy dependency: `framer-motion` (~30KB gzipped) | Low |
| P5 | [A] | Push notification service پیکربندی نشده | Low |
| P6 | [A] | No backup strategy for uploaded media | Low |
| P7 | [A] | *Debug/archived endpoints ممکن است در معرض view عمومی* — نیاز به بررسی | Medium |
| P8 | [A] | Image upload بدون compression/resizing | Low |
| P9 | [A] | DB migration locking غیرفعال | Low |
| P10 | [A] | *Password reset token بدون expiry در DB* — نیاز به بررسی | Medium |
| P11 | [A] | *Logger بدون request ID* — نیاز به بررسی | Low |
| P12 | [A] | *WebSocket auth token در query string* — نیاز به بررسی | Medium |

---

## خلاصه آمار

| فاز | عنوان | تعداد | بحرانی | High | Med | Low |
|-----|-------|-------|--------|------|-----|-----|
| **۱** | Auth بحرانی | ۱۲ | ۶ | ۴ | ۱ | ۱ |
| **۲** | Backend API | ۲۲ | ۰ | ۱۰ | ۷ | ۵ |
| **۳** | Frontend Architecture | ۱۴ | ۰ | ۲ | ۴ | ۸ |
| **۴** | Type Safety | ۶ | ۰ | ۱ | ۳ | ۲ |
| **۵** | Polish & Testing | ۱۲ | ۰ | ۱ | ۴ | ۷ |
| **مجموع** | | **۶۶** | **۶** | **۱۸** | **۱۹** | **۲۳** |

---

## استراتژی اجرا

1. **فاز ۱** — Auth بحرانی: رفع broken token persistence, OTP, email verify, refresh rotation, XSS
2. **فاز ۲** — Backend API: فیلترهای search, endpoints گمشده, error handling یکپارچه, امنیت
3. **فاز ۳** — Frontend: queryKeys, double-retry, ListingCard, dynamic imports بهینه
4. **فاز ۴** — Type Safety: رفع mismatchها, strict mode
5. **فاز ۵** — Polish: تست, UI/UX, docs
