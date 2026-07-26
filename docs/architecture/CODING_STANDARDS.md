# Coding Standards

## TypeScript / Node.js

### Imports
- Internal absolute paths: `@/` → `src/`
- Domain imports must not reference Infrastructure

### Naming

| Symbol | Convention | Example |
|--------|-----------|---------|
| Aggregate | PascalCase | Listing, Vehicle |
| Use Case | PascalCase + UseCase | CreateListingUseCase |
| Controller | PascalCase + Controller | ListingController |
| Repository Interface | PascalCase + Repository | ListingRepository |
| Repository Impl | PascalCase + .impl.ts | ListingRepository.impl.ts |
| Projection | PascalCase + Projection | ListingProjection |
| Event | PascalCase + Event | ListingCreatedEvent |
| Command | PascalCase + Command | CreateListingCommand |
| Query | PascalCase + Query | GetListingQuery |
| DTO | PascalCase + DTO | ListingDTO |
| Mapper | PascalCase + Mapper | ListingMapper |
| Provider Interface | PascalCase + Provider | PaymentProvider |
| Functions | camelCase | validateSlug() |
| Variables | camelCase | listingTitle |
| Constants | UPPER_SNAKE_CASE | MAX_IMAGES |

### File Organization
```
feature/
├── domain/
│   ├── Listing.entity.ts
│   ├── Listing.repository.ts      (interface)
│   └── ListingAttribute.entity.ts
├── application/
│   ├── CreateListingUseCase.ts
│   ├── UpdateListingUseCase.ts
│   ├── DeleteListingUseCase.ts
│   ├── CreateListingCommand.ts
│   ├── ListingDTO.ts
│   └── ListingMapper.ts
├── presentation/
│   ├── ListingController.ts
│   └── ListingRequest.ts
└── infrastructure/
    └── ListingRepository.impl.ts
```

### Error Handling
- Domain errors: extend `Result<T, E>` pattern
- Application errors: use `ApplicationError` with code + message
- Infrastructure errors: log and wrap in `InfrastructureError`
- No try/catch in Domain layer

### Testing
- Unit: `feature/__tests__/` (Jest/Vitest)
- Integration: `tests/integration/`
- Aggregates: test invariants and transaction boundaries
- Use Cases: mock repository, test each use case
