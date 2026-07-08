# Architecture Overview

## Layers

```
┌─────────────────────────────┐
│         Routes              │  Thin: auth, validate, call service, respond
├─────────────────────────────┤
│      Domain Services        │  Business logic only
├─────────────────────────────┤
│       Repositories          │  Database operations only
├─────────────────────────────┤
│     Services (Infra)        │  Email, SMS, Cache, Permission, Payment
├─────────────────────────────┤
│         Database            │  Supabase PostgreSQL
└─────────────────────────────┘
```

## Key Principles
1. Business logic lives ONLY in Domain Services.
2. Routes are thin wrappers — authenticate, validate, call, respond.
3. Repositories only do database operations.
4. External providers accessed ONLY through interfaces.
5. Permissions checked ONLY through PermissionService.

## Request Flow
```
HTTP Request → CORS → Rate Limiter → Auth (optional) → Route Handler
  → Validation → Domain Service → Repository → Database
  → Response ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```
