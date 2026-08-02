# Session Summary

## Objective
- **Active task (current session):** Real email registration (SMTP + verification code + login lock) AND Google sign-in (OAuth 2.1 Authorization Code + PKCE), per locked plan v4 (`docs/auth-providers-plan.md`) + `docs/adr/ADR-012-auth-providers.md`. Backend done, frontend done, **DB applied + tests green + E2E verified**; remaining: Google/SMTP credentials (user).
- Maintained context: catalog domain (catalog_types + categories + parts + compatibility), workshops section (تعمیرکاران و تیونرها), all complete.

## Important Details
- پروژه: Next.js 16 (App Router) + Hono backend + PostgreSQL (Supabase); Farsi RTL; کاربر فارسیزبان — پاسخها و UI فارسی، کد/کامنت انگلیسی.
- **Auth architecture**: `AuthService` (core) + `PasswordAuthProvider` + `GoogleAuthProvider` — shared interfaces `AuthProvider`/`AuthIdentity`/`AuthCore`/`SessionIssuer` in `backend/src/domain/providers/AuthProvider.ts`.
- **Key decisions (ADR-012)**: PKCE even for confidential client; `state`/`nonce`/`code_verifier`/`redirect` stored in `one_time_tokens` (metadata JSONB) with only `jti` in httpOnly cookie; single-use tokens (atomic consume); trust Google email only if `provider==google && email_verified==true && email` else OTP fallback; secure account linking only after password re-auth (`has_password=true`); `role='user'` default; direct session issuance (no refresh dance); multi-device (`AUTH_SINGLE_SESSION=false`); never store Google refresh token; soft-delete `oauth_accounts`; audit log.
- Login lock: 403 `EMAIL_NOT_VERIFIED` only for real emails (not `@bazaar.local` synthetic).
- **Supabase reachable** (`aws-0-ap-southeast-1.pooler.supabase.com:6543`); `npm run migrate` applied 050/051/052; schema verified (`oauth_accounts`, `oauth_login_logs`, `one_time_tokens`, `users.has_password` EXISTS). Checksum-mismatch warnings for old migrations (022–031) are benign.
- **FOUND & FIXED (this session): error handling was broken** — Hono's built-in default `errorHandler` swallows thrown errors inside compose (`next()` never rejects), so the old `errorWrapper` try/catch middleware NEVER ran: every AppError (401/403/422/429…) returned 500 text. Fix: `backend/src/middleware/errorWrapper.ts` → renamed `errorHandler.ts` exporting Hono `ErrorHandler`; registered via `app.onError(errorHandler)` on root + `docsRouter` + `apiRouter` (sub-apps need it too — their own compose catches first) in `backend/src/app.ts` AND `backend/api/index.ts` (Vercel entry). E2E now returns proper 401/403/422 JSON.
- `backend/.env`: `FRONTEND_URL` fixed (was comma-joined) + `config/index.ts` defensive `split(',')[0].trim()`; `EMAIL_PROVIDER=console` (OTP codes printed to server stdout).
- Frontend typecheck **clean** + build passes; backend TSC_OK; **vitest 137/137 (23 files)**.
- **E2E auth flow fully verified** against running server (port 4000): legacy register → login **403 EMAIL_NOT_VERIFIED** → wrong-password **401** → send-verify-code → verify-code → session (`emailVerified:true`) → replay code **422 OTP_INVALID** (single-use works) → login 200 → wrong code 422.
- No Google OAuth or SMTP credentials exist yet — Google sign-in cannot be E2E-tested until user provides them (step 10).
- Catalog facts (context): slug-based `/catalog/{slug}` → 308 → `/catalog/{slug}/parts`; `brands.id` BIGINT; catalogs tuning + accessory; `useCatalogCategories` staleTime 30s; «نوع موتور» filter static UI-only.
- Deployment to Vercel skipped (no credentials in env; user handles `vercel login`).

## Work State
### Completed (auth-providers session)
- **Plan/ADR**: `docs/auth-providers-plan.md` (v4 LOCKED), `docs/adr/ADR-012-auth-providers.md`.
- **Migration**: `backend/migrations/052_auth_providers.sql` — oauth_accounts + one_time_tokens + oauth_login_logs + users.has_password (ADD→backfill→DROP DEFAULT); **APPLIED** to Supabase (with 050/051).
- **Backend** (TSC_OK):
  - `backend/src/domain/providers/{AuthProvider.ts,password.ts,google.ts}` — core interfaces, password provider (register/login/OTP/forgot/reset; exports `OTP_TTL_MS`, `OTP_RATE_WINDOW_SEC`, `OTP_MAX_PER_WINDOW`, `sha256Hex`, `generateOtpCode`), Google provider (JWKS+n nonce, PKCE, modes session/verify/link_required, `sanitizeRedirect` on the internal `redirect` param, callback now forwards `redirect` into `/google-complete?mode&t&email&redirect`).
  - `backend/src/domain/services/auth.ts` rewritten (issueSession + `authConfig.singleSession`, createUserFromIdentity, refresh rotation w/ lock, updateProfile auto-sends verify code on email change, googleAuthorize/Callback/Finalize/Verify/Resend/Link, sendEmailVerificationCode, verifyEmailCodeAndLogin). `providers/password.ts` forgotPassword branches on `has_password===false` → `sendSetPasswordEmail`.
  - Entities/repos/impls: `entities/oauth/{OauthAccount,OneTimeToken,OauthLoginLog}` + `infrastructure/oauth/*`; User entity `hasPassword`/`setPassword`; `UserRepository.impl.ts` `has_password` in save/updatePassword/toSnapshot (fallback `true` if column missing).
  - `config/{index,auth,rateLimits}.ts` (google block + `google:*` limits + `auth.singleSession`); `shared/errors.ts` + `errors.ts` (`EMAIL_NOT_VERIFIED`); `validation/auth.ts`; `routes/auth.ts`; `container.ts`; `presentation/auth/GoogleAuthController.ts` (uses `config.frontendUrl`, not `process.env`); `presentation/auth/authCookies.ts`; `.env.example`.
  - `backend/src/services/email/index.ts` — `sendSetPasswordEmail` («تعیین رمز» for `has_password=false`, URL `&mode=set`).
  - **Error handling fixed**: `middleware/errorHandler.ts` (Hono `ErrorHandler`) replaces dead `errorWrapper.ts` middleware; wired as `app.onError` on root + sub-apps in `app.ts` and `api/index.ts`.
  - Tests fixed: `tests/auth.test.ts` (constructor `new AuthService(undefined, undefined, m.user, m.refreshToken, m.dealer)` ×8; login test `emailVerified: true`); integration tests add `has_password` + `vehicle_model_id` columns. **137/137 pass.**
- **Frontend** (build ✓, tsc ✓):
  - `src/hooks/useAuth.ts` — googleStatus/loginWithGoogle/googleFinalize/googleVerify/googleResend/googleLink/sendVerifyCode/verifyLoginCode (error shape read: `response.data.error.code`).
  - `src/components/auth/GoogleButton.tsx` — status-checked button, builds authorize URL with optional `redirect`; `src/components/auth/OtpInput.tsx` — shared 6-digit input.
  - `src/app/(auth)/google-complete/page.tsx` — modes session/verify/link_required/error; **StrictMode-safe** `finalizedRef` guard; reads `redirect` from URL.
  - `src/app/(auth)/login/page.tsx` — GoogleButton + divider + password form + **EMAIL_NOT_VERIFIED flow** (auto `sendVerifyCode` → OtpInput with resend/back).
  - `src/app/(auth)/register/page.tsx` — GoogleButton + divider + account-type tabs + shared OtpInput.
  - `reset-password/page.tsx` — **«تعیین رمز»** mode (`mode=set`): set-first-password copy for Google-only users; `resetPassword` sets `has_password=true`. `src/lib/api.test.ts` mock typing fixed (tsc clean).
- **E2E verified** (running server): full email flow above; anti-replay OTP confirmed (repo lookup filters `verified_at IS NULL`).

### Active
- (none — feature code complete; server left running on port 4000 for user testing, PID in `C:\Users\MR\AppData\Local\Temp\opencode\server.pid`, logs `server-{out,err}.log`)

### Blocked
- **No credentials yet**: Google OAuth Client ID/Secret + SMTP — step 10 (user guide) pending; Google console redirect URI must be `http://localhost:4000/api/v1/auth/google/callback` (match `GOOGLE_REDIRECT_URI`; backend default port is 4000, FRONTEND_URL is http://localhost:3000). Google flows can only be E2E-tested after this.
- Optional: seed demo workshop profiles.

## Next Move
1. User: obtain Google OAuth credentials + SMTP → set `backend/.env` (`GOOGLE_CLIENT_ID/SECRET/GOOGLE_REDIRECT_URI`, `SMTP_*`, `EMAIL_PROVIDER=smtp` or keep `console`) → restart server.
2. User: browser-test Google sign-in (new user / link_required / verify fallback), forgot/reset password (incl. Google-only user «تعیین رمز»).
3. Optional: SEO metadata for workshop pages (old optional item).

## Relevant Files
- `docs/auth-providers-plan.md` (v4 LOCKED), `docs/adr/ADR-012-auth-providers.md`
- `backend/migrations/052_auth_providers.sql` — **APPLIED** (with 050/051)
- `backend/src/middleware/errorHandler.ts` — **NEW (this session)**: Hono ErrorHandler; `app.ts` + `api/index.ts` register it via `app.onError` on root + `docsRouter` + `apiRouter`
- `backend/src/domain/providers/{AuthProvider.ts,password.ts,google.ts}` — core + providers
- `backend/src/domain/services/auth.ts` — AuthService (core + delegation)
- `backend/src/domain/entities/oauth/*`, `backend/src/domain/infrastructure/oauth/*` — OauthAccount/OneTimeToken/OauthLoginLog
- `backend/src/domain/entities/user/{User.entity.ts,User.repository.ts}`, `backend/src/domain/infrastructure/user/UserRepository.impl.ts` — hasPassword
- `backend/src/domain/presentation/auth/{authCookies.ts,GoogleAuthController.ts}`, `backend/src/domain/presentation/user/UserController.ts`
- `backend/src/routes/auth.ts`, `backend/src/validation/auth.ts`, `backend/src/config/{index,auth,rateLimits}.ts`, `backend/src/errors.ts`, `backend/src/shared/errors.ts`, `backend/src/container.ts`, `backend/.env.example`
- `backend/src/services/email/index.ts` — `sendSetPasswordEmail` («تعیین رمز» for `has_password=false`, URL `&mode=set`)
- `backend/tests/auth.test.ts`, `backend/tests/integration/{conversation-repository,messaging-end-to-end}.test.ts` — fixed; 137/137
- `nextjs-frontend/src/hooks/useAuth.ts` — google/verify methods
- `nextjs-frontend/src/components/auth/{GoogleButton.tsx,OtpInput.tsx}`
- `nextjs-frontend/src/app/(auth)/google-complete/page.tsx` (3 modes + StrictMode guard), `login/page.tsx` (GoogleButton + EMAIL_NOT_VERIFIED OTP step), `register/page.tsx` (GoogleButton + divider + shared OtpInput), `reset-password/page.tsx` («تعیین رمز» mode=set copy), `src/lib/api.test.ts` (fixed mock typing)
- E2E artifacts: `C:\Users\MR\AppData\Local\Temp\opencode\{server.pid,server-out.log,server-err.log,e2e-email.txt,e2e-auth.ps1}` — server on port 4000 + OTP codes
- Workshop/catalog files (completed context): see git history — `backend/src/domain/services/workshopService.ts`, `src/app/(public)/workshops/*`, `src/components/workshops/*`, `src/hooks/useWorkshops.ts`, catalog facade `partsService.ts`/`CatalogController.ts`/`v2-catalogs.ts`, generic routes `catalog/[slug]/*`
