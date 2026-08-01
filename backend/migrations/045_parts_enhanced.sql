-- 045_parts_enhanced.sql
-- Enhance parts table + part_compatible_models + part_suggestions

BEGIN;

-- 1. Enhance parts table
ALTER TABLE parts ADD COLUMN IF NOT EXISTS parts_category_id INT REFERENCES parts_categories(id);
ALTER TABLE parts ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
ALTER TABLE parts ADD COLUMN IF NOT EXISTS model_id BIGINT REFERENCES vehicle_models(id);
ALTER TABLE parts ADD COLUMN IF NOT EXISTS year_from INT DEFAULT 0;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS year_to INT DEFAULT 0;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS oem_number TEXT DEFAULT '';
ALTER TABLE parts ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(parts_category_id);
CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand_id);
CREATE INDEX IF NOT EXISTS idx_parts_model ON parts(model_id);

-- 2. Many-to-many compatibility
CREATE TABLE IF NOT EXISTS part_compatible_models (
  id        BIGSERIAL PRIMARY KEY,
  part_id   BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  brand_id  UUID NOT NULL REFERENCES brands(id),
  model_id  BIGINT REFERENCES vehicle_models(id),
  year_from INT DEFAULT 0,
  year_to   INT DEFAULT 0,
  note      TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_part_compat_part ON part_compatible_models(part_id);
CREATE INDEX IF NOT EXISTS idx_part_compat_model ON part_compatible_models(model_id);

-- 3. Store suggestions for new parts
CREATE TABLE IF NOT EXISTS part_suggestions (
  id                BIGSERIAL PRIMARY KEY,
  store_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  part_number       TEXT DEFAULT '',
  oem_number        TEXT DEFAULT '',
  parts_category_id INT REFERENCES parts_categories(id),
  brand_id          UUID REFERENCES brands(id),
  model_id          BIGINT REFERENCES vehicle_models(id),
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
