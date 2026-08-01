-- 044_parts_categories.sql
-- Hierarchical parts categories (vehicle-type rooted)

BEGIN;

CREATE TABLE IF NOT EXISTS parts_categories (
  id          SERIAL PRIMARY KEY,
  parent_id   INT REFERENCES parts_categories(id),
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  icon        VARCHAR(100) DEFAULT '',
  description TEXT DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_categories_parent ON parts_categories(parent_id);

COMMIT;
