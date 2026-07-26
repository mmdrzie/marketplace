# ADR-010: v5.1 Architecture — DDD + CQRS + Outbox + Projections

**Status:** Accepted  
**Date:** 2026-07-22  
**Supersedes:** ADR-001 (Domain Layer), ADR-006 (Event Bus)  
**Author(s):** Architecture Team

## Context

The initial architecture (v1–v4) grew organically with:
- Business logic scattered across Domain Services
- An in-process `InMemoryEventBus` for side effects (no persistence, lost on deploy)
- Direct `getDb()` calls in routes bypassing any abstraction
- No separation between read and write models
- No replay capability for historical events
- 47 dependency violations across layers

The target architecture (v5.1) must enforce strict layer isolation, reliable event delivery via Outbox, and CQRS with Projections for all reads.

## Decision

Adopt the following architecture as the single standard:

### 1. Layer Architecture

```
┌──────────────────────────────────────────────────┐
│                   Routes (thin)                  │
│         (auth + validation + response)           │
├──────────────────────────────────────────────────┤
│              Presentation (Controllers)          │
│         (orchestrates use cases per route)       │
├──────────────────────────────────────────────────┤
│              Application (UseCases)              │
│         (business logic, transaction boundary)   │
├──────────────────────────────────────────────────┤
│           Domain (Entities, Value Objects)       │
├──────────┬───────────────────┬───────────────────┤
│  Repository Interface      │  Domain Events     │
├──────────┴───────────────────┴───────────────────┤
│            Infrastructure (PostgreSQL, Supabase,  │
│            S3, Outbox, Projection Writers,        │
│            Repository Implementations)            │
└──────────────────────────────────────────────────┘
```

### 2. Dependency Rules (CI-enforced)

| # | Rule | Tool |
|---|------|------|
| 1 | **Presentation** → **❌ Infrastructure** | dependency-cruiser |
| 2 | **Application** → **❌ Infrastructure** | dependency-cruiser |
| 3 | **Domain** → **❌ Express** (`import express` in `src/domain/`) | dependency-cruiser |
| 4 | **Application** → **❌ SQL Driver** (`import pg` in `src/domain/application/`) | dependency-cruiser |
| 5 | **Infrastructure** → **❌ Presentation** | dependency-cruiser |
| 6 | **Routes** → **❌ `getDb()`** | ESLint `no-restricted-syntax` |
| 7 | **`eventBus.publish()`** → **❌ Forbidden** (use Outbox only) | ESLint `no-restricted-syntax` |

### 3. CQRS — Read/Write Separation

- **All public pages** read only from **Projections** (read models)
- **Owner/Admin** may read from the Write Model for:
  - Draft listings (not yet published)
  - Editing existing data (read current state)
- This is an **architecturally allowed exception**, not a violation

### 4. Aggregate Boundaries

Each Aggregate Root defines its own transactional boundary. No cross-aggregate updates in a single transaction.

| Aggregate | Entities | Outbox Included |
|-----------|----------|-----------------|
| **Listing** | Listing + Media | ✅ |
| **Conversation** | Conversation + Message | ✅ |
| **User** | User + Profile | ✅ |
| **Dealer** | Dealer | ✅ |
| **Payment** | Payment | ✅ |
| **Taxonomy** | Category | ✅ |
| **Brand** | Brand | ✅ |
| **Model** | VehicleModel | ✅ |
| **Variant** | VehicleVariant | ✅ |

**Note:** Brand, Model, and Variant are independent Aggregates (each with its own identity, transaction boundary, and event stream). The shared `VehicleRepository` interface is a code-organization convenience, not an aggregate boundary.

### 5. Event Registry — Single Source of Truth

**File:** `backend/src/domain/events/EventTypes.ts`
- **Owner:** Architecture Team
- **Breaking change:** new constant only (e.g. `.v2`)
- **Modification:** Architecture Review required
- **All domain events, integration events, projection events, and notification events** live in this one file.
- Namespaced by domain: `ListingEvents.created`, `ConversationEvents.started`, etc.
- No other event registry files may be created.

```typescript
// Structure example:
export const ListingEvents = { created: 'listing.created.v1', ... } as const;
export const ConversationEvents = { started: 'conversation.started.v1', ... } as const;
```

### 6. Event Versioning Policy

| Rule | Value |
|------|-------|
| **Convention** | `.v1`, `.v2`, etc. suffix on each constant |
| **Simultaneous versions supported** | 2 |
| **Deprecation window** | 2 Sprints |
| **Old version deleted when** | Zero consumers remain in codebase |
| **Breaking change** | New constant only (never modify existing) |

### 7. Outbox Pattern

- All domain events are persisted atomically with the aggregate in a single DB transaction
- `OutboxWorker` reads from the `outbox` table and dispatches events to:
  - Projection writers (internal)
  - Integration event mappers (external)
- **IdempotencyRepository** is mandatory (prevents duplicate processing)
- **Dual-write** (publishing to both `eventBus` and Outbox) is temporarily tolerated during migration, but each Sprint must reduce the count. Zero dual-writes is the target.
- CI Rule 7 (`eventBus.publish()` forbidden) is enforced from Sprint 1 onward.

### 8. Projection Lifecycle

Projections are ephemeral read models rebuilt from the event stream.

**Normal operation:**
```
Domain Event → Outbox → Worker → Writer → Projection Table → QueryRepository → Controller → Route
```

**Rebuild (when projection is corrupted):**
1. `DROP TABLE IF EXISTS projection_name`
2. `CREATE TABLE projection_name` (latest schema)
3. Drain outbox queue (lock writes)
4. Replay all relevant events from `outbox` in order
5. Verify row count matches expected
6. Unlock outbox (resume normal flow)
7. Point QueryRepository to rebuilt table

**Zero-downtime swap:**
- Keep `projection_v1` active
- Rebuild as `projection_v2`
- Atomically switch QueryRepository → `projection_v2`
- Drop `projection_v1`

**Projections with zero consumers** are deleted (Dead Read Model). See: Analytics Projection.

### 9. UnitOfWork Rules

- One transaction boundary per Aggregate
- Begin → operations → commit (or rollback on error)
- Never span multiple aggregates in one transaction
- The `outbox` table is always included in the aggregate's transaction

### 10. Rollback Strategy

| Trigger | Procedure | Data Compatible? |
|---------|-----------|-----------------|
| **Wave A fail** (>3 tests break after DI wiring) | `git revert` DI + UnitOfWork commits | ✅ Yes (old repos still exist) |
| **Wave B fail** (projection returns wrong data) | `git revert` projection wiring → routes point back to old repos | ✅ Yes (old repos not deleted yet) |
| **Dual-write removal fail** (events missing) | `git revert` UseCase changes → add back `eventBus.publish()` | ✅ Yes (eventBus still active) |
| **OutboxWorker fail** (events stuck) | Revert OutboxWorker → redeploy old worker | ✅ Yes (old event types still in DB) |
| **Catastrophic** | `git checkout deploy/Sprint-N` → redeploy | ✅ New columns are optional; old code ignores them |

### 11. Operational KPIs

| Metric | Target | Action if exceeded |
|--------|--------|-------------------|
| **Test status** | All green | Block Sprint |
| **Dependency violations (delta)** | ≤0 per Sprint | Block PR |
| **Projection Lag** | <1s | >1s warn, >5s rebuild, >30s restart |
| **Failed projection events** | 0 | Alert + Replay affected events |
| **Replay success rate** | 100% | Debug worker + fix handler |
| **Outbox queue depth** | 0 steady | Scale worker, alert if >1000 |
| **Outbox retry count** | ≤3 | >3 → Dead Letter Queue, alert |
| **Dead Letter Queue size** | 0 | Investigate failing events |
| **Silent event drops** | 0 | Every event type must have a handler |

### 12. Success Metrics (Gradual)

| Metric | Before | Sprint 1 | Sprint 2 | Sprint 3 |
|--------|--------|----------|----------|----------|
| Dependency Violations | 47 | 28 | 10 | 0 |
| Event Registries | 3 | 1 | 1 | 1 |
| Dual Writes | 11 | 0 | 0 | 0 |
| Projection Readers | 0 | 3 | 5 | 5 |
| Old Repositories | 12 | 8 | 4 | 0 |
| Old Domain Services | 6 | 6 | 4 | 0 |
| Raw SQL Routes | 11 | 8 | 2 | 0 |
| CI Pipeline | ❌ | ✅ | ✅ | ✅ |
| CQRS Compliance | Partial | Partial | Partial | Full |

## Consequences

- **Positive:** Clear boundaries, testable layers, replayable events, auditable state changes, measurable migration progress
- **Negative:** Higher initial migration cost, eventual consistency (SLA: <2s), requires CI investment
- **Migration risk:** Mitigated by Rollback Points per Sprint Wave

## References

- ADR-001-cqrs-and-baseline.md (baseline architecture, superseded by this ADR for migration planning)
- EventTypes.ts (single source of truth)
- DEPENDENCY_POLICY.md (CI-enforced rules)
- Migration Blueprint (Sprint execution plan)
