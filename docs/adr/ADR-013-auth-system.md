# ADR-013: Auth System Redesign (UI + Role-Based Registration)

**Status:** Accepted
**Date:** 2026-08-02
**Supersedes:** —
**Author(s):** Architecture Team
**Related:** ADR-012 (Provider-based Authentication), `docs/auth-redesign-plan.md` (v7 LOCKED)

## Context

The login/register pages were hand-rolled (manual validation, duplicated input CSS, cosmetic role tabs) and the registration API accepted `role` values without creating the corresponding business profiles (`dealer_profiles` / `store_profiles` / `workshop_profiles`), producing inconsistent account states. Additionally:

- The business-license uploader (`DocumentUploader`) posts to a non-existent `/api/upload` route (broken).
- `POST /account/upgrade` accepts `dealer_code` but never writes it.
- Google sign-in cannot preserve a user-selected role (no `role` param in authorize).
- No shared auth layout/components; every page duplicates styling.

Requirements (product decisions, 2026-08-02):

- **Regular users:** 2-step registration (choose role → registration form; OTP is an internal state of that step).
- **Business roles (dealer/agency/store/workshop):** 3-step registration — role → **method first** (email+password+OTP **or** Google) → role-specific form. When Google is chosen, Google already supplies name/email/avatar, so the form contains **only business-specific fields** and is filled **after** the Google callback (no `sessionStorage` needed).
- Business profiles are created with `status = 'pending'` (admin approval), matching the existing workshop model.
- User creation and business-profile creation are **decoupled**: a business-form failure must never lose the authenticated user (session is issued first).
- A live brand panel on the auth layout (stats, latest listings, prices, news, active users), isolated widgets, tiered caching.
- All auth pages (login, register, forgot, reset, verify-email/phone, google-complete, link-account, otp) share one `AuthLayout`.

## Scope

**In scope:** redesign of the auth UI system (tokens → shared components → layout → pages), role-based registration, Google role propagation, business profiles at registration, `POST /auth/business-profile`, OTP component, document uploader, live brand panel, stats API.

**Out of scope (deliberately not covered by this ADR; future ADR/plan each):** MFA / TOTP / 2FA, Passkeys, WebAuthn, additional OAuth providers (Apple/GitHub/Microsoft), CAPTCHA, SMS provider integration, dashboard widgets, notifications, chat, search.

## Decision

### 1. Layered UI architecture (tokens → shared → layout → pages)

```
Design Tokens (globals.css @theme)
   ↓
Shared Components (components/auth, components/form)
   ↓
AuthLayout ((auth)/layout.tsx — providers + brand panel + AuthCard)
   ↓
Pages (one file per route, compose shared components only)
```

Rules:
- No form outside RHF + Zod. No duplicated input CSS (single token/component source).
- Layout is built **after** tokens and shared components to avoid rework when tokens change.

### 2. Form & validation stack

- `react-hook-form` + `zod` + `@hookform/resolvers`; shadcn/ui primitives (`button input card form label select badge alert`) mapped to existing theme tokens (cream/brown, Vazirmatn).
- Errors render **below the field** with `aria-live`; labels use `for`; correct `autocomplete` values; `input type="tel"` for phone.

### 3. Shared AuthLayout with providers

```
<AuthLayout>
  <ThemeProvider> <ToastProvider> <MotionConfig reducedMotion="user">
    <BrandPanel />            (desktop only, live widgets)
    <AuthCard />              (AuthHeader + FormCard + AuthFooter)
  </...>
</AuthLayout>
```

### 4. Live brand panel with isolated widgets

- Four independent widgets, each with its own react-query query, skeleton, error state ("در حال حاضر در دسترس نیست" + retry button). A failure in one never blanks the panel.
- Caching tiers (`staleTime`): Stats 60s, Listings 30s, Prices 60s, News 5min.
- Sources: `GET /stats/public`, `GET /listings?sort=latest`, `GET /listings?has_price=1&sort=latest`, news endpoint.

### 5. Regular-user registration is 2 steps

Role selection → registration form (Google button + email/phone chips + name/identifier/password) → OTP as an internal state of the form step. No extra method-selection step.

### 6. Business registration: method before form (3 steps)

1. Role (OptionCard ×5).
2. Method: email+password **or** Google.
3. Form:
   - **Email:** full form (role-specific fields + name/email/password) → OTP → one-shot registration.
   - **Google:** authorize with `role` → callback creates the user with that role → session issued → **post-finalize business form** (only role-specific fields) → `POST /auth/business-profile`.

`sessionStorage` is **not** used: the business form comes after the Google callback, so no pre-Google data exists to preserve.

### 7. User ↔ Business Profile decoupling

- `register-with-otp`: user is created and **session is issued first**; profile creation is best-effort in a try/catch. On profile failure the response still returns the session with `profileStatus: 'incomplete'` (user completes the profile later from the dashboard).
- Google flow: user is created at callback/finalize; the profile is only created via `POST /auth/business-profile` (separate call).
- `profileStatus` is a shared **enum** (never a free string):

```ts
enum ProfileStatus { Complete = 'complete', Incomplete = 'incomplete', Pending = 'pending', Approved = 'approved', Rejected = 'rejected' }
```

### 8. Google role propagation

- `GET /auth/google/authorize?role=<enum>` → stored in `one_time_tokens.metadata` of the oauth_state → on new-account creation, `createUserFromIdentity(identity, role)`.
- `link_required` mode redirects to `/link-account` instead of `/google-complete` (one-line change in `flowRedirect`).
- Role values restricted to the existing union (`user|dealer|agency|store|workshop`); `user` is the default and is what existing links get.

### 9. Generic OTP component

`OtpField` is a standalone, dependency-free component (length, onComplete, resend timer, error, disabled). Used by register, login (EMAIL_NOT_VERIFIED), Google verify, verify-phone/email; future 2FA uses the same component — no auth-flow coupling.

### 10. GoogleButton state machine

`Idle → Hover → Loading (status check) → Redirecting (clicked, navigating to Google) → Success/Error`, plus `Disabled` (Google not configured). The `Redirecting` state covers the browser hand-off.

### 11. Session audit fields (refresh_tokens)

Add `last_used_at`, `last_ip`, `last_user_agent` to `refresh_tokens`, updated on every refresh. Rationale: online-activity proxy, session management, active-device display, suspicious-login detection — nearly zero cost now, expensive later.

### 12. Future-proof stats API

`GET /stats/public` response:

```json
{
  "generatedAt": "2026-08-02T10:00:00Z",
  "cacheFor": 60,
  "counters": { "activeListings": 0, "totalUsers": 0, "totalProvinces": 0, "approvedDealers": 0, "activeUsers": 0 },
  "latest": {}
}
```

- `activeUsers` is the API name (active within the last 10 minutes); the UI label is «کاربران آنلاین».
- `generatedAt`/`cacheFor` let clients know freshness and prepare for CDN/edge caching without an API change.
- Fix the existing query bug (`dealers` → `dealer_profiles`), which currently always falls into the catch and returns zeros.

### 13. Generic DocumentUploader

Reusable component (also for listings later): drag & drop, preview, optional crop (off by default), upload progress, retry, delete, size (5MB) and format (image only) limits. Uses the existing presigned flow (`POST /upload/presigned` → PUT). Output: `documents: string[]` of public URLs.

### 14. API versioning rule

Additive, backward-compatible changes (new optional fields/params, new endpoints) keep API v1. A breaking change (removal or semantic change) introduces a new version. All changes in this ADR are additive.

## Consequences

**Positive**

- One design system for the whole auth area; new auth pages are thin compositions of shared components.
- Role-based registration produces consistent state (user + profile row + `status='pending'`).
- A business-form failure never logs the user out; recovery path exists from the dashboard.
- Session audit fields unlock security/UX features without later schema churn.
- Isolated widgets and tiered caching keep the login page fast and resilient.
- Docs (state machine, API contracts, ADRs) make the system maintainable by any developer.

**Negative / trade-offs**

- Migration 053 adds columns to `refresh_tokens` and `dealer_profiles` (applied once; additive).
- Google business signup now has two post-callback calls (finalize + business-profile); acceptable because the form failure path keeps the user logged in.
- `activeUsers` is a proxy for online users (refresh-activity based), not realtime presence; documented as such.

**Rejected alternatives**

- 3-step registration for regular users — needless friction; OTP as internal state keeps the stepper at 2 steps.
- Pre-Google business form with `sessionStorage` — data could go stale; Google already supplies identity; post-finalize form is simpler and honest.
- Free-string `profileStatus` — enum prevents typos and documents the state space.
- `onlineUsers` API name — misleading semantics (it measures recent activity, not presence).
- A single monolithic widget fetching all panel data — one slow/failing API would block the whole panel.
- Registering business roles directly to `users.role` without profile rows (status quo) — creates ghost dealer/workshop accounts with no profile.
