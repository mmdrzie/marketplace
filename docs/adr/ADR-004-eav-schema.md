# ADR-004: Database Schema (EAV)

**Status:** Accepted

## Context
Listings span diverse categories (cars, machinery, parts) — each with different attributes (engine size, mileage, year, weight, etc.). A fixed-column approach requires hundreds of nullable columns.

## Decision
Use Entity-Attribute-Value (EAV) pattern for listing attributes:
- `listings` table stores common fields (title, price, status, etc.)
- `listing_attributes` table stores key-value pairs per listing per category attribute.
- `attributes` table defines the schema per category (name, type, options, unit, etc.).

## Alternatives Considered
- **JSONB on listings** — simpler but no referential integrity, harder to validate, harder to query/filter.
- **Separate tables per category** — scales poorly (100+ categories = 100+ tables), complex queries for cross-category search.

## Consequences
- More complex queries (joins for attribute data).
- Full flexibility — new categories don't require schema changes.
- Attribute validation driven by `attributes` table (type, options, is_required).
- Filtering requires joining listing_attributes multiple times.
