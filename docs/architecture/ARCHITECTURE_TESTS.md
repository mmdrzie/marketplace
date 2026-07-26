# Architecture Tests

Tests executed in CI to enforce architecture rules.

## Layer Dependency Tests (Structure)

```typescript
// Architecture.test.ts
describe('Architecture Dependencies', () => {
  test('domain does not import infrastructure', () => {
    // scan imports in src/**/domain/ — no "infrastructure" allowed
  });

  test('application does not import presentation', () => {
    // scan imports in src/**/application/ — no "presentation" allowed
  });

  test('presentation does not import repository', () => {
    // scan imports in src/**/presentation/ — no "repository" allowed (except interfaces)
  });

  test('projection does not import write repository', () => {
    // scan imports in src/**/projection/ — no write model repositories
  });
});
```

## Aggregate Tests

| Test | Description |
|------|-------------|
| Aggregate Transaction | Only root can modify state |
| Cross-Aggregate | No direct modification of other aggregates |
| Event Ordering | Events are sequential and immutable |

## Query Tests

| Test | Description |
|------|-------------|
| Read Model Isolation | Query does not write to database |
| Row Level Security | Query respects user permissions |

## Event Tests

| Test | Description |
|------|-------------|
| Domain Event | Contains only domain primitives |
| Integration Event | Contains serializable DTOs |
| Event Version | Schema migration is backward compatible |
