# Contributing

## Commit Convention
```
type(scope): description

Types: feat | fix | refactor | test | docs | chore | ci | style | perf
Scopes: phase-0 | auth | listings | chat | shared | backend | frontend | config | docs
```

## PR Guidelines
- Max 300 lines changed
- One logical change per PR
- Title: `[Phase N] Description`
- At least 1 reviewer
- CI must pass (lint + typecheck + tests)

## Branch Strategy
```
main → develop → phase/* or feature/* or fix/*
```
