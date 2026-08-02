# طرح احراز هویت Provider-based — نسخه ۴ (LOCKED)

## هدف
- فعال‌سازی ثبت‌نام واقعی با ایمیل (ارسال واقعی SMTP + تایید کد + قفل ورود برای ایمیل تاییدنشده)
- ورود/ثبت‌نام با گوگل به‌صورت **Provider-based Architecture** — گوگل اولین Provider، بدون وابستگی دائمی
- قابل توسعه برای Apple / GitHub / Microsoft بدون تغییر معماری

## تصمیمات نهایی

| موضوع | تصمیم |
|---|---|
| معماری | `AuthService` هسته + `AuthProvider` interface + `PasswordAuthProvider` + `GoogleAuthProvider` |
| اتصال گوگل | Redirect Authorization Code + **PKCE** (حتی برای Confidential Client) |
| دکمه گوگل | یک دکمه هوشمند: اکانت موجود → ورود خودکار؛ ایمیل جدید → فعال‌سازی فوری |
| تایید ایمیل | `users.email_verified` **تنها منبع حقیقت** |
| شرط اعتماد ایمیل گوگل | فعال‌سازی مستقیم فقط وقتی: `provider == 'google'` **و** `email_verified == true` **و** `email` موجود — وگرنه OTP fallback |
| ثبت‌نام ایمیل | دو مرحله‌ای (ایمیل → کد OTP) + SMTP واقعی + **قفل ورود** برای ایمیل تاییدنشده |
| password_hash | دست‌نخورده (NOT NULL)؛ گوگلی‌ها: bcrypt تصادفی placeholder + `users.has_password = false` |
| Set Password | گوگلی‌ها می‌توانند اولین رمز را از جریان forgot/reset تعیین کنند (`has_password → true`) |
| لینک حساب | فقط بعد از تایید مجدد: اگر کاربر `has_password = true` باشد → درخواست رمز قبل از لینک |
| OAuth State | نه Cookie خام — `one_time_tokens` (jti در کوکی، payload در `metadata` JSONB) |
| توکن‌های موقت | **تک‌مصرف** (atomic `UPDATE … WHERE used_at IS NULL`) — ضد Replay Attack |
| Refresh توکن گوگل | **هرگز ذخیره نمی‌شود** — فقط `sub` + `email` + claims از `id_token` |
| Role | گوگل → همیشه `role='user'`؛ انتخاب نقش بعداً از پروفایل |
| Session | صدور مستقیم access + refresh در همان پاسخ JSON (بدون refresh dance) |
| Multi-device | `issueSession(user, { singleSession? })` — پیش‌فرض چنددستگاهی (`AUTH_SINGLE_SESSION=false`) |
| Avatar گوگل | فقط **URL** ذخیره می‌شود؛ هرگز کپی/دانلود در storage |
| Audit | جدول `oauth_login_logs` برای موفقیت و شکست (ip, user_agent, failure_reason) |
| Rate Limit | جدا: `google:verify {10/900}`، `google:resend {3/3600}`، `google:link {5/900}` |
| Disconnect | Soft delete (`deleted_at`) + restore در لینک مجدد |
| oauth_accounts.email | فقط **Snapshot** از Provider — برای احراز هویت/یکتایی استفاده نمی‌شود |

---

## Migration نهایی `backend/migrations/052_auth_providers.sql`

```sql
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('google','apple','github','microsoft')),
  provider_account_id VARCHAR(255) NOT NULL,
  provider_user_name VARCHAR(255),
  provider_avatar VARCHAR(500),
  email VARCHAR(255),                    -- Snapshot؛ منبع حقیقت users.email
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ,             -- فقط در ورود موفق آپدیت می‌شود (نه Link)
  deleted_at TIMESTAMPTZ,                -- soft delete (Disconnect)
  UNIQUE (provider, provider_account_id),
  UNIQUE (user_id, provider)
);
CREATE INDEX idx_oauth_accounts_user ON oauth_accounts(user_id);

CREATE TABLE one_time_tokens (
  jti UUID PRIMARY KEY,
  type VARCHAR(30) NOT NULL,             -- oauth_state | oauth_result | oauth_verify | oauth_link
  subject UUID,                          -- user_id (اختیاری)
  metadata JSONB NOT NULL DEFAULT '{}',  -- redirect, provider, nonce, code_verifier
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ott_expiry ON one_time_tokens(expires_at);

CREATE TABLE oauth_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  provider VARCHAR(20),
  ip VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- الگوی استاندارد: ADD با DEFAULT → backfill → DROP DEFAULT
ALTER TABLE users ADD COLUMN has_password BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ALTER COLUMN has_password DROP DEFAULT;
```

> ⚠️ اجرا تا زمان در دسترس بودن Supabase متوقف است (`npm run migrate` در `backend/`).

---

## معماری (DDD)

```
AuthService  ← هسته: createUser، issueSession({singleSession})، قوانین لینک، گیت emailVerified،
│              مدیریت one_time_tokens، ثبت audit — وابسته فقط به AuthIdentity (نه به Provider خاص)
├── providers/AuthProvider.ts   ← interface
├── providers/password.ts       ← PasswordAuthProvider (register/login/OTP/forgot/set-password)
└── providers/google.ts         ← GoogleAuthProvider (authorizeUrl، exchange با PKCE، verifyIdToken با jose+JWKS)
```

```ts
interface AuthIdentity {
  provider: string;              // 'google' | 'password' | 'apple' | ...
  providerAccountId: string;     // google sub
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
}

interface AuthProvider {
  name: string;
  authorize?(): Promise<{ url: string; tokenJti: string }>;
  authenticate(input): Promise<AuthIdentity | PendingState>;
  link?(input): Promise<AuthIdentity>;
  unlink?(userId): Promise<void>;
  refreshIdentity?(identity): Promise<AuthIdentity>;
}
```

---

## جریان گوگل

```
GET /auth/google/authorize
  └─ ساخت one_time_tokens (type=oauth_state: nonce, code_verifier, redirect، ۱۰دقیقه)
     کوکی httpOnly ← jti → ریدایرکت به گوگل

GET /auth/google/callback
  ├─ مصرف state (تک‌مصرف) → تبادل کد با PKCE → تایید id_token (JWKS + iss/aud/exp/nonce)
  ├─ ثبت oauth_login_logs (موفق/شکست)
  ├─ oauth_accounts موجود       → mode=session    → result token ۵دقیقه‌ای → POST /auth/google/finalize {t}
  ├─ ایمیل موجود، has_password  → mode=link_required → link token → POST /auth/google/link {t, password}
  ├─ ایمیل جدید + شرط اعتماد ✓  → ساخت کاربر فعال   → mode=session
  └─ ایمیل جدید + شرط اعتماد ✗  → کاربر pending + OTP → mode=verify → POST /auth/google/verify {t, code}
```

نقاط پایانی (همه session را مستقیم برمی‌گردانند):

| Route | توضیح |
|---|---|
| `GET /auth/google/authorize` | شروع OAuth |
| `GET /auth/google/callback` | برگشت از گوگل |
| `POST /auth/google/finalize {t}` | mode=session → صدور توکن‌ها + کوکی refresh |
| `POST /auth/google/verify {t, code}` | تایید OTP (fallback نادر) → فعال‌سازی → صدور توکن‌ها |
| `POST /auth/google/resend {t}` | ارسال مجدد OTP (rate limit جدا) |
| `POST /auth/google/link {t, password}` | تایید رمز → ساخت oauth_accounts → صدور توکن‌ها |
| `POST /auth/send-verify-code {email}` | fallback تایید ایمیل برای لاگین مسدودشده |
| `POST /auth/verify-code {email, code}` | تایید → ورود خودکار |

**قفل ورود رمزی:** `!emailVerified` → 403 `AppError.emailNotVerified()` → فرانت جریان کد تایید را نشان می‌دهد.
**تغییر ایمیل در پروفایل:** خودکار کد تایید به ایمیل جدید ارسال می‌شود.
**Set Password گوگلی‌ها:** `forgotPassword` برای `has_password=false` هم لینک می‌فرستد (قالب «تعیین رمز»)؛ `resetPassword` → ست شدن hash + `has_password=true`.

---

## فرانت‌اند

| فایل | کار |
|---|---|
| `components/auth/GoogleButton.tsx` (NEW) | دکمه با لوگوی گوگل → ریدایرکت به authorize؛ غیرفعال وقتی creds ست نشده |
| `components/auth/OtpInput.tsx` (NEW) | ورودی ۶ رقمی (استخراج از رجیستر فعلی) |
| `app/(auth)/google-complete/page.tsx` (NEW) | سه حالت: session (finalize) / verify (OTP) / link_required (فرم رمز) |
| `app/(auth)/login/page.tsx` | دکمه گوگل + جداکننده «یا»؛ جریان emailNotVerified |
| `app/(auth)/register/page.tsx` | دکمه «ثبت‌نام با گوگل» + تب‌های فعلی |
| `app/(auth)/reset-password/page.tsx` | پشتیبانی از «تعیین رمز» گوگلی‌ها |
| `hooks/useAuth.ts` | finalize/verify/resend/link/send-verify-code/verify-code |

---

## پیش‌نیازها (راهنمای کاربر)

**Google Cloud:** OAuth consent screen + OAuth Client (Web) با redirect URI:
`http://localhost:4000/api/v1/auth/google/callback` → `GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI` در `backend/.env`

**SMTP:** Gmail App Password یا Brevo/Resend → `EMAIL_PROVIDER=smtp` + `SMTP_*` در `backend/.env`

---

## ترتیب اجرا

| گام | کار | خروجی |
|---|---|---|
| ۱ | ADR-012 عمومی «Provider-based Authentication Architecture» | `docs/adr/ADR-012-auth-providers.md` |
| ۲ | Migration 052 — فقط نوشتن | `backend/migrations/052_auth_providers.sql` |
| ۳ | ریفکتور AuthService → هسته + PasswordProvider (بدون تغییر رفتار) | `domain/services/auth.ts` + `domain/providers/*` |
| ۴ | `npx tsc --noEmit` + بیلد فرانت | گیت سبز قبل از گام ۵ |
| ۵ | GoogleAuthProvider | `providers/google.ts` |
| ۶ | مسیرهای جدید | `routes/auth.ts` |
| ۷ | One-time tokens + Audit + issueSession چنددستگاهی | ادغام در گام ۶ |
| ۸ | فرانت‌اند | کامپوننت‌ها + صفحات + hooks |
| ۹ | تست سناریوها | Replay، لینک با رمز غلط، Set Password، fallback OTP |
| ۱۰ | فعال‌سازی Google Cloud + SMTP | راهنمای قدم‌به‌قدم با کاربر |

**سناریوهای تست:** ثبت‌نام ایمیل (کد SMTP واقعی) / لاگین مسدود + جریان کد / گوگل اکانت جدید (فعال‌سازی فوری) / گوگل اکانت موجود (خودکار) / لینک با رمز / Replay توکن‌های موقت / Set Password گوگلی.

## فایل‌های درگیر (خلاصه)
- **DB:** `backend/migrations/052_auth_providers.sql` (NEW)
- **بکاند:** `config/{index,rateLimits}.ts`، `domain/services/auth.ts` (ریفکتور)، `domain/providers/{AuthProvider.ts,password.ts,google.ts}` (NEW)، `routes/auth.ts`، `errors.ts` (emailNotVerified)، `validation/auth.ts`، `.env(.example)`
- **فرانت:** `hooks/useAuth.ts`، `app/(auth)/{login,register,google-complete,reset-password}/page.tsx`، `components/auth/{GoogleButton,OtpInput}.tsx`
- **مستندات:** `docs/adr/ADR-012-auth-providers.md` (NEW)
