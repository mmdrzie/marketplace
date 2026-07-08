# ADR-008: Cost Strategy

**Status:** Accepted

## Context
As an Iranian marketplace startup, minimizing operational costs during development and early launch is critical. USD-denominated services are expensive with IRR conversion.

## Decision
- $0/mo during Phase 0 (development).
- SMS is the only unavoidable production cost (Iranian SMS providers charge per message).
- All other services start on free tiers with clear paid triggers.
- Iranian infrastructure alternatives preferred where available (ArvanCloud for storage, Iranian SMS providers).

## Cost Breakdown at Launch

| Service | Estimated Cost | Notes |
|---------|---------------|-------|
| Supabase (PostgreSQL) | $0 | Free tier (500 MB, 5 GB bandwidth) |
| Vercel Functions | $0 | Hobby tier (100 GB bandwidth) |
| SMS (Kavenegar) | ~$5-15/mo | Pay-as-you-go, volume dependent |
| Email (SMTP) | $0 | Self-hosted or free tier |
| Domain | ~$10/yr | .ir or .com |

## Alternatives Considered
- **AWS/GCP/Azure** — complex, expensive, requires international payment.
- **Iranian VPS** — cheaper but requires manual setup, no serverless.

## Consequences
- Clear budget expectation: ~$5-15/mo at launch.
- No surprise bills from auto-scaling.
- Migration from Supabase/Vercel is possible but not trivial — documented as risk.
