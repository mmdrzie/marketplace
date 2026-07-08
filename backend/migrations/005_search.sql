-- 005_search.sql
-- PostgreSQL pg_trgm extension + GIN indexes for full-text search

BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_listings_title_trgm ON listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_description_trgm ON listings USING GIN (description gin_trgm_ops);

COMMIT;
