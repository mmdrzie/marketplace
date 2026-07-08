# ADR-006: Event Bus

**Status:** Accepted

## Context
Cross-cutting concerns (cache invalidation, notifications, analytics) should not be coupled to domain operations. Posting a listing should not care about cache invalidation logic.

## Decision
In-process, typed, fire-and-forget EventBus. Domain Services publish events after successful operations. Subscribers handle side effects (cache invalidation, notifications, etc.).

Events are **not** for critical operations. If an operation must succeed (e.g., payment processing), it happens in the domain service directly — not through an event.

## Alternatives Considered
- **Redis pub/sub** — operational overhead, unnecessary for single-process MVP.
- **Message queue (RabbitMQ/SQS)** — overkill at MVP scale.
- **Direct calls** — couples domain to side effects.

## Consequences
- Events are lost on deploy (all in-memory subscribers reset).
- Non-critical side effects only — documented contract.
- Easy to replace with Redis/Inngest when multi-instance deployment happens.
- Clear trigger point documented in PLAN.md.
