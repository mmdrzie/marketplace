# ADR-001: CQRS + DDD + Event-Driven Architecture

**Status:** Accepted  
**Date:** 2026-07-21  
**Author(s):** Architecture Team

## Context

The existing marketplace codebase has no clear separation between read and write operations. All pages query the main database tables directly, leading to:

- Coupling between read and write models
- No clear boundary for search/analytics performance
- No mechanism for eventual consistency
- No replay capability for projections

## Decision

Adopt CQRS + DDD + Event-Driven Architecture as the core architectural pattern:

- **CQRS**: Separate read models (Projections) from write models (Aggregates)
- **DDD**: Aggregate Roots define transactional boundaries
- **Event-Driven**: All state changes produce Domain Events → Integration Events → Projections

## Key Architectural Rules

1. **Read/Write Separation**: All public pages read only from Projections. Owner/Admin may read from Write Model for drafts and editing.
2. **Aggregate Boundaries**: Each Aggregate Repository only loads/saves its root. No cross-aggregate updates in a single transaction.
3. **Domain Event → Integration Event**: Domain events are internal; mappers translate to Integration Events for external consumers.
4. **Outbox Pattern**: Events are saved atomically with the Aggregate in a single database transaction.
5. **Projections are ephemeral**: They can be rebuilt at any time from events.

## Consequences

- Higher initial implementation complexity
- Eventual consistency between write and read (SLA: <2s for listings, <5s for search)
- Excellent scalability for reads
- Full audit trail via events
- Easy to add new projections without modifying existing code

## References

- ADR-002: Why Projection Architecture
- ADR-003: Why Supabase
- ADR-004: Why Integration Layer
