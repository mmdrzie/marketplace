# Non-Functional Requirements (NFR)

## Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Time (Read) | <100ms (p95) | New Relic |
| Response Time (Write) | <500ms (p95) | New Relic |
| Read Model Refresh | <2s (listing), <5s (search) | Event → Projection SLA |
| API Throughput | >1000 req/s | Load Test (k6) |
| Page Load (SSR) | <1.5s (LCP) | Lighthouse CI |

## Availability

| Tier | SLA | Downtime/Year |
|------|-----|---------------|
| Read APIs | 99.9% | 8.76h |
| Write APIs | 99.5% | 43.8h |
| Search | 99.5% | 43.8h |
| Auth | 99.9% | 8.76h |

## Security

- All endpoints behind Supabase Row Level Security
- Rate limiting: 100 req/min per user (write), 1000 req/min (read)
- File upload: max 10MB per file, MIME validation
- JWT expiry: 15 min access, 7 day refresh
- API Keys: rotated every 90 days
- Payment: PCI DSS via provider (no raw card data)

## Data

- Outbox retention: 7 days (after successful delivery)
- Audit log retention: 90 days
- Deleted listings: 30 days soft delete → hard delete
- Backup: daily automated (Supabase PITR)
