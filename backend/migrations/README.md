# Database Migrations

## Naming
- Format: `NNN_name.sql` (3-digit sequential, kebab-case)
- Never renumber. Always append.

## Strategy
- Forward-only. Reverse by writing a new migration.
- Development reset: `supabase db reset`
- Production rollback: `NNN_rollback_name.sql`

## Migration List

| # | Name | Tables | Phase |
|---|------|--------|-------|
| 001 | auth | users, refresh_tokens | Phase 1 |
| 002 | verifications | email_verifications, phone_verifications | Phase 3 |
| 003 | categories | categories, attributes, provinces, cities | Phase 4 |
| 004 | listings | listings, listing_attributes, listing_images | Phase 5 |
| 005 | search | pg_trgm extension, GIN indexes | Phase 5 |
| 006 | chat | conversations, messages | Phase 6 |
| 007 | features | favorites, articles | Phase 7 |
| 008 | payments | payments, wallet_transactions | Phase 8 |
| 009 | dealers | dealer_profiles | Phase 9 |
| 010 | notifications | notifications | Phase 10 |
| 011 | seed | Seed data | Phase 10 |
| 050 | workshop_profiles | workshop_profiles | Auth |
| 051 | workshop_role | users.role + 'workshop' | Auth |
| 052 | auth_providers | oauth_accounts, one_time_tokens, oauth_login_logs, users.has_password | Auth |
| 053 | business_roles | dealer_profiles.status, refresh_tokens.{last_used_at,last_ip,last_user_agent} | Auth |
