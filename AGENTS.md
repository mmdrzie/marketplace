# Session Summary

## Objective
- Maintain the catalog domain (catalog_types + categories + parts + compatibility): admin CRUD, public browse, tuning + accessory storefronts, wizard search.
- New: workshops section (تعمیرکاران و تیونرها) — self-registration with admin approval, public listing with city/type filters, profile pages.
- DB schema is locked for the catalog domain — the workshops feature needed ONE new table (050_workshop_profiles.sql).

## Important Details
- پروژه: Next.js 16 (App Router) + Hono backend + PostgreSQL (Supabase); Farsi RTL.
- Catalog URL layout is slug-based: `/catalog/{slug}` → 308 → `/catalog/{slug}/parts` (both `tuning` and `accessory` redirect). Three generic dynamic routes serve every catalog: `catalog/[slug]/parts`, `catalog/[slug]/parts/[id]`, `catalog/[slug]/search`.
- `catalog_types` has `is_public` flag gating public visibility; `accessory` catalog has been made public.
- `brands.id` is `BIGINT` (NOT UUID) — FK columns in parts tables use `BIGINT`; `users.id` is UUID.
- Catalogs: **tuning** (قطعات تیونینگ, vehicles: خودرو/موتورسیکلت) and **accessory** (اکسسوری و تزئینات، part_type=universal, 8 groups). Truck/construction/agricultural vehicles were removed from DB; DB now: 2 roots, 76 active tuning categories, 40 tuning parts, 44 accessory categories, 34 accessory parts.
- Filter UI: standalone search input + category filter popup (`CatalogFilterModal`) + vehicle filter popup (`VehicleFilterModal`) + «بر اساس» sort dropdown; «نوع موتور» filter is **static UI-only**.
- `useCatalogCategories` has `staleTime: 30 * 1000` (was 10 min — caused stale category popup after DB changes).
- **Workshops domain**: `workshop_profiles` table (user_id UUID PK, workshop_name, workshop_slug UNIQUE, type CHECK mechanic/tuner/both, specialty, city, address, phone, hours, services TEXT[], description, logo, cover_image, documents TEXT[], status CHECK pending/approved/rejected/suspended, admin_note, approved_at). Public list shows only `status='approved'`.
- **BLOCKED: Supabase unreachable** — `npm run migrate` times out (ETIMEDOUT on pooler.supabase.com:6543 AND supabase.com web also times out; general internet works). Project likely paused or network-blocked. Migration `050_workshop_profiles.sql` written but NOT yet applied. Supabase must be unpaused/reachable before any DB work.
- Frontend typecheck: only pre-existing error `src/lib/api.test.ts(45,5)` (axios adapter mock typing). Build passes (84 pages incl. 4 workshop routes).
- Deployment to Vercel was skipped (no credentials in env; user handles `vercel login`).

## Work State
### Completed
- **Workshops backend** (all compiles, `npx tsc --noEmit` exit 0):
  - `backend/migrations/050_workshop_profiles.sql` — NEW table (NOT yet applied to DB)
  - `backend/src/domain/services/workshopService.ts` — listPublic (approved, q/type/city + pagination), listCities, getPublicBySlug, getByUser, register (upsert ON CONFLICT user_id → resets to pending), update (whitelisted fields), adminList/approve/reject/suspend/update/delete
  - `backend/src/domain/presentation/workshop/WorkshopController.ts` — public + owner + admin handlers
  - `backend/src/routes/v2-workshops.ts` — GET / (public), GET /cities, GET /my (auth), POST / (auth), PUT /my (auth), GET /:slug (public) — order: /cities & /my BEFORE /:slug
  - `backend/src/routes/admin.ts` — /admin/workshops CRUD + approve/reject/suspend (behind auth('admin'))
  - `backend/src/routes/index.ts` — mounted `/v2/workshops`
- **Workshops frontend** (build ✓):
  - `src/hooks/useWorkshops.ts` — public list/cities/detail, my/register/update, admin list/approve/reject/suspend/delete + `WORKSHOP_TYPE_LABELS`
  - `src/app/(public)/workshops/page.tsx` — search (debounced) + type filter buttons (تعمیرکار/تیونر/هر دو) + city select (from `/v2/workshops/cities`) + card grid (name, type badge, specialty, city/address, phone, hours) + «+ ثبت تعمیرگاه» CTA
  - `src/app/(public)/workshops/[slug]/page.tsx` — profile: gradient cover, logo, type badge, owner name, specialty, tel CTA, about, services chips, contact/address card (city, address, phone, hours)
  - `src/app/(public)/workshops/register/page.tsx` — status card when registered (with edit + public profile link) OR form; login prompt on 401
  - `src/components/workshops/WorkshopRegistrationForm.tsx` — full form (name, slug, type select, specialty, city, address, phone, hours, services comma-split, description, DocumentUploader) reused for create (useRegisterWorkshop) + edit (useUpdateWorkshop)
  - `src/app/(admin)/admin/workshops/page.tsx` — status tabs (pending/approved/rejected/suspended/all), approve/reject(note modal)/suspend(ConfirmDialog danger), documents links, public profile link
- **Nav links everywhere**: public menuLinks, Sidebar, Dock, MobileIslandNav, Footer, dashboard, dealer, admin sidebar («تعمیرکاران و تیونرها» next to parts links).
- **Accessory catalog (earlier)**: seed + generic `[slug]` routes + redirects + nav + homepage card (see below).
- `docs/adr/ADR-011-catalog-domain.md`, `docs/catalog-tuning-plan.md` — catalog docs.
- Build verified: `/workshops` ○, `/workshops/[slug]` ƒ, `/workshops/register` ○, `/admin/workshops` ○, `/workshop` ○, `/workshop/profile` ○.

### Active
- (none — feature code complete)

### Blocked
- **Migration 050 not applied** — Supabase unreachable (ETIMEDOUT to pooler.supabase.com:6543 and supabase.com; Google reachable). User must unpause the Supabase project / fix network, then run `npm run migrate` in `backend/`.
- After migration: optionally seed a couple of demo workshop profiles for testing the flow.

## Next Move
- Run `backend`: `npm run migrate` once Supabase is reachable, then test the full flow: register → `/register?redirect=/workshops/register` → submit form → `/admin/workshops` approve → view `/workshops/[slug]`.
- Optional: SEO metadata for workshop pages.

## Relevant Files
- `backend/migrations/050_workshop_profiles.sql` — NEW, NOT yet applied (DB unreachable)
- `backend/src/domain/services/workshopService.ts` — **re-submit logic**: owner `update()` resets status rejected/suspended → pending (clears admin_note); register+update validate slug regex and translate PG 23505 duplicate slug → `AppError.resourceConflict('این آدرس اینترنتی (slug) قبلاً استفاده شده است')`
- `backend/src/domain/presentation/workshop/WorkshopController.ts`, `backend/src/routes/v2-workshops.ts` (NEW), admin.ts (workshop routes), index.ts (mount)
- Frontend workshops: `src/hooks/useWorkshops.ts` (+`useAdminUpdateWorkshop`), `src/app/(public)/workshops/{page,[slug]/page,register/page}.tsx`, `src/components/workshops/WorkshopRegistrationForm.tsx`, `src/app/(admin)/admin/workshops/page.tsx` (now with **edit modal** — name/type/status/specialty/city/phone/address/hours/services — and **delete** ConfirmDialog)
- **Workshop panel**: `src/app/(workshop)/layout.tsx` (PanelSidebar, auth-gated → /login?redirect=/workshop), `workshop/page.tsx` (dashboard: status hero, info cards, services, pending notice), `workshop/profile/page.tsx` (create/edit form)
- **Auth redirects**: `src/app/(auth)/login/page.tsx` + `register/page.tsx` now support `?redirect=` (Suspense-wrapped inner components); `/workshops/register` shows LoginGate when logged out (login/register buttons with redirect back)
- Owner edit link on public profile (`user.id === workshop.user_id` → «ویرایش پروفایل»); «پنل تعمیرکار» added to dashboard + dealer layouts
- Public profile has **«مسیریابی در نقشه»** button (Google Maps search by city + address)
- **Homepage card**: `(public)/page.tsx` section 4c «تعمیرکاران و تیونرها» (below parts card)
- **Workshops design system** («پلاک تعمیرگاه»): `src/components/workshops/workshopMeta.tsx` — type-coded colors: mechanic→`accent-blue` (آچار), tuner→`accent-indigo` (برق), both→`accent-purple` (چرخدنده); each meta has label/icon/text/bg/border/glow/strip gradient classes + `WorkshopTypeIcon`. `WorkshopCard.tsx` = listing card with colored plate strip (type + city). Applied on: listing page (hero stats + colored filter pills + cards), public profile (plate + colored glow hero + colored badge/icon tiles/services chips), workshop panel (dashboard hero + info cards), register status card, admin cards (colored type badge).
- Backend seeds: `backend/scripts/seed-catalog-accessory.mts`, `seed-catalog-tuning.mts`
- `backend/src/domain/services/partsService.ts` + `presentation/catalog/CatalogController.ts` + `routes/v2-catalogs.ts`: catalog API (facade pattern — ADR-011)
- Generic catalog routes: `nextjs-frontend/src/app/(public)/catalog/[slug]/parts/page.tsx`, `parts/[id]/page.tsx`, `search/page.tsx`
- Components: `src/components/catalog/` (CatalogFilterModal, TuningGroupSelector, TuningFilterChips, CatalogPartCard, CatalogCategoryTree), `src/components/parts/VehicleFilterModal.tsx` (exports ENGINE_TYPES)
- Hooks: `src/hooks/useCatalogs.ts` (staleTime 30s for categories), `useWorkshops.ts`, `usePartsV2.ts`
- Nav: `(public)/layout.tsx`, `components/layout/{Sidebar,MobileIslandNav,Footer}.tsx`, `components/common/Dock.tsx`, `(dashboard)/layout.tsx`, `(dealer)/layout.tsx`, `(admin)/layout.tsx`
- Homepage cards: `src/app/(public)/page.tsx` sections 4 (tuning) / 4a (accessory) / 4b (parts) / 4c (workshops)
- `nextjs-frontend/next.config.ts`: redirects
- `docs/adr/ADR-011-catalog-domain.md`, `docs/catalog-tuning-plan.md`
- `src/lib/api.test.ts(45,5)`: pre-existing typecheck error (not from this work)
