# Dependency Policy

## قانون کلی: وابستگی فقط به داخل (Inward Dependency)

```
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

هیچ لایه‌ای نباید به لایه بالاتر از خود وابسته باشد.

## Dependency Decision Matrix

| From | To | Allowed |
|------|----|---------|
| Presentation | Application | ✅ |
| Presentation | Domain | ❌ |
| Presentation | Infrastructure | ❌ |
| Presentation | Repository | ❌ |
| Application | Domain | ✅ |
| Application | Repository | ✅ (از طریق Interface) |
| Application | Infrastructure | ❌ |
| Domain | Infrastructure | ❌ |
| Domain | Repository | ❌ (Interface از Application) |
| Domain | Application | ❌ |
| Repository | Domain | ✅ |
| Repository | Infrastructure | ✅ |
| Integration | Domain | ❌ |
| Integration | Application | ❌ |
| Integration | Repository | ❌ |
| Projection | Projection (دیگر) | ❌ |
| Projection | Repository | ❌ |
| Projection | Event | ✅ |

## Architecture Fitness Tests (قابل بررسی در CI)

1. Domain نباید Infrastructure را import کند.
2. Application نباید Providerهای Integration را مستقیم صدا بزند.
3. Presentation نباید Repository را import کند.
4. Projection Builder نباید Projection دیگر را بخواند.
5. هیچ Query نباید مستقیماً جدول Write Model را بخواند (به جز استثناهای تعریف‌شده: Owner Read-After-Write, Admin Draft).
6. Domain نباید Queue را بشناسد.
7. هیچ Feature نباید Aggregate Feature دیگر را مستقیم تغییر دهد.
