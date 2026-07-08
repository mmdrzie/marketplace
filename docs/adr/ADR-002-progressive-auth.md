# ADR-002: Progressive Authentication

**Status:** Accepted

## Context
Users need progressive access. Browsing should be anonymous, but privileged actions (publishing, messaging) require trust. A single auth gate (email + password) blocks casual browsing.

## Decision
Three independent, decoupled systems:
1. **Authentication** — Email + password. Gates protected pages.
2. **Email Verification** — Optional. Only used for password recovery.
3. **Phone Verification** — Gates privileged actions (publish listing, send message, upgrade account).

All four states are valid: both verified, only email, only phone, neither.

## Alternatives Considered
- **Single auth gate** — blocks browsing, hurts conversion.
- **Social login only** — limits Iranian users where phone/email are primary.

## Consequences
- Higher implementation complexity (3 systems instead of 1).
- Better user funnel — users can browse immediately, verify phone only when needed.
- Clear permission model documented in PermissionService.
