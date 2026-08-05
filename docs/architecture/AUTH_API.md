# AUTH_API.md — Auth & Stats API Contracts

Base URL: `http://localhost:4000/api/v1` (prod: configured `API_URL`).
Auth: HttpOnly refresh cookie (`refresh-token`) + Bearer access token for authed calls.

## 1. Versioning Policy

- **v1 stays** for additive, backward-compatible changes (new optional fields/params, new endpoints, new enum values that don't change existing semantics).
- A **new version** is required only for breaking changes (field removal or semantic change).
- All changes introduced by ADR-013 are additive → **no version bump**.

| Endpoint | Change in this work | Backward compatible? |
|---|---|---|
| `GET /stats/public` | +`generatedAt`, +`cacheFor`, +`counters.activeUsers`; fix query bug (`dealers`→`dealer_profiles`) | ✅ yes (additive) |
| `POST /auth/register-with-otp` | +optional business fields (`business_name`, `business_address`, `city`, `dealer_code`, `documents`, `workshop_name`, `workshop_type`, `specialty`, `hours`, `services`, `description`, `phone`) | ✅ yes (optional) |
| `POST /auth/send-register-otp` | unchanged | ✅ |
| `GET /auth/google/authorize` | +optional `role` query param | ✅ yes (optional) |
| `POST /auth/business-profile` | **new** endpoint | ✅ new |
| `POST /auth/google/link` | unchanged (frontend moved to `/link-account` page) | ✅ |
| `refresh` rotation | now updates `last_used_at/last_ip/last_user_agent` | ✅ internal |

## 2. Enums

```ts
// shared between backend & frontend
type AuthRole = 'user' | 'dealer' | 'agency' | 'store' | 'workshop';

enum ProfileStatus {
  Complete   = 'complete',    // profile row exists & approved
  Incomplete = 'incomplete',  // user exists, profile not yet created
  Pending    = 'pending',     // profile waiting admin approval
  Approved   = 'approved',
  Rejected   = 'rejected',
}
```

## 3. GET /stats/public

**Request:** none (public).

**Response 200:**

```json
{
  "success": true,
  "data": {
    "generatedAt": "2026-08-02T10:00:00Z",
    "cacheFor": 60,
    "counters": {
      "activeListings": 12480,
      "totalUsers": 9341,
      "totalProvinces": 31,
      "approvedDealers": 856,
      "activeUsers": 42
    },
    "latest": {}
  }
}
```

| Field | Meaning |
|---|---|
| `generatedAt` | server time of computation (ISO 8601) |
| `cacheFor` | suggested client/edge cache TTL in seconds |
| `counters.activeUsers` | users with `refresh_tokens.last_used_at > now() - 10 minutes` (recent activity proxy — UI label: «کاربران آنلاین») |

Failure → `200` with zeroed counters (existing behavior; never 500s the panel).

## 4. POST /auth/register-with-otp

**Body:**

```jsonc
{
  "name": "علی رضایی",
  "password": "secret123",
  "type": "email",                        // 'email' | 'phone'
  "identifier": "ali@example.com",
  "code": "123456",
  "role": "dealer",                       // default 'user'
  // business fields (optional, validated conditionally per role):
  "business_name": "نمایندگی رضایی",
  "dealer_code": "DR-1209",
  "business_address": "تهران، خیابان آزادی",
  "city": "تهران",
  "phone": "09121234567",
  "documents": ["https://cdn/.../license.jpg"],
  "workshop_name": "تعمیرگاه مرکزی",
  "workshop_type": "mechanic",            // 'mechanic' | 'tuner' | 'both'
  "specialty": "موتور خودروهای سنگین",
  "hours": "۹-۱۸",
  "services": ["تعویض روغن", "توربو"],
  "description": "توضیحات"
}
```

**Conditional validation (zod `superRefine`):**

| role | required |
|---|---|
| `dealer` | `business_name`, `dealer_code`, `business_address` |
| `agency` | `business_name`, `business_address`, `documents[0]` |
| `store` | `business_name`, `business_address`, `documents[0]` |
| `workshop` | `workshop_name`, `workshop_type`, `business_address`(=address), `phone`, `documents[0]` |

**Response 201:**

```jsonc
{
  "success": true,
  "data": {
    "token": "<access>",
    "user": { "id": "...", "email": "...", "name": "...", "role": "dealer", "emailVerified": true },
    "profileStatus": "pending"        // or 'incomplete' when profile creation failed — session is still valid
  }
}
```

**Errors:** `OTP_INVALID` (422), `OTP_EXPIRED` (422), `EMAIL_ALREADY_EXISTS` / `PHONE_ALREADY_EXISTS` (409), rate-limited `429`.

## 5. POST /auth/business-profile (NEW — auth required)

Completes/creates the business profile for the authenticated user (Google signups, retry after `incomplete`).

**Body:** same optional business fields as §4, validated per `user.role` with `superRefine`.

**Response 200:**

```jsonc
{
  "success": true,
  "data": { "profileStatus": "pending", "profile": { "role": "dealer", "businessName": "...", "status": "pending" } }
}
```

**Errors:** `401` (unauthenticated), `403` (role is `user`), `409` (slug conflict), `422` (validation).

## 6. GET /auth/google/authorize

**Query params (all optional):** `redirect` (sanitized), `role` (`AuthRole`; stored in oauth_state metadata; applied only to **new** account creation).

**Behavior:** 302 → Google consent. `stateJti` set as HttpOnly cookie; payload in `one_time_tokens.metadata`.

## 7. Google callback → modes

| Mode | Frontend page | Params |
|---|---|---|
| `session` | `/google-complete?mode=session&t=…&redirect=…` | POST `/auth/google/finalize` |
| `verify` | `/google-complete?mode=verify&t=…&email=…` | POST `/auth/google/verify` / `/resend` |
| `link_required` | `/link-account?t=…&email=…` (NEW page; ADR-013 §8) | POST `/auth/google/link` |
| `error` | `/google-complete?mode=error&reason=…` | — |

Reasons: `invalid_state | access_denied | missing_code | token_exchange_failed | id_token_missing | invalid_id_token | nonce_mismatch | missing_subject | inactive_account | email_missing`.

## 8. Error code → UI map

| Code | Status | UI action |
|---|---|---|
| `EMAIL_NOT_VERIFIED` | 403 | show OTP step (auto sendVerifyCode) |
| `INVALID_CREDENTIALS` | 401 | «ایمیل یا رمز عبور اشتباه است» |
| `OTP_INVALID` / `OTP_EXPIRED` | 422 | clear input, «کد اشتباه/منقضی است» + resend |
| `EMAIL_ALREADY_EXISTS` / `PHONE_ALREADY_EXISTS` | 409 | link to login |
| `RATE_LIMITED` | 429 | «تعداد درخواست زیاد شد؛ بعداً امتحان کنید» |
| `GOOGLE_NOT_CONFIGURED` | 400 | disable GoogleButton |
| validation | 422 | field-level messages |

## 9. Frontend hooks

| Hook | Endpoint | Cache |
|---|---|---|
| `useBrandStats` | GET `/stats/public` | staleTime 60s |
| `useLatestListings` | GET `/listings?sort=latest&limit=5` | 30s |
| `useLatestPrices` | GET `/listings?sort=latest&has_price=1&limit=5` | 60s |
| `useLatestNews` | GET news list (existing content endpoint) | 5min |
| `useBusinessProfile` | POST `/auth/business-profile` | — |
