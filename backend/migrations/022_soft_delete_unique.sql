-- 022_soft_delete_unique.sql
-- Allow reused email/slug for soft-deleted rows by converting UNIQUE
-- table/column constraints into partial unique indexes that ignore
-- soft-deleted rows.

BEGIN;

-- users: allow reused email for soft-deleted accounts
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
DROP INDEX IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email) WHERE deleted_at IS NULL;

-- listings: allow reused slug for soft-deleted listings
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_slug_key;
DROP INDEX IF EXISTS listings_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS listings_slug_key ON listings (slug) WHERE deleted_at IS NULL;

COMMIT;
