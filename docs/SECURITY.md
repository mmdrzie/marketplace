# Security

## Authentication
- Access tokens: JWT, 15 min, stored in memory (Zustand)
- Refresh tokens: JWT, 7 day, httpOnly cookie, SameSite=Lax, Secure
- CSRF mitigated by SameSite=Lax + JSON API content type
- Passwords hashed with bcrypt

## Token Lifecycle
- Access token NEVER persisted to localStorage
- Refresh token rotated on every use
- All tokens revoked on password change

## Rate Limiting
- 10 rate limits defined in `backend/src/config/rateLimits.ts`
- In-memory for MVP, Redis when multi-instance
- Retry-After header on 429 responses
