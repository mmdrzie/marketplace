# ADR-012: Provider-based Authentication Architecture

**Status:** Accepted
**Date:** 2026-08-01
**Supersedes:** —
**Author(s):** Architecture Team

## Context

The marketplace previously had a single authentication model: email/phone OTP registration + email+password login, with custom JWTs (`jose`), hashed refresh tokens in `refresh_tokens`, and an email-verification **link** flow (`email_verifications`) that was partially broken. Requirements changed:

- Email registration must be **real**: emails delivered via SMTP, ownership verified with a code, and login gated until the email is verified.
- A **Sign in with Google** button is required — one smart button that either logs in an existing account (Google's verification is sufficient) or creates a new account. A verification-code fallback is needed for the rare case where Google does not assert the email as verified.
- Future providers (Apple, GitHub, Microsoft) must be addable **without** restructuring the auth core.

Constraints: the existing `users.password_hash` is `NOT NULL` and must stay so; the codebase uses custom JWT auth (no Supabase Auth, no third-party auth SDK); Supabase (Postgres) is currently unreachable, so new migrations are written but cannot be applied yet.

## Decision

### 1. Provider-based authentication architecture

```
AuthService  (core — depends only on AuthIdentity, never on a specific provider)
├── providers/AuthProvider.ts   ← interface
├── providers/password.ts       ← PasswordAuthProvider
└── providers/google.ts         ← GoogleAuthProvider
```

- `AuthService` owns the shared, provider-agnostic concerns: user creation, account linking rules, session issuance, email-verification gates, one-time-token management, OAuth audit logging.
- Each `AuthProvider` is responsible only for authenticating the user and producing a **normalized `AuthIdentity`**:

```ts
interface AuthIdentity {
  provider: string;              // 'password' | 'google' | 'apple' | ...
  providerAccountId: string;     // e.g. Google `sub`
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
}
```

- The provider interface includes `authorize()`, `authenticate()`, `link()`, `unlink()`, `refreshIdentity()` so future account-management features (unlink, avatar refresh) do not require an architectural change.

### 2. PKCE for every OAuth flow (including confidential clients)

- Per OAuth 2.1 guidance, PKCE (`S256` code challenge) is used even though Google is a confidential client with a secret. Cost is minimal; it protects against code interception.
- `code_verifier` + `nonce` + sanitized `redirect` are carried server-side, never in a bare cookie.

### 3. One-time tokens instead of temporary JWTs

- Temporary OAuth artifacts (state, result, verify, link) are **not** self-contained JWTs in the browser. They are opaque UUIDs (`jti`) stored in a single table:

```sql
CREATE TABLE one_time_tokens (
  jti UUID PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  subject UUID,
  metadata JSONB NOT NULL DEFAULT '{}',   -- redirect, provider, nonce, code_verifier
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- Consumption is **atomic and single-use** (`UPDATE … SET used_at = now() WHERE jti = … AND used_at IS NULL`) — replay attacks fail. The cookie carries only the opaque `jti`.

### 4. `email_verified` is the single source of truth

- `users.email_verified_at` (mapped to `emailVerified` on the entity) alone decides whether an account is email-verified — for password **and** provider accounts.
- **Trust condition** for activating a new provider account without a code: `provider == 'google'` **and** `email_verified == true` **and** non-empty `email`. If any part fails → the user is created in a pending state and a 6-digit OTP is emailed (fallback, expected to be rare for Google).
- Password login requires `email_verified == true` (403 `emailNotVerified` otherwise, with a code-resend flow).
- Changing email in the profile resets `emailVerified = false` and automatically sends a verification code to the new address.

### 5. Secure account linking

- If a provider email matches an existing user **with a password** (`has_password = true`):
  - **Google with `email_verified === true`** (and matching `email`): linked **directly, no password step** — a Google-verified mailbox is equivalent proof of email ownership to an OTP. This also unlocks accounts that were registered with a password but never email-verified (login was locked). *(Revised 2026-08-01 per product decision; previously always required password re-auth.)*
  - **Otherwise** (provider did not verify the mailbox): the account is **not** linked silently; the user must re-authenticate with their password first (`POST /auth/google/link`), then the `oauth_accounts` row is created. In this flow `EMAIL_NOT_VERIFIED` is treated as "password correct" (the bcrypt check runs first), so the email is marked verified and the link completes.
- `oauth_accounts.email` is a **snapshot/cache only** — it is never used for identity or uniqueness; `users.email` is always the source of truth.
- `last_login_at` is updated only on successful login, not on link (link is an administrative operation).
- Disconnect uses **soft delete** (`deleted_at`); re-linking restores the previous row instead of hitting the unique constraint.

### 6. No Google refresh token storage

- The Google refresh token is **never** stored. Login/registration needs only the `id_token` claims (`sub`, `email`, `name`, `picture`, `email_verified`).
- If Google APIs are needed later, a deliberate extension (with its own consent scope) will be added then.

### 7. Password model

- `users.has_password BOOLEAN NOT NULL` (default `true`, backfilled, then default dropped) distinguishes password-capable accounts.
- `password_hash` stays `NOT NULL`; provider-only accounts get a bcrypt hash of a random value as a placeholder, making password login impossible.
- Provider-only users can **set their first password** through the existing forgot/reset flow (`POST /auth/forgot` + `POST /auth/reset`), which flips `has_password = true` — they are never permanently dependent on OAuth.

### 8. Session model

- `issueSession(user, { singleSession? })` issues access + refresh tokens and sets the HttpOnly refresh cookie. Default is **multi-device** (`AUTH_SINGLE_SESSION=false`): previous sessions are kept; only logout revokes.
- All terminal auth endpoints (login, register, google finalize/verify/link, verify-code) return the access token + user **directly in the response** — no client-side refresh dance.

### 9. OAuth details

- `oauth_accounts` is constrained by `UNIQUE (provider, provider_account_id)` and `UNIQUE (user_id, provider)`, plus a `CHECK (provider IN ('google','apple','github','microsoft'))` enum.
- Google avatar is stored **by URL only** (never downloaded/copied into storage) and rendered from the URL with fallback.
- Every OAuth attempt writes to `oauth_login_logs` (provider, user_id, email, ip, user_agent, success, failure_reason) for security and debugging.
- Separate rate limits: `google:verify`, `google:resend`, `google:link` — independent of the generic `otp:*` limits.
- OAuth registration always creates `role = 'user'`; role selection happens later from the profile (avoids half-finished registrations).

### 10. Migration hygiene

- New columns are added with `NOT NULL DEFAULT`, backfilled, then the default is dropped — the standard pattern that prevents unintended rewrites. (`052_auth_providers.sql`)

## Consequences

**Positive**

- Google is the first of many providers; Apple/GitHub/Microsoft add with one provider file each, no core changes.
- PKCE + one-time tokens + single-use consumption + secure linking give production-grade OAuth security.
- Email verification is consistent across all signup paths (password OTP, provider trust, fallback OTP).
- Multi-device sessions match real usage; configurable single-session mode when needed.
- Audit trail supports incident investigation without app changes.

**Negative / trade-offs**

- A refactor of the existing `AuthService` (~470 lines) is required; mitigated by keeping the public method surface unchanged and verifying with `tsc` + builds before adding Google.
- `oauth_login_logs` grows over time (acceptable; can be pruned by retention policy later).
- New tables (`oauth_accounts`, `one_time_tokens`, `oauth_login_logs`) and the `has_password` column are pending the Supabase connection being restored.

**Rejected alternatives**

- Dropping `NOT NULL` on `users.password_hash` — breaks invariants and muddies the password model.
- Storing the Google refresh token — unnecessary for login; raises consent and storage scope.
- Mandatory email OTP after every Google signup — poor UX; Google's `email_verified` claim is trustworthy enough (with the explicit trust condition).
- Silent auto-linking of accounts that already have a password — account-takeover risk. *(Partially revised 2026-08-01: accepted for Google when `email_verified === true`, because mailbox ownership is proven — equivalent to the OTP trust we already rely on; the password step remains for unverified provider emails.)*
- `auth_method` enum (`password|google|both`) instead of `has_password` boolean — the boolean covers all logic needed today (login, linking, set-password); an enum can be introduced later without schema churn if a real third state appears.
