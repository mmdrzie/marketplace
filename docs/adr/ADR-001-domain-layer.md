# ADR-001: Domain Layer

**Status:** Accepted

## Context
Business logic scattered across controllers, middleware, and helpers creates duplication and makes testing difficult.

## Decision
All business logic lives exclusively inside Domain Services. Controllers/routes are thin — they authenticate, validate input, call the appropriate Domain Service method, and return the response.

## Alternatives Considered
- **Active Record pattern** (Laravel-style) — couples business logic to the database, hard to test without DB.
- **Service Layer in controllers** — leads to fat controllers, test duplication.

## Consequences
- Domain Services are testable without HTTP or database.
- Adding a new feature means adding a Domain Service method + a route. No other code changes.
- Controllers remain thin and predictable.
