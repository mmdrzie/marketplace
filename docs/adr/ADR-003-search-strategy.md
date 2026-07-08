# ADR-003: Search Strategy

**Status:** Accepted

## Context
Search is core to the marketplace. Requirements: Persian/Arabic text search, typo tolerance, category + price filtering, fast results.

## Decision
Start with PostgreSQL pg_trgm extension for MVP. Migrate to Meilisearch when search p95 latency exceeds 50ms for 7 consecutive days (measured by monitoring).

## Alternatives Considered
- **Meilisearch from day 1** — operational overhead, paid tier needed for production.
- **Elasticsearch** — overkill for MVP, expensive to operate.
- **PostgreSQL full-text search** — doesn't handle Persian well, no typo tolerance.

## Consequences
- Zero additional infrastructure for MVP.
- pg_trqm handles Persian search adequately for < 5000 listings.
- Clear trigger point documented for Meilisearch migration.
- Migration path: index existing data, dual-write during transition, cut over.
