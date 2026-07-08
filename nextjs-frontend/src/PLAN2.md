# PLAN2 — Marketplace Implementation Blueprint

## Architecture Principles

1. Business logic lives ONLY inside Domain Services.
2. Server Actions are thin wrappers — authenticate, validate, call Domain Service, return response.
3. Repositories only perform database operations — no business logic, no transformations, no permission checks.
4. UI never contains business logic — components render state, they do not compute permissions or enforce rules.
5. Permissions are checked ONLY through `PermissionService` — never inline `if (user.role === 'admin')` in a route handler.
6. External providers are accessed ONLY through interfaces — Email, SMS, payments, file storage all have swap-ready interfaces. Domain layer imports the interface, not the implementation.
7. Every paid infrastructure component must have a documented trigger point — no paid service added before its trigger conditions are met.
8. Mobile applications consume the same Domain layer through future API Routes — no mobile-specific endpoints, no mobile fork of the API.
9. Caching must never become a source of truth — cache is a performance optimization, the database is the source of truth.
10. No feature may bypass the Domain layer — every operation goes through its Domain Service.

## Progressive Trust Model

Three independent, decoupled systems:

| System | Answers | Gates | Required at MVP |
|--------|---------|-------|----------------|
| Authentication | Who is the user? | All protected pages | Yes |
| Email Verification | Does the user own this email? | Nothing (password recovery only) | Yes, optional for UX |
| Phone Verification | Is this user trusted? | Publish listing, Send message, Upgrade to Dealer/Agency | Yes |

All four phone/email states are valid:
- email_verified=false, phone_verified=false — browse, search, favorites, drafts
- email_verified=true, phone_verified=false — all above
- email_verified=false, phone_verified=true — all above + privileged actions
- email_verified=true, phone_verified=true — everything

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind v4 |
| Frontend State | Zustand (client), TanStack Query (server) |
| Backend | Hono.js on Vercel Edge Functions |
| Database | Supabase PostgreSQL + pg_trgm |
| Cache | In-memory Map (MVP), Upstash Redis (triggered) |
| Auth | JWT (jose), httpOnly refresh cookie |
| Search | PostgreSQL pg_trgm (MVP), Meilisearch (triggered) |
| Files | Supabase Storage (S3-compatible) |
| Payments | PaymentInterface — Zarinpal (MVP) |
| Events | In-process EventBus (MVP), Redis/Inngest (triggered) |
| Email | EmailProvider interface — Console (dev), Noop (test), TBD (prod) |
| SMS | SMSProvider interface — Console (dev), Iranian provider (prod) |
| Testing | Vitest (unit), React Testing Library (integration), Playwright (E2E) |

## Repository Structure

```
marketplace/
├── backend/
│   ├── src/
│   │   ├── config/            # Environment config, rate limits, database, auth, email
│   │   ├── domain/
│   │   │   ├── entities/      # User, Listing, Conversation, Payment, Category
│   │   │   ├── services/      # AuthService, ListingService, ConversationService, etc.
│   │   │   └── events/        # EventBus interface, InMemoryEventBus, typed events
│   │   ├── middleware/        # Error handler, auth, rate limiter, phone gate, CORS
│   │   ├── routes/            # auth, email, phone, listings, conversations, admin, etc.
│   │   ├── repositories/     # UserRepo, ListingRepo, ConversationRepo, CategoryRepo
│   │   ├── services/         # Permission, Cache, Email, SMS, Payment abstractions
│   │   ├── validation/       # Zod schemas
│   │   ├── errors.ts         # AppError, error codes, HTTP status map
│   │   └── index.ts          # App bootstrap
│   ├── migrations/           # SQL migration files (NNN_name.sql)
│   ├── tests/                # Vitest test files
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── packages/
│   └── shared/               # @marketplace/shared — ErrorCode, ApiResponse types
├── src/                      # Existing Next.js frontend (modified)
│   ├── app/(auth)/           # Rewritten: login, register, verify-phone, forgot/reset password
│   ├── store/authStore.ts    # Extended
│   ├── hooks/useAuth.ts      # Rewritten
│   ├── hooks/usePhoneVerification.ts  # NEW
│   ├── components/common/AuthGate.tsx  # Extended (requirePhone prop)
│   ├── hooks/useListings.ts  # Extended (+phone gate error handling)
│   ├── hooks/useChat.ts      # Extended (+phone gate error handling)
│   └── PLAN2.md              # This file
├── docs/
│   ├── adr/                  # 8 Architecture Decision Records
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   └── CONTRIBUTING.md
├── .github/workflows/        # CI pipelines
├── .husky/                   # Git hooks
├── package.json              # Workspace root
└── .env.example
```

## Error Taxonomy

Every endpoint returns `{ success: true, data: T }` or `{ success: false, error: { code, message } }`.

Frontend switches on `error.code` only — never parses `error.message`.

| Code | HTTP | Usage |
|------|------|-------|
| VALIDATION_ERROR | 422 | Request body fails schema validation |
| UNAUTHORIZED | 401 | No/invalid JWT, missing auth header |
| FORBIDDEN | 403 | Authenticated but insufficient permission |
| NOT_FOUND | 404 | Resource does not exist |
| RATE_LIMITED | 429 | Global or specific rate limit exceeded |
| PHONE_VERIFICATION_REQUIRED | 403 | Privileged action attempted without verified phone |
| EMAIL_ALREADY_EXISTS | 409 | Duplicate email on registration |
| INVALID_CREDENTIALS | 401 | Wrong email or password |
| INVALID_TOKEN | 401 | Malformed JWT or refresh token |
| TOKEN_EXPIRED | 401 | Expired access token |
| OTP_INVALID | 422 | Wrong OTP code |
| OTP_EXPIRED | 422 | OTP older than 5 minutes |
| OTP_RATE_LIMITED | 429 | Too many OTP requests |
| PASSWORD_TOO_WEAK | 422 | Password fails minimum strength |
| RESOURCE_CONFLICT | 409 | Duplicate action or optimistic lock failure |
| INTERNAL_ERROR | 500 | Unhandled server error |

## API Endpoints Catalog (60 endpoints)

### Auth (7)
```
POST   /auth/register             { email, password, name } → { token, user }
POST   /auth/login                { email, password } → { token, user }
POST   /auth/refresh              (cookie) → { token }
POST   /auth/logout               → clears cookie
POST   /auth/forgot               { email } → sends reset email
POST   /auth/reset                { token, password } → OK
GET    /auth/me                   → { user }
PUT    /auth/me                   { name, avatar } → { user }
```

### Email (2)
```
POST   /email/send-verify         (auth) → sends verification email
GET    /email/verify/:token       → sets email_verified_at
```

### Phone (3)
```
POST   /phone/send-otp            (auth) { phone } → OK
POST   /phone/verify-otp          (auth) { phone, code } → sets phone_verified_at
GET    /phone/status              (auth) → { phone, verified }
```

### Categories (7)
```
GET    /categories                → Category[]
GET    /categories/:slug/attributes → Attribute[]
POST   /categories                (admin)
PUT    /categories/:id            (admin)
DELETE /categories/:id            (admin)
POST   /categories/:id/attributes (admin)
PUT    /attributes/:id            (admin)
DELETE /attributes/:id            (admin)
```

### Provinces (5)
```
GET    /provinces                 → Province[] (with cities)
POST   /provinces                 (admin)
DELETE /provinces/:id             (admin)
POST   /provinces/:id/cities     (admin)
DELETE /cities/:id                (admin)
```

### Listings (9)
```
GET    /listings                  (?scope=me, status, category, province, min_price, max_price, sort)
GET    /listings/:slug            → ListingDetail
POST   /listings                  (phone gate) → creates draft
PUT    /listings/:id              → updates listing
DELETE /listings/:id              → soft-deletes
PATCH  /listings/:id              { action: submit|sold|renew|approve|reject }
POST   /listings/:id/favorite     toggle
POST   /listings/:id/report       (auth)
```

### Search (1)
```
GET    /search                    ?q=...&category=...&province=...
```

### Favorites (1)
```
GET    /favorites                 (auth) → Listing[]
```

### Conversations (6)
```
GET    /conversations             (auth) → Conversation[]
GET    /conversations/:id         (auth) → Conversation (full)
POST   /conversations             (phone gate) { listing_id, message } → Conversation
POST   /conversations/:id/messages (auth) { body } → Message
PUT    /conversations/:id/read    (auth) → OK
GET    /conversations/unread-count (auth) → { count }
```

### Articles (2)
```
GET    /articles                  → Article[]
GET    /articles/:slug            → Article
```

### Users/Dealers (4)
```
GET    /users/:id/profile          → User
GET    /dealers/:id/profile        → DealerProfile
POST   /dealers/:id/reviews        (auth) → OK
POST   /account/upgrade            (phone gate) { role: dealer|agency } → upgrades account
```

### Dealer Dashboard (2)
```
GET    /dealer/stats              (auth, dealer) → stats
GET    /dealer/subscription       (auth, dealer) → subscription info
```

### Payments (2)
```
POST   /payments/featured         (auth) → payment_url
POST   /payments/dealer-subscription (auth) → payment_url
```

### Wallet (1)
```
GET    /wallet/transactions       (auth) → Transaction[]
```

### Notifications (3)
```
GET    /notifications             (auth) → Notification[]
PUT    /notifications/:id/read    (auth) → OK
PUT    /notifications/read-all    (auth) → OK
```

### Admin (9)
```
GET    /admin/users               (admin) → User[]
POST   /admin/users               (admin) → User
PUT    /admin/users/:id/role      (admin) → OK
PUT    /admin/users/:id/status    (admin) → OK
DELETE /admin/users/:id           (admin) → OK
GET    /admin/settings            (admin) → Settings
PUT    /admin/settings            (admin) → OK
GET    /admin/reports             (admin) → Report[]
PUT    /admin/reports/:id         (admin) → OK
```

### Uploads (1)
```
POST   /upload/presigned          (auth) → { url }
```

### Health (1)
```
GET    /health                    → { status: 'ok', timestamp, db }
```

## Database Migrations (11 total)

| # | Name | Tables | Reason for separate migration |
|---|------|--------|------------------------------|
| 001 | auth | users, refresh_tokens | Foundation identity — every other table references users. auth must exist before any feature. |
| 002 | verifications | email_verifications, phone_verifications | Depends on users. Both are optional auth enhancements, not core schema. |
| 003 | categories | categories, attributes, provinces, cities | Content structure — independent of auth, required by listings. |
| 004 | listings | listings, listing_attributes, listing_images | Core business entity — depends on users + categories. Largest migration. |
| 005 | search | pg_trgm extension, GIN indexes | PostgreSQL extension requires separate step. Index creation isolated. |
| 006 | chat | conversations, messages | Depends on users + listings. Independent business feature. |
| 007 | features | favorites, articles | Depends on users + listings. Small tables grouped together. |
| 008 | payments | payments, wallet_transactions | Depends on users. Compliance/audit requirements justify separation. |
| 009 | dealers | dealer_profiles | One-to-one with users. Post-registration feature, isolated. |
| 010 | notifications | notifications | References all entity types — intentionally last. |
| 011 | seed | Seed data | Reference data + demo data — separate from schema for environment independence. |

**Naming convention:** `NNN_name.sql` — 3-digit sequential, kebab-case name. Never renumber. Always append.

**Rollback:** Forward-only. Reverse changes by writing a new migration. Development: `supabase db reset`. Production: `NNN_rollback_name.sql`.

## Rate Limits (10 total)

| Endpoint | Limit | Window | Storage |
|----------|-------|--------|---------|
| Global API | 100 | 1 min | Memory |
| Login | 5 | 15 min | Memory |
| Registration | 5 | 1 hour | Memory |
| Send SMS OTP | 3 | 1 hour | Memory |
| Verify OTP | 10 | 15 min | Memory |
| Forgot Password | 3 | 1 hour | Memory |
| Resend Verification Email | 5 | 1 day | Memory |
| Publish Listing | 10 | 1 day | DB |
| Create Conversation | 30 | 1 hour | DB |
| Send Message | 60 | 1 min | Memory |

Single source of truth: `backend/src/config/rateLimits.ts`.

**Trigger for Redis:** When deployed to >1 Vercel Function instance.

## Token Storage Lifecycle

- **Access Token:** JWT, 15 min TTL. Stored in memory (Zustand variable). NEVER persisted to localStorage.
- **Refresh Token:** JWT, 7 day TTL. httpOnly cookie, `Path=/api/v1/auth`, `SameSite=Lax`, `Secure`.
- **Refresh flow:** `POST /auth/refresh` (cookie sent automatically) → new access token. Queue concurrent requests during refresh.
- **Page refresh:** Access token lost. `GET /auth/me` sent with cookie → re-authenticates, issues new access token. Zustand persists user metadata (not token).
- **Logout:** Clear memory, `POST /auth/logout` revokes refresh token server-side, clears cookie.
- **Security:** CSRF mitigated by SameSite=Lax + JSON API content type (not form-encoded).

## Permission Service (6 capabilities)

| Capability | Check |
|-----------|-------|
| `listing:publish` | phoneVerified === true |
| `listing:submit` | phoneVerified === true |
| `conversation:start` | phoneVerified === true |
| `account:upgrade-dealer` | phoneVerified === true && role === 'user' |
| `account:upgrade-agency` | phoneVerified === true && role === 'user' |
| `admin:access` | role === 'admin' |

Single file: `backend/src/services/permission/index.ts`. To add a new capability: add to Capability type, add to CAPABILITY_REQUIREMENTS map, use in route. No other code changes.

## Milestones Overview

| # | Milestone | Critical Path | Est. Duration | Depends On |
|---|-----------|--------------|---------------|------------|
| 0 | Foundation | Yes | 8-10 days | — |
| 1 | Authentication (Backend) | Yes | 5-7 days | 0 |
| 2 | Frontend Auth Rewrite | Yes | 5-7 days | 1 |
| 3 | Email & Phone Verification | Yes | 5-7 days | 1 |
| 4 | Categories, Attributes & Provinces | No (parallel) | 3-4 days | 0 |
| 5 | Listings | Yes | 8-12 days | 1, 3, 4 |
| 6 | Conversations | Yes | 5-7 days | 1, 3, 5 |
| 7 | Favorites, Articles, Tenders | No (parallel) | 4-5 days | 1, 5 |
| 8 | Payments & Wallet | No (parallel) | 4-5 days | 1, 5 |
| 9 | Dealer & Agency Upgrade | Yes | 3-4 days | 1, 3, 5 |
| 10 | Admin Panel | No (parallel) | 5-7 days | All above |
| — | Integration/QA | — | 5-7 days | All above |

**Total:** 10 milestones + QA. Critical path: M0→M1→M2→M3→M5→M6→M9 = 10-14 weeks.

---

## Phase 0: Foundation

**Goal:** Create a production-ready project foundation that all feature milestones build upon.

**Scope:** Repository structure, tooling, configuration, database, core abstractions, documentation, CI.

**Excluded:** Authentication, listings, chat, search, phone verification, dealer/agency, payments, UI features.

### Tasks

#### 0.0 Workspace Conversion
- Convert single-package npm project to npm workspaces monorepo
- Files modified: `package.json` (add workspaces field)
- Dependencies: None
- Complexity: M | Duration: 4h

#### 0.1 Backend Project Scaffold
- Create Hono.js project with TypeScript, all folder structure, base dependencies
- Files created: `backend/package.json`, `backend/tsconfig.json`, `backend/src/index.ts`, `backend/.env.example`, all subdirectories
- Dependencies: 0.0
- Complexity: M | Duration: 4h

#### 0.2 Shared Packages
- Create `packages/shared/` with ErrorCode enum, ApiResponse types
- Files created: `packages/shared/src/errors.ts`, `packages/shared/src/response.ts`, `packages/shared/package.json`, `packages/shared/tsconfig.json`
- Dependencies: 0.0
- Complexity: S | Duration: 2h

#### 0.3 Root Configuration Update
- Add workspace scripts (dev:backend, test:backend, dev:all, etc.)
- Preserve all existing frontend scripts unchanged
- Files modified: `package.json`
- Dependencies: 0.0
- Complexity: S | Duration: 2h

#### 0.4 Backend Configuration
- Create config files: env loader, database connection, auth config, email config, rate limits
- Files created: `backend/src/config/index.ts`, `backend/src/config/database.ts`, `backend/src/config/auth.ts`, `backend/src/config/email.ts`, `backend/src/config/rateLimits.ts`
- Dependencies: 0.1
- Complexity: M | Duration: 4h

#### 0.5 Database Setup & Migration Strategy
- Initialize Supabase project locally, configure migration workflow
- Define naming convention, seed strategy, rollback strategy, environment separation
- Files created: `backend/supabase/config.toml`, `backend/migrations/.gitkeep`
- Dependencies: 0.4
- Complexity: L | Duration: 1d

#### 0.6 Error Taxonomy Module
- Implement AppError class, error code constants, HTTP status map, shortcut constructors
- Implement global error handler middleware
- Files created: `backend/src/errors.ts`, `backend/src/middleware/errorHandler.ts`, `backend/src/config/response.ts`
- Dependencies: 0.1, 0.2
- Complexity: M | Duration: 4h

#### 0.7 Core Abstractions
- **0.7.1 Event Bus:** Interface + InMemoryEventBus. publish/subscribe typed events.
- **0.7.2 Memory Cache:** Map-based getCached/setCache/invalidateCache with TTL.
- **0.7.3 PermissionService:** can()/requireCapability() for 6 capabilities.
- **0.7.4 Email Provider:** Interface + ConsoleEmailProvider + NoopEmailProvider.
- **0.7.5 SMS Provider:** Interface + ConsoleSMSProvider.
- **0.7.6 Validation Schemas:** Placeholder module structure (empty until features).
- Files created: ~12 files across `backend/src/domain/events/`, `backend/src/services/cache/`, `backend/src/services/permission/`, `backend/src/services/email/`, `backend/src/services/sms/`, `backend/src/validation/`
- Dependencies: 0.1, 0.6
- Complexity: L | Duration: 2d

#### 0.8 Health Endpoint & Middleware Stack
- Wire Hono.js app with CORS, rate limiter, error handler middleware
- Add `GET /api/v1/health` endpoint
- Files created: `backend/src/middleware/cors.ts`, `backend/src/middleware/rateLimiter.ts`, `backend/src/routes/index.ts`, update `backend/src/index.ts`
- Dependencies: 0.6, 0.7
- Complexity: M | Duration: 4h

#### 0.9 Development Tooling
- Add Prettier config, Husky commit-msg hook (conventional commits), update lint-staged
- Files created: `.prettierrc`
- Files modified: `.husky/pre-commit`, `.husky/commit-msg`
- Dependencies: 0.0
- Complexity: S | Duration: 2h

#### 0.10 CI Pipeline
- GitHub Actions workflows: main CI, backend, frontend
- Files created: `.github/workflows/ci.yml`, `.github/workflows/backend.yml`, `.github/workflows/frontend.yml`
- Dependencies: 0.1, 0.9
- Complexity: M | Duration: 4h

#### 0.11 Documentation & ADRs
- Create docs folder structure, 8 ADRs, README, CONTRIBUTING, API, DEPLOYMENT, SECURITY, CHANGELOG
- Files created: ~15 files across `docs/`
- Dependencies: 0.0
- Complexity: M | Duration: 4h

#### 0.12 Seed Strategy
- Define seed conventions, create seed runner structure
- Files created: `backend/src/seeds/index.ts`, `backend/src/seeds/seed-data.ts`
- Dependencies: 0.5
- Complexity: S | Duration: 1h

#### 0.13 Quality Gates Verification
- Run all quality gates: TypeScript, ESLint, tests, Prettier, health endpoint, rate limiter, error format, database connection, git hooks, CI
- Verify all 13 gates pass before declaring Phase 0 complete
- Dependencies: 0.0-0.12
- Complexity: S | Duration: 1h

### Phase 0 Acceptance Criteria (Key)
- `GET /health` returns `{ success: true, data: { status: 'ok', timestamp, db: 'connected' } }`
- Rate limiter blocks request #101, returns 429 with Retry-After
- Unknown route returns `NOT_FOUND` error
- AppError returns correct status code for all 16 error codes
- Event Bus delivers to all subscribers, errors don't propagate
- Cache set/get/expire/invalidate works correctly
- PermissionService gates all 6 capabilities correctly
- Email/SMS providers swap via env var
- Backend compiles, lints, tests pass
- Frontend compiles, lints, tests pass (unchanged)
- Git hooks enforce conventional commits
- CI passes on PR

---

## Phase 1: Authentication (Backend)

**Goal:** Users can register, login, refresh tokens, logout. Auth middleware works. Token lifecycle complete.

### Database Migrations
- `001_auth.sql` — users table (email, password_hash, name, phone, email_verified_at, phone_verified_at, role, avatar, city, status, timestamps). refresh_tokens table (user_id, token_hash, expires_at, revoked_at).

### API Endpoints
- `POST /auth/register` — validate input, check email uniqueness, hash password, insert user, sign tokens, set cookie, return `{ token, user }`
- `POST /auth/login` — rate limited (5/15min), find user, compare password, sign tokens, set cookie, return `{ token, user }`
- `POST /auth/refresh` — read cookie, verify JWT, check not revoked, rotate token, return `{ token }`
- `POST /auth/logout` — revoke refresh token in DB, clear cookie
- `GET /auth/me` — auth middleware required, return current user
- `POST /auth/forgot` — rate limited (3/h), find user by email, send password reset email (via EmailProvider), always return success (don't reveal if email exists)
- `POST /auth/reset` — validate token, hash new password, update user

### Files Created
```
backend/src/
├── domain/services/auth.ts         # register(), login(), refresh(), logout(), forgotPassword(), resetPassword()
├── repositories/user.ts            # findByEmail(), findById(), create(), update(), updatePassword()
├── routes/auth.ts                  # All auth route handlers
├── middleware/auth.ts              # JWT verify middleware, attaches req.user
├── middleware/rateLimiter.ts       # Already exists from Phase 0 — wire specific limits
├── services/jwt.ts                 # sign(), verify() using jose
└── config/auth.ts                  # Already exists from Phase 0 — add JWT config values
```

### Acceptance Criteria (Measurable)
- [ ] Register with valid data creates user row, returns JWT + sets httpOnly refresh cookie
- [ ] Register with existing email returns `EMAIL_ALREADY_EXISTS`
- [ ] Register with weak password returns `PASSWORD_TOO_WEAK`
- [ ] Login with valid credentials returns JWT + sets cookie
- [ ] Login with wrong password returns `INVALID_CREDENTIALS`
- [ ] Login with non-existent email returns same `INVALID_CREDENTIALS` (no enumeration)
- [ ] Login rate limited at 6th attempt in 15 min
- [ ] Refresh with valid cookie returns new JWT + rotates refresh token
- [ ] Refresh with revoked token returns `UNAUTHORIZED`
- [ ] Logout revokes refresh token, clears cookie
- [ ] Auth middleware: valid token passes, attaches user; no token returns `UNAUTHORIZED`; expired token returns `TOKEN_EXPIRED`
- [ ] Forgot password sends email with reset token (logged to console in dev)
- [ ] Reset password with valid token updates password; invalid token returns `INVALID_TOKEN`
- [ ] Password stored as bcrypt hash, never plaintext

### Dependencies: Phase 0 complete

---

## Phase 2: Frontend Auth Rewrite

**Goal:** Email+password login and registration. In-memory access token, httpOnly refresh cookie. Demo mode behind env flag. Auth store updated.

### Files Modified
- `src/store/authStore.ts` — add phoneVerified, pendingAction, setPhoneVerified, setPendingAction. Remove token from persist (memory only).
- `src/lib/api.ts` — change token injection to read from memory. Refresh flow uses httpOnly cookie. Add 401 interceptor for redirect on refresh failure.
- `src/hooks/useAuth.ts` — replace sendOtp/verifyOtp with registerWithEmail, loginWithEmail, forgotPassword, resetPassword, logout.

### Files Created
- `src/app/(auth)/forgot-password/page.tsx` — email input, success message
- `src/app/(auth)/reset-password/page.tsx` — new password + confirm, reads token from query param

### Files Modified (Rewrite)
- `src/app/(auth)/login/page.tsx` — remove PhoneStep, OtpStep, DemoStep. Add Email+Password form. Add forgot password link. Add demo button behind `NEXT_PUBLIC_DEMO_MODE`. Keep glass styling, FadeIn, SVG header.
- `src/app/(auth)/register/page.tsx` — remove role cards, phone field, business name. Add Name+Email+Password+Confirm Password. On success: toast + redirect to /.

### Files Deleted
- `src/app/(auth)/login/verify/page.tsx` — no longer needed (OTP is phone verification only)

### Acceptance Criteria
- [ ] Login form calls `POST /auth/login`, stores token in memory (not localStorage), stores user in Zustand, redirects to /
- [ ] Invalid credentials shows error (does not redirect) — "ایمیل یا رمز عبور اشتباه است"
- [ ] Register form calls `POST /auth/register`, shows success toast, redirects to /
- [ ] Duplicate email shows "این ایمیل قبلاً ثبت شده است"
- [ ] Weak password shows "رمز عبور باید حداقل ۸ کاراکتر داشته باشد"
- [ ] Access token not visible in localStorage (verified in devtools)
- [ ] Page refresh: Zustand persists user metadata (name, email, role), token re-obtained via GET /auth/me with cookie
- [ ] Logout clears token memory, calls POST /auth/logout, clears Zustand, redirects to /login
- [ ] Demo mode: login button visible only when `NEXT_PUBLIC_DEMO_MODE=true`
- [ ] Forgot password shows success message regardless of whether email exists
- [ ] Reset password with valid token works, invalid/expired shows error
- [ ] AuthGuard redirects unauthenticated users to /login

### Dependencies: Phase 1 complete (or API contract agreed)

---

## Phase 3: Email & Phone Verification

**Goal:** Email verification is optional (never gates anything). Phone verification gates privileged actions. PermissionService wired to all restricted routes.

### Database Migrations
- `002_verifications.sql` — email_verifications (user_id, token_hash, expires_at, verified_at), phone_verifications (user_id, phone, otp_hash, expires_at, verified_at)

### API Endpoints
- `POST /email/send-verify` (auth) — sends verification email via EmailProvider. Rate limited (5/day).
- `GET /email/verify/:token` — verifies token, sets email_verified_at. Idempotent.
- `POST /phone/send-otp` (auth) — generates 6-digit code, hashes, stores in phone_verifications, sends via SMSProvider. Rate limited (3/h/phone). 5-min expiry.
- `POST /phone/verify-otp` (auth) — finds code, checks expiry, compares hash, sets phone_verified_at. Rate limited (10/15min).
- `GET /phone/status` (auth) — returns phone verification status.

### Files Created
```
backend/src/
├── domain/services/emailVerification.ts    # send(), verify()
├── domain/services/phoneVerification.ts    # sendOtp(), verifyOtp()
├── routes/email.ts                         # Email verification routes
├── routes/phone.ts                         # Phone verification routes
├── middleware/phoneGate.ts                 # Phone gate middleware — checks phone_verified_at
services/sms/providers/console.ts   # Already exists from Phase 0

frontend/
├── src/hooks/usePhoneVerification.ts       # NEW — sendOtp(), verifyOtp(), checkStatus()
├── src/app/(auth)/verify-phone/page.tsx    # NEW — phone + OTP input, redirect-return flow
```

### Files Modified
- `backend/src/services/permission/index.ts` — verify phoneVerified checks (already done in Phase 0, verify integration)
- `backend/src/routes/listings.ts` (future) — apply phoneGate middleware
- `backend/src/routes/conversations.ts` (future) — apply phoneGate middleware
- `backend/src/routes/dealers.ts` (future) — apply phoneGate middleware
- `frontend/src/components/common/AuthGate.tsx` — add requirePhone prop
- `frontend/src/hooks/useListings.ts` — add PHONE_VERIFICATION_REQUIRED redirect in useCreateListing.onError
- `frontend/src/hooks/useChat.ts` — add PHONE_VERIFICATION_REQUIRED redirect in useStartConversation.onError
- `frontend/src/app/(dashboard)/dashboard/page.tsx` — add email verification section + phone verification status

### Acceptance Criteria
- [ ] `POST /email/send-verify` logs verification email to console with token
- [ ] `GET /email/verify/:token` with valid token sets email_verified_at
- [ ] `GET /email/verify/:token` with expired/used token returns INVALID_TOKEN
- [ ] Email verification NEVER blocks login, publishing, messaging, dealer upgrade
- [ ] `POST /phone/send-otp` with valid phone logs OTP code to console
- [ ] `POST /phone/send-otp` rate limited at 4th attempt in 1 hour
- [ ] `POST /phone/verify-otp` with valid code sets phone_verified_at
- [ ] `POST /phone/verify-otp` with wrong code returns OTP_INVALID
- [ ] `POST /phone/verify-otp` with code older than 5 min returns OTP_EXPIRED
- [ ] OTP verify rate limited at 11th attempt in 15 min
- [ ] `GET /phone/status` returns `{ phone, verified: boolean }`
- [ ] Phone gate middleware blocks unverified users on privileged routes with `PHONE_VERIFICATION_REQUIRED`
- [ ] Frontend `/verify-phone` page: phone input → OTP input → verify → redirect to ?redirect= URL (or / if not specified)
- [ ] `useCreateListing.onError` catches PHONE_VERIFICATION_REQUIRED → redirect to /verify-phone
- [ ] `useStartConversation.onError` catches PHONE_VERIFICATION_REQUIRED → redirect to /verify-phone
- [ ] AuthGate with `requirePhone` shows phone verification prompt when authenticated + unverified

### Dependencies: Phase 1 complete

---

## Phase 4: Categories, Attributes & Provinces

**Goal:** Category CRUD, EAV schema for listing attributes, province/city management. All endpoints consumed by existing frontend pages (no frontend changes).

### Database Migrations
- `003_categories.sql` — categories (id, name, name_en, slug unique, icon, parent_id self-ref, sort_order). attributes (id, category_id, name, label, type, options jsonb, unit, is_required, is_filterable, sort_order). provinces (id, name, slug, sort_order). cities (id, province_id FK, name).

### API Endpoints
- `GET /categories` — returns tree with children
- `GET /categories/:slug/attributes` — returns EAV attributes for listing form
- `POST /categories` (admin)
- `PUT /categories/:id` (admin)
- `DELETE /categories/:id` (admin)
- `POST /categories/:id/attributes` (admin)
- `PUT /attributes/:id` (admin)
- `DELETE /attributes/:id` (admin)
- `GET /provinces` — returns provinces with cities
- `POST /provinces` (admin)
- `DELETE /provinces/:id` (admin)
- `POST /provinces/:id/cities` (admin)
- `DELETE /cities/:id` (admin)

### Files Created
```
backend/src/
├── repositories/category.ts        # findAll(), findBySlug(), findChildren(), create(), update(), delete()
├── repositories/attribute.ts       # findByCategory(), create(), update(), delete()
├── repositories/province.ts        # findAll(), findCities()
├── routes/categories.ts            # All category + attribute routes
├── routes/provinces.ts             # All province + city routes
```

### Acceptance Criteria
- [ ] `GET /categories` returns tree with id, name, name_en, slug, icon, children[]
- [ ] `GET /categories/:slug/attributes` returns attributes with id, name, label, type, options, unit, is_required, is_filterable
- [ ] `GET /provinces` returns provinces with cities
- [ ] Non-existent category slug returns NOT_FOUND
- [ ] Admin CRUD for all entities works

### Dependencies: Phase 0 complete. No frontend changes needed.

---

## Phase 5: Listings

**Goal:** Full listing lifecycle — create draft, save, submit, publish/unpublish, edit, delete. Search with pg_trgm. Listing cache active. Phone gate on publish.

### Database Migrations
- `004_listings.sql` — listings (id, user_id FK, category_id FK, province_id FK, city_id, title, slug unique, description, price, price_type, status draft|pending|published|rejected|sold|archived, is_featured, views, primary_image, published_at, expires_at, timestamps). listing_attributes (listing_id, attribute_id, value — EAV storage). listing_images (id, listing_id, url, thumbnail_url, medium_url, is_primary, sort_order).
- `005_search.sql` — pg_trgm extension, GIN indexes on listings.title and listings.description

### API Endpoints
- `GET /listings` — paginated, supports filters: category, province, min/max price, status, sort, scope=me
- `GET /listings/:slug` — full detail with attributes, images, seller info
- `POST /listings` (phone gate) — creates listing with status draft
- `PUT /listings/:id` — updates listing fields (owner only)
- `DELETE /listings/:id` — soft-deletes (owner or admin)
- `PATCH /listings/:id` — action: submit (draft→pending), sold (published→sold), renew (extend published_at), approve (admin, pending→published), reject (admin, pending→rejected)
- `POST /listings/:id/favorite` — toggle favorite
- `POST /listings/:id/report` — create report
- `GET /search` — pg_trgm similarity search with same filters
- `POST /upload/presigned` — presigned URL for Supabase Storage

### Files Created
```
backend/src/
├── domain/services/listing.ts         # create(), update(), submit(), publish(), approve(), reject(), markSold(), renew()
├── repositories/listing.ts            # findAll(), findBySlug(), findMyListings(), search(), create(), update(), delete(), incrementViews()
├── routes/listings.ts                 # All listing + search + favorite + report routes
├── routes/uploads.ts                  # Presigned URL route
├── routes/search.ts                   # Search route
```

### Frontend Changes
- `src/hooks/useListings.ts` — remove mock data fallbacks (use real API errors)
- Connect listing detail page, listing creation form, search page, my-listings dashboard to real API
- Wire listing cache invalidation via Event Bus consumers

### Acceptance Criteria
- [ ] `GET /listings` returns paginated results with meta
- [ ] `GET /listings` supports all filters (category, province, price range, status, sort)
- [ ] `GET /listings?scope=me` returns only authenticated user's listings
- [ ] `GET /listings/:slug` returns full ListingDetail including attributes and images
- [ ] `POST /listings` (verified phone) creates listing with status draft
- [ ] `POST /listings` without verified phone returns PHONE_VERIFICATION_REQUIRED
- [ ] `PUT /listings/:id` updates listing (owner only); non-owner returns FORBIDDEN
- [ ] `PATCH /listings/:id { action: 'submit' }` transitions draft→pending
- [ ] `PATCH /listings/:id { action: 'approve' }` (admin) transitions pending→published, sets published_at
- [ ] `PATCH /listings/:id { action: 'sold' }` transitions published→sold
- [ ] `PATCH /listings/:id { action: 'renew' }` extends published_at by 30 days
- [ ] Listing events published to Event Bus on create, update, delete, status change
- [ ] Listing cache invalidated when corresponding event fires
- [ ] `GET /search?q=` returns matching listings via pg_trgm
- [ ] Search results cached for 30 seconds
- [ ] `POST /upload/presigned` returns usable presigned URL
- [ ] Publish listing rate limited at 11th listing in 24 hours

### Dependencies: Phase 1 (auth), Phase 3 (phone gate), Phase 4 (categories)

---

## Phase 6: Conversations

**Goal:** Users can view conversations, start new conversations from listing pages, send/receive messages, mark as read. Phone gate on first message.

### Database Migrations
- `006_chat.sql` — conversations (id, listing_id FK, buyer_id FK, seller_id FK, last_message_at, created_at). messages (id, conversation_id FK, sender_id FK, body, is_read, read_at, created_at, index on conversation_id+created_at).

### API Endpoints
- `GET /conversations` (auth) — user's conversations with last message preview
- `GET /conversations/:id` (auth) — full conversation with all messages (participant only)
- `POST /conversations` (phone gate) — create with first message. Duplicate listing+buyer returns existing.
- `POST /conversations/:id/messages` (auth) — add message (participant only)
- `PUT /conversations/:id/read` (auth) — mark all as read
- `GET /conversations/unread-count` (auth) — unread count for badge

### Files Created
```
backend/src/
├── domain/services/conversation.ts    # start(), sendMessage(), markRead()
├── repositories/conversation.ts       # findByUser(), findById(), findByListingAndBuyer(), create(), addMessage(), markRead(), getUnreadCount()
├── routes/conversations.ts            # All conversation + message routes
```

### Frontend Changes
- `src/hooks/useChat.ts` — remove mock data fallbacks
- Verify chat pages (`/dashboard/messages`, `/dashboard/messages/[id]`) work with real API

### Acceptance Criteria
- [ ] `GET /conversations` returns user's conversations
- [ ] `GET /conversations/:id` returns full conversation (participant only)
- [ ] Non-participant accessing conversation returns FORBIDDEN
- [ ] `POST /conversations` (verified phone) creates conversation with first message
- [ ] `POST /conversations` without verified phone returns PHONE_VERIFICATION_REQUIRED
- [ ] Duplicate listing+buyer returns existing conversation (no duplicate)
- [ ] `POST /conversations/:id/messages` adds message
- [ ] `PUT /conversations/:id/read` marks all as read
- [ ] `GET /conversations/unread-count` returns `{ count }`
- [ ] Create conversation rate limited at 31st in 1 hour
- [ ] Message rate limited at 61st in 1 minute

### Dependencies: Phase 1 (auth), Phase 3 (phone gate), Phase 5 (listings)

---

## Phase 7: Favorites, Articles, Tenders

**Goal:** Favorites toggle and listing, articles CRUD, tenders CRUD (lower priority).

### Database Migrations
- `007_features.sql` — favorites (user_id, listing_id, unique(user_id, listing_id), created_at). articles (id, title, slug, excerpt, body, cover_image, category, author, tags, is_pinned, views, reading_time, published_at, created_at). tenders + tender_bids (optional, lower priority).

### API Endpoints
- `GET /favorites` (auth) — favorited listings
- `POST /listings/:id/favorite` — toggle
- `GET /articles` — published articles
- `GET /articles/:slug` — full article
- (Tenders: CRUD)

### Files Created
```
backend/src/
├── repositories/favorite.ts       # findByUser(), toggle()
├── repositories/article.ts        # findAll(), findBySlug()
├── routes/favorites.ts            # Favorite routes
├── routes/articles.ts             # Article routes
├── routes/tenders.ts              # Tender routes (lower priority)
```

### Frontend Changes
- Remove mock data from `useFavorites`, `useArticles`, `tenderStore`

### Dependencies: Phase 1 (auth), Phase 5 (listings)

---

## Phase 8: Payments & Wallet

**Goal:** Featured listing purchase, dealer subscription, wallet transactions. PaymentInterface with NoopPaymentProvider.

### Database Migrations
- `008_payments.sql` — payments (id, user_id, amount, currency, status, provider, provider_id, metadata, timestamps). wallet_transactions (id, user_id, type, amount, balance_before, balance_after, reference_type, reference_id, description, created_at).

### API Endpoints
- `POST /payments/featured` (auth) — creates featured listing purchase
- `POST /payments/dealer-subscription` (auth) — creates subscription purchase
- `GET /wallet/transactions` (auth) — transaction history

### Files Created
```
backend/src/
├── services/payment/provider.ts          # PaymentInterface: createPayment(), verifyPayment(), refund()
├── services/payment/providers/noop.ts    # NoopPaymentProvider — auto-completes (dev)
├── domain/services/payment.ts            # createFeaturedPayment(), createSubscriptionPayment()
├── repositories/payment.ts               # CRUD for payments + wallet
├── routes/payments.ts                    # Payment routes
├── routes/wallet.ts                      # Wallet routes
```

### Acceptance Criteria
- [ ] `POST /payments/featured` creates payment record (status pending)
- [ ] NoopPaymentProvider marks all payments as completed
- [ ] `GET /wallet/transactions` returns user's transaction history
- [ ] PaymentInterface is swap-ready: new provider needs only to implement the interface

### Dependencies: Phase 1 (auth), Phase 5 (listings)

---

## Phase 9: Dealer & Agency Upgrade

**Goal:** Users with verified phone can upgrade to Dealer or Agency from dashboard. Dealer dashboard works with real data.

### Database Migrations
- `009_dealers.sql` — dealer_profiles (user_id PK FK, business_name, logo, address, description, dealer_code, subscription_plan, subscription_expires_at, listings_limit, is_verified, timestamps).

### API Endpoints
- `POST /account/upgrade { role: dealer|agency }` (phone gate) — creates dealer_profile, sets role
- `GET /dealers/:id/profile` — public dealer profile with listing stats
- `POST /dealers/:id/reviews` (auth) — create review
- `GET /dealer/stats` (auth, dealer) — dashboard statistics
- `GET /dealer/subscription` (auth, dealer) — subscription info

### Files Created
```
backend/src/
├── domain/services/dealer.ts        # upgrade(), downgrade()
├── repositories/dealer.ts           # findByUserId(), create(), update()
├── routes/dealers.ts                # Upgrade + dealer dashboard + reviews
├── routes/users.ts                  # User profile endpoint
```

### Frontend Changes
- Verify dealer dashboard pages work with real API data

### Acceptance Criteria
- [ ] `POST /account/upgrade` (verified phone) creates dealer_profile, sets role
- [ ] Upgrade without verified phone returns PHONE_VERIFICATION_REQUIRED
- [ ] Upgrade when already dealer returns RESOURCE_CONFLICT
- [ ] `GET /dealers/:id/profile` returns public dealer info
- [ ] `GET /dealer/stats` returns dashboard statistics
- [ ] Dealer dashboard shows real listings, stats, subscription

### Dependencies: Phase 1 (auth), Phase 3 (phone gate), Phase 5 (listings)

---

## Phase 10: Admin Panel

**Goal:** Admin can manage users, listings, categories, attributes, provinces, reports. All existing admin pages functional.

### API Endpoints
- `GET /admin/users` — all users with search/pagination (admin)
- `POST /admin/users` — create user
- `PUT /admin/users/:id/role` — change role
- `PUT /admin/users/:id/status` — activate/deactivate
- `DELETE /admin/users/:id` — soft-delete
- `GET /admin/settings` — app settings
- `PUT /admin/settings` — update settings
- `GET /admin/reports` — reported listings
- `PUT /admin/reports/:id` — update report status

### Files Created
```
backend/src/
├── middleware/adminAuth.ts     # Extends auth middleware with role===admin check
├── routes/admin.ts             # All admin routes (user management, settings, reports)
```

### Note
- Listing approve/reject uses existing `PATCH /listings/:id` with admin auth
- Category/attribute CRUD uses existing category routes with admin auth
- These don't need separate admin routes

### Dependencies: All previous phases complete

---

## Definition of Done

No task is complete unless ALL of the following are true:

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | TypeScript builds with zero errors | `npx tsc --noEmit` exits 0 |
| 2 | ESLint passes with zero warnings | `npx eslint src/` exits 0 |
| 3 | All tests for the feature pass | `npx vitest run` exits 0 |
| 4 | Tests cover: happy path, validation errors, auth errors, edge cases | Reviewed in PR |
| 5 | No Architecture Principle is violated | PR reviewer checks against 10 principles |
| 6 | No secrets committed | `git diff` reviewed — no .env, no API keys |
| 7 | Documentation updated for changed feature | README, API docs, or ADR updated |
| 8 | Database migration tested (apply + rollback) | `supabase db reset` succeeds |
| 9 | No TODO/FIXME/HACK/console.log in production code | Code search in PR |
| 10 | API response follows `{ success, data \| error }` contract | Integration test verified |
| 11 | API error responses use correct error code from taxonomy | Integration test verified |
| 12 | PR approved by at least 1 other team member | GitHub PR status |
| 13 | PR merges into `develop`, not directly to `main` | Branch policy enforced |

---

## Branch Strategy

```
main
  └── develop
        ├── phase/0-foundation
        ├── phase/1-auth-backend
        ├── phase/2-auth-frontend
        ├── phase/3-verification
        ├── phase/4-categories
        ├── phase/5-listings
        ├── phase/6-chat
        ├── phase/7-features
        ├── phase/8-payments
        ├── phase/9-dealers
        ├── phase/10-admin
        ├── feature/*              (within a phase for individual tasks)
        └── fix/*                  (from develop for bugs)
```

## PR Strategy

- **Max size:** 300 lines changed
- **Scope:** One logical change (one endpoint, one service, one component)
- **Title format:** `[Phase N] Description` (e.g., `[Phase 1] Add POST /auth/register endpoint`)
- **Required reviewers:** 1 (team of 2-3)
- **Required CI:** Lint + typecheck + tests pass

## Commit Strategy

```
type(scope): description

Types: feat | fix | refactor | test | docs | chore | ci | style | perf
Scope: phase-0 | auth | listings | chat | shared | backend | frontend | config | docs
```

Examples:
- `feat(auth): add register endpoint with email uniqueness check`
- `refactor(store): move token from persist to memory`
- `fix(phone-gate): check phone_verified_at not phone_verified`
- `test(listings): add integration test for creating listing with attributes`

Commit frequency: After each passing test or logical change. Max 5 commits per PR.

## Risk Analysis

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | JWT secret leaked | Low | Critical | Strong random secret (64+ chars). Vercel env vars, not in repo. Monitor for unusual patterns. Rotate immediately if compromised. |
| R2 | Refresh token replay attack | Medium | High | Rotate on every use (issue new, revoke old). Short TTL (7 days). Revoke all on password change. |
| R3 | SMS provider downtime | Medium | High | ConsoleSMSProvider always works in dev. Failover provider in interface. Clear 503 with Retry-After. |
| R4 | Email deliverability to Iranian users | High | Medium | ConsoleEmailProvider works in dev. Production: choose provider with proven Iran deliverability (Chapar, Faras). Don't assume Gmail works. |
| R5 | pg_trgm search degradation | Medium (5k+ listings) | Medium | Monitor p95 latency. Migrate to Meilisearch when latency >50ms for 7 consecutive days. GIN indexes are temporary. |
| R6 | Rate limits block legitimate users | Medium | Medium | Conservative start. Monitor logs. Adjust based on usage. Support can manually reset limits. |
| R7 | Event bus loses events on deploy | High (every deploy) | Low | Non-critical events only. Documened in ADR-006. Critical ops bypass event bus. |
| R8 | Supabase free tier row limits | Medium (500k rows) | Medium | Upgrade to Pro ($25/mo) at 80% limit. This is expected scaling cost. |
| R9 | Auth rewrite breaks existing features | Medium | Critical | Feature-flag behind `NEXT_PUBLIC_DEMO_MODE` during transition. Test migration with canary group. Deploy auth as single, tested release. |

## Time Estimates

| Milestone | Frontend | Backend | Total (person-weeks) |
|-----------|----------|---------|---------------------|
| M0: Foundation | — | 2 | 2 |
| M1: Auth Backend | — | 1.5 | 1.5 |
| M2: Frontend Auth | 2 | — | 2 |
| M3: Verification | 1 | 1 | 2 |
| M4: Categories | — | 1 | 1 |
| M5: Listings | 1 | 2.5 | 3.5 |
| M6: Conversations | 0.5 | 1.5 | 2 |
| M7: Favorites/Articles | 0.5 | 1 | 1.5 |
| M8: Payments | 0.5 | 1 | 1.5 |
| M9: Dealers | 0.5 | 1 | 1.5 |
| M10: Admin | 0.5 | 1.5 | 2 |
| Integration/QA | — | — | 3 |

**Total:** ~24.5 person-weeks | **Critical path (2-person team):** 10-14 weeks | **Full delivery:** 14-20 weeks

## ADR Index (8 records)

| ADR | Subject | Status |
|-----|---------|--------|
| 001 | Domain Layer — business logic lives only in Domain Services | Accepted |
| 002 | Progressive Authentication — three independent systems (auth, email, phone) | Accepted |
| 003 | Search Strategy — PostgreSQL pg_trgm for MVP, Meilisearch when triggered | Accepted |
| 004 | Database Schema (EAV) — entity-attribute-value for diverse listing categories | Accepted |
| 005 | Permission Service — centralized can()/requireCapability() service | Accepted |
| 006 | Event Bus — in-process, typed, fire-and-forget. Not for critical operations. | Accepted |
| 007 | Infrastructure Scaling — start on free tiers, add paid services at trigger points | Accepted |
| 008 | Cost Strategy — $0/mo Phase 0, SMS only unavoidable cost, paid services only at trigger points | Accepted |

Each ADR contains: Context, Decision, Alternatives Considered, Consequences, Status.
Location: `docs/adr/ADR-NNN-title.md`

## Quality Gates (Project-Wide)

Before any milestone is declared complete, verify:

1. TypeScript builds (backend + frontend)
2. ESLint passes (backend + frontend)
3. All tests pass for the milestone's scope
4. Prettier formatting consistent
5. New API endpoints return correct `{ success, data/error }` format
6. New API endpoints use correct error codes from taxonomy
7. Database migrations apply and rollback cleanly
8. Git hooks enforce commit convention
9. CI passes on PR branch
10. No Architecture Principles violated
11. No TODO/FIXME/HACK in production code
12. Documentation updated (API docs, ADRs if applicable)
13. PR approved and merged to develop
