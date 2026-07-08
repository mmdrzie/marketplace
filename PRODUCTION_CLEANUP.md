# Production Cleanup Checklist

> مواردی که قبل از رفتن به پروداکشن باید پاک/تغییر داده شوند.

## 1. Demo Mode (`NEXT_PUBLIC_DEMO_MODE`)

- [ ] حذف `NEXT_PUBLIC_DEMO_MODE=true` از `nextjs-frontend/.env.local`
- [ ] حذف دکمه‌های انتخابی نقش در `nextjs-frontend/src/app/(auth)/login/page.tsx`
- [ ] حذف `demoLogin()` از `nextjs-frontend/src/hooks/useAuth.ts`
- [ ] حذف `DEMO_USERS` map از `nextjs-frontend/src/hooks/useAuth.ts`
- [ ] حذف `DEMO_TOKEN` constant از `nextjs-frontend/src/hooks/useAuth.ts`
- [ ] برگرداندن `loginWithEmail` به عنوان تنها روش لاگین
- [ ] حذف شرط `isDemoMode` از `useAuth` export

## 2. API Demo Guard

- [ ] حذف شرط `process.env.NEXT_PUBLIC_DEMO_MODE !== 'true'` از `nextjs-frontend/src/lib/api.ts` (خط ۶۶)
- [ ] برگرداندن `window.location.href = '/login'` به حالت قبل

## 3. Auth Store

- [ ] حذف `setUser` مستقیم از `authStore` (اگر فقط برای دمو اضافه شده)
- [ ] اطمینان از اینکه `token` در localStorage ذخیره نمی‌شود

## 4. Seed Data (Backend)

- [ ] حذف دمو یوزرها از `backend/migrations/011_seed.sql`
  - `demo@marketplace.com` — کاربر آزمایشی
  - (ادمین `admin@marketplace.com` در صورت نیاز در پروداکشن نگه داشته شود)

## 5. Frontend Mock Data

- [ ] حذف mock data fallback از `nextjs-frontend/src/hooks/useListings.ts`
- [ ] حذف mock data fallback از `nextjs-frontend/src/hooks/useChat.ts`
- [ ] حذف mock data fallback از `nextjs-frontend/src/hooks/useNotifications.ts`
- [ ] حذف `MOCK_*` از `nextjs-frontend/src/lib/mockData.ts`
- [ ] حذف `nextjs-frontend/src/lib/mockData.ts` (کل فایل)

## 6. Auth Guard

- [ ] مطمئن شوید `AuthGate.tsx` روی تمام صفحه‌های محافظت‌شده اعمال شده
