# AUTH_STATE_MACHINE.md — Auth Flow State Machines & Sequences

All diagrams are Mermaid and rendered in most GitHub/VS Code viewers.

## 1. Registration Wizard (Frontend)

### 1.1 Regular user — 2 steps

```mermaid
stateDiagram-v2
    [*] --> SelectRole
    SelectRole --> RegularForm: کاربر عادی selected
    RegularForm --> RegularOtp: email/phone chosen + form valid
    RegularForm --> GoogleFlow: Google chosen
    RegularOtp --> Done: register-with-otp ok
    RegularOtp --> RegularOtp: OTP wrong/expired → resend/back
    GoogleFlow --> Done
    Done --> [*]
```

### 1.2 Business — 3 steps (method before form)

```mermaid
stateDiagram-v2
    [*] --> SelectRole
    SelectRole --> SelectMethod: dealer/agency/store/workshop
    SelectMethod --> BusinessEmailForm: email+password
    SelectMethod --> GoogleAuth: Google
    BusinessEmailForm --> BusinessEmailOtp
    BusinessEmailOtp --> SessionIssued: register-with-otp (user + session)
    SessionIssued --> ProfileCreated: profile ok
    SessionIssued --> Incomplete: profile failed (profileStatus=incomplete)
    ProfileCreated --> PendingScreen: profileStatus=pending
    Incomplete --> PendingScreen: dashboard CTA «تکمیل پروفایل»
    GoogleAuth --> GoogleComplete: authorize?role → callback → finalize (session)
    GoogleComplete --> BusinessForm: only role-specific fields
    BusinessForm --> ProfilePosted: POST /auth/business-profile
    ProfilePosted --> PendingScreen
    BusinessForm --> Skip: انصراف — user stays logged in
    Skip --> [*]
    PendingScreen --> [*]
```

## 2. Login

```mermaid
stateDiagram-v2
    [*] --> LoginForm
    LoginForm --> Home: email+password ok → redirect
    LoginForm --> EmailNotVerified: 403 EMAIL_NOT_VERIFIED (auto sendVerifyCode)
    LoginForm --> GoogleFlow: Google chosen
    EmailNotVerified --> OtpEntry: code sent
    OtpEntry --> Home: verify-login-code ok
    OtpEntry --> EmailNotVerified: resend / back
    GoogleFlow --> Home
    Home --> [*]
```

## 3. Google Flow (backend modes → frontend pages)

```mermaid
stateDiagram-v2
    [*] --> Authorize: GET /auth/google/authorize?role&redirect
    Authorize --> GoogleConsent
    GoogleConsent --> Callback: /auth/google/callback
    Callback --> SessionMode: known identity / new trusted user → /google-complete?mode=session
    Callback --> VerifyMode: email untrusted → /google-complete?mode=verify (OTP)
    Callback --> LinkRequired: existing password account, unverified provider email → /link-account
    Callback --> ErrorMode: invalid_state/access_denied/token_exchange_failed/... → /google-complete?mode=error
    SessionMode --> Finalize: POST /auth/google/finalize (t)
    VerifyMode --> VerifyOtp: POST /auth/google/verify (t, code)
    LinkRequired --> LinkForm: password → POST /auth/google/link (t, password)
    Finalize --> Session: issued
    VerifyOtp --> Session
    LinkForm --> Session
    Session --> BusinessFormIfRole: if role != user → business form
    ErrorMode --> [*]
```

## 4. OTP (generic OtpField usage)

```mermaid
stateDiagram-v2
    [*] --> OtpInput
    OtpInput --> Verifying: 6 digits entered
    Verifying --> Success: onComplete ok
    Verifying --> OtpInput: error (wrong code) — keep digits or clear
    OtpInput --> Resend: timer expired → resend endpoint
    Resend --> OtpInput: new code sent, timer restarts
    Success --> [*]
```

## 5. Sequence — Email registration (business)

```mermaid
sequenceDiagram
    participant U as User
    participant P as Register page
    participant B as Backend
    participant DB as Database
    participant M as Mailer
    U->>P: fill role form + name/email/password
    P->>B: POST /auth/send-register-otp {type:email, identifier}
    B->>DB: store OTP hash (5min TTL, rate-limited)
    B->>M: send 6-digit code
    M-->>U: email
    U->>P: enter code
    P->>B: POST /auth/register-with-otp {role, business fields, code}
    B->>DB: verify OTP (single-use) + create users row (role)
    B->>DB: create profile row (status=pending)
    alt profile ok
        B-->>P: 201 {token, user, profileStatus:'pending'}
    else profile failed
        B-->>P: 201 {token, user, profileStatus:'incomplete'}
    end
    P->>U: StatusCard «در انتظار تأیید ادمین»
```

## 6. Sequence — Google registration with business role

```mermaid
sequenceDiagram
    participant U as User
    participant P as Register page
    participant G as Google
    participant B as Backend
    participant DB as Database
    U->>P: role=business + method=Google
    P->>B: GET /auth/google/authorize?role=dealer&redirect=/...
    B->>B: store role in oauth_state metadata
    B-->>U: 302 to Google
    U->>G: consent
    G-->>B: GET /auth/google/callback?code&state
    B->>DB: consume state, verify ID token, create user (role) + link oauth
    B-->>U: 302 /google-complete?mode=session&t=...
    P->>B: POST /auth/google/finalize {t}
    B-->>P: session issued (user logged in)
    P->>U: business form (only role-specific fields)
    U->>P: dealer_code/address/documents
    P->>B: POST /auth/business-profile (auth)
    B->>DB: upsert profile (status=pending)
    B-->>P: profileStatus:'pending'
    P->>U: StatusCard «در انتظار تأیید ادمین»
```

## 7. Sequence — Link account (existing password user signs in with Google)

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend
    participant DB as Database
    participant P as Link-account page
    U->>B: callback with unverified provider email matching password account
    B-->>U: 302 /link-account?t=...&email=...
    U->>P: enter account password
    P->>B: POST /auth/google/link {t, password}
    B->>DB: bcrypt check → link oauth_accounts row → issue session
    B-->>P: 200 {token, user}
    P->>U: redirect to dashboard/home
```

## 8. Sequence — Active users metric

```mermaid
sequenceDiagram
    participant C as Client (widget)
    participant B as Backend
    participant DB as Database
    C->>B: GET /stats/public (every 60s staleTime)
    B->>DB: counters query incl. activeUsers
    Note over DB: COUNT(refresh_tokens WHERE last_used_at > now()-10min)
    B-->>C: {generatedAt, cacheFor:60, counters:{activeUsers,...}}
    C->>C: render «کاربران آنلاین: N»
```
