# ADR-007: Infrastructure Scaling

**Status:** Accepted

## Context
Paid infrastructure services are expensive. Adding them before they're needed wastes money and adds maintenance burden.

## Decision
Start on free tiers. Each paid component has a documented trigger condition. No paid service is added before its trigger is met.

| Service | MVP | Trigger for Paid |
|---------|-----|-----------------|
| Database | Supabase free (500 MB) | ≥ 80% row limit |
| Cache | In-memory Map | > 1 Vercel Function instance |
| Search | PostgreSQL pg_trgm | p95 search latency > 50ms for 7 days |
| Queue/Events | In-process | > 1 instance or need for persistence |
| Email | Console (dev) / SMTP (prod) | On launch |
| SMS | Console (dev) / Iranian provider (prod) | On launch |
| Payments | Noop provider | On launch |
| File Storage | Local / Supabase Storage | When local is insufficient |

## Alternatives Considered
- **All paid from day 1** — $50-200/mo before revenue.
- **All free forever** — not sustainable at scale.

## Consequences
- MVP runs at $0/mo (excluding SMS in production).
- Clear upgrade path for each component.
- No surprise costs.
