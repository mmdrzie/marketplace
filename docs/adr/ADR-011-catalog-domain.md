# ADR-011: Catalog Domain (Tuning) — Facade Controllers, Slug Layout, Locked Schema

**Status:** Accepted  
**Date:** 2026-07-31  
**Supersedes:** —  
**Author(s):** Architecture Team

## Context

The marketplace needed a second product domain — a **tuning parts catalog** — with hierarchical categories (`catalog_categories`, 3 levels: vehicle type → group → type), parts linked to vehicle taxonomy (brand/model/year), and a storefront under `/catalog/tuning/*`. Key constraints:

- The database schema (migration `049_catalog_domain.sql`) is **locked** — no schema changes were permitted during the feature build; only queries, redirects, and components could be added.
- The existing parts backend already had a large `partsService` (≈ 1000 lines) and a `PartsController` with 30+ methods. Duplicating it for the catalog domain would double maintenance.
- `brands.id` is `BIGINT` (not UUID) — all catalog FK columns use `BIGINT`.
- Categories need a fast, denormalized breadcrumb for API responses without recursion per request.

## Decision

### 1. Reuse `partsService` as the single domain source; Facade controllers per feature

- All catalog queries live in `backend/src/domain/services/partsService.ts` (extended, not duplicated).
- `CatalogController` (`backend/src/domain/presentation/catalog/CatalogController.ts`) is a **thin facade** that orchestrates `partsService` methods for catalog routes; `PartsController` covers parts/admin routes.
- Rationale: catalog and parts share the same aggregate (`parts` table + `part_compatible_models`); splitting services would duplicate SQL and risk drift.

### 2. No duplicate queries — single query per read with JOINs

- `GET /v2/catalogs/:slug/parts` performs **one** query with LEFT JOINs to `catalog_categories`, `part_types`, `brands`, `vehicle_models`, and a `LATERAL` for min-price — no N+1, no query-per-row.
- `adminListParts` (admin) extends the same query with `part_type_id` filter and catalog path labels.
- Category trees are fetched as a flat list and assembled into a tree in the service layer (one query per request).

### 3. Slug layout with 308 redirects

- Public storefront lives under `/catalog/<slug>` (slug = `tuning`).
- Legacy `/tuning/:path*` permanently redirects (308) to `/catalog/tuning/:path*` in `next.config.ts`.
- Admin routes remain `/admin/parts/*` (list + category management), grouped with tabs, not separate nav entries.

### 4. Schema invariants enforced by the database (locked schema)

- `path` and `depth` on `catalog_categories` are maintained by a database trigger (no app-side recursion writes).
- Soft delete (`deleted_at`) with cascade semantics for children; restore endpoint for undoing.
- `catalog_category_id` on `parts` is a plain nullable FK; catalog membership is single (a part belongs to exactly one catalog category) — no many-to-many, because the domain (tuning) only needs single categorization.

### 5. API shape (REST, versioned under `/v2/catalogs`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/v2/catalogs` | list catalogs |
| GET | `/v2/catalogs/:slug` | catalog meta |
| GET | `/v2/catalogs/:slug/categories` | category tree |
| GET | `/v2/catalogs/:slug/categories/:id` | category + children |
| GET | `/v2/catalogs/:slug/parts` | search/list (q, category, brand_id, model_id, year, sort, page, limit) |
| GET | `/v2/catalogs/:slug/parts/:id` | part detail |
| GET | `/v2/catalogs/:slug/parts/:id/stores` | store price offers |
| GET/POST/PUT/DELETE | `/admin/catalog-categories` (+ `PUT :id/restore`) | admin category CRUD (soft delete) |
| GET | `/admin/catalog-types` | catalog type lookups |
| GET | `/admin/part-types` | part type lookups |
| PUT | `/admin/parts/:id/specs` | tuning spec sheet (stage/hp/tq/boost/ecu/proInstall/notes) |

### 6. Frontend conventions

- TanStack Query v5: `useInfiniteQuery` requires `initialPageParam` (1) and `getNextPageParam` based on `total`.
- `useSearchParams` must be wrapped in `<Suspense>` (Next.js 16 build requirement).
- Next.js 16.2.9 dynamic route params are Promises — `useParams<{id: string}>()` in client components.
- Admin category tree management is tabbed under `/admin/parts/categories` (parts categories | catalog categories), sharing the same list/CRUD UX patterns.

## Consequences

- **Positive:** one service layer; schema stays locked; redirect keeps legacy URLs working; breadcrumbs are O(1) via `path`; single-page admin for both category systems.
- **Negative:** `partsService` grows further (facade keeps controllers thin but the service is a god-object risk); a part can only belong to one catalog category; admin endpoints live in the parts admin area rather than a separate catalog module.
- **Trade-off accepted:** if a future catalog (non-tuning) needs multi-categorization, add a `part_catalog_links` table via a new (unlocked) migration; current single-FK design was chosen for the locked-schema constraint.

## References

- Migration: `backend/migrations/049_catalog_domain.sql`
- Plan: `docs/catalog-tuning-plan.md` (v8, locked)
- Controller: `backend/src/domain/presentation/catalog/CatalogController.ts`
- Routes: `backend/src/routes/v2-catalogs.ts`
- Frontend hooks: `nextjs-frontend/src/hooks/useCatalogs.ts`
- Storefront: `nextjs-frontend/src/app/(public)/catalog/tuning/*`
