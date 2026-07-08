# ADR-005: Permission Service

**Status:** Accepted

## Context
Permission checks scattered across controllers create security gaps. Inline `if (user.role === 'admin')` is hard to audit and impossible to enforce consistently.

## Decision
All permission checks go through `PermissionService.can()` / `PermissionService.requireCapability()`. Capabilities are defined as a union type, mapped to requirements in a single configuration object.

To add a new capability: add to `Capability` type, add to `CAPABILITY_REQUIREMENTS` map, use in route. No other code changes.

## Alternatives Considered
- **RBAC middleware** — rigid, requires role-permission mapping table in DB.
- **Policy classes** (Laravel-style) — more boilerplate, scattered.

## Consequences
- Single source of truth for permissions.
- Easy audit — grep for `requireCapability` across the codebase.
- 6 capabilities defined at MVP, easy to extend.
- Tests cover all capabilities in one file.
