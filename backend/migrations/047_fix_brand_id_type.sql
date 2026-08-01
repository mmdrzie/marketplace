-- 047_fix_brand_id_type.sql
-- brands.id is BIGINT, not UUID. Fix the new columns/tables to match.

BEGIN;

-- Fix parts.brand_id
ALTER TABLE parts DROP COLUMN IF EXISTS brand_id;
ALTER TABLE parts ADD COLUMN brand_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand_id);

-- Fix part_compatible_models.brand_id
DROP TABLE IF EXISTS part_compatible_models CASCADE;
CREATE TABLE part_compatible_models (
  id        BIGSERIAL PRIMARY KEY,
  part_id   BIGINT NOT NULL,
  brand_id  BIGINT NOT NULL,
  model_id  BIGINT,
  year_from INT DEFAULT 0,
  year_to   INT DEFAULT 0,
  note      TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_part_compat_part ON part_compatible_models(part_id);
CREATE INDEX IF NOT EXISTS idx_part_compat_model ON part_compatible_models(model_id);

-- Fix part_suggestions.brand_id and store_id
DROP TABLE IF EXISTS part_suggestions CASCADE;
CREATE TABLE part_suggestions (
  id                BIGSERIAL PRIMARY KEY,
  store_id          UUID NOT NULL,
  name              TEXT NOT NULL,
  part_number       TEXT DEFAULT '',
  oem_number        TEXT DEFAULT '',
  parts_category_id INT,
  brand_id          BIGINT,
  model_id          BIGINT,
  year_from         INT DEFAULT 0,
  year_to           INT DEFAULT 0,
  description       TEXT DEFAULT '',
  manufacturer      TEXT DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note        TEXT DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_part_suggestions_store ON part_suggestions(store_id);
CREATE INDEX IF NOT EXISTS idx_part_suggestions_status ON part_suggestions(status);

COMMIT;
