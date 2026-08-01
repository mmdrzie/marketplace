-- 046_parts_enhanced_fix.sql
-- Add columns without FK constraints, create tables

BEGIN;

-- Reset old parts data
TRUNCATE parts CASCADE;

-- Add columns to parts (without FK constraints for now)
ALTER TABLE parts ADD COLUMN IF NOT EXISTS parts_category_id INT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS brand_id UUID;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS model_id BIGINT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS year_from INT DEFAULT 0;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS year_to INT DEFAULT 0;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS oem_number TEXT DEFAULT '';
ALTER TABLE parts ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(parts_category_id);
CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand_id);
CREATE INDEX IF NOT EXISTS idx_parts_model ON parts(model_id);

-- part_compatible_models (no FK constraints to avoid issues)
CREATE TABLE IF NOT EXISTS part_compatible_models (
  id        BIGSERIAL PRIMARY KEY,
  part_id   BIGINT NOT NULL,
  brand_id  UUID NOT NULL,
  model_id  BIGINT,
  year_from INT DEFAULT 0,
  year_to   INT DEFAULT 0,
  note      TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_part_compat_part ON part_compatible_models(part_id);
CREATE INDEX IF NOT EXISTS idx_part_compat_model ON part_compatible_models(model_id);

-- part_suggestions (no FK constraints)
CREATE TABLE IF NOT EXISTS part_suggestions (
  id                BIGSERIAL PRIMARY KEY,
  store_id          UUID NOT NULL,
  name              TEXT NOT NULL,
  part_number       TEXT DEFAULT '',
  oem_number        TEXT DEFAULT '',
  parts_category_id INT,
  brand_id          UUID,
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
