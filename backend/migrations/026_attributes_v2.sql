-- 026_attributes_v2.sql
-- Phase 1: New Attribute System (Attribute → Option → Value)
-- هم‌زیست با سیستم قدیمی attributes/listing_attributes

BEGIN;

-- Attribute Definitions (مستقل از category)
CREATE TABLE IF NOT EXISTS attribute_definitions (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  name_en       TEXT,
  slug          TEXT NOT NULL UNIQUE,
  data_type     TEXT NOT NULL CHECK (data_type IN ('STRING','INTEGER','FLOAT','BOOLEAN','DATE','ENUM','MULTI_ENUM','JSON')),
  applies_to    TEXT[] DEFAULT '{}',  -- e.g. {'car','truck','motorcycle'}
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attr_def_slug ON attribute_definitions(slug);
CREATE INDEX IF NOT EXISTS idx_attr_def_applies ON attribute_definitions USING GIN(applies_to);

-- Attribute Options (مقادیر معتبر برای ENUM/MULTI_ENUM)
CREATE TABLE IF NOT EXISTS attribute_options (
  id                BIGSERIAL PRIMARY KEY,
  attribute_id      BIGINT NOT NULL REFERENCES attribute_definitions(id) ON DELETE CASCADE,
  value             TEXT NOT NULL,
  label             TEXT NOT NULL,
  label_en          TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attribute_id, value)
);

CREATE INDEX IF NOT EXISTS idx_attr_opt_attribute ON attribute_options(attribute_id);

-- Attribute Values (Polymorphic: برای listing یا variant یا model)
CREATE TYPE value_entity_type AS ENUM ('listing', 'variant', 'model');

CREATE TABLE IF NOT EXISTS attribute_values (
  id                BIGSERIAL PRIMARY KEY,
  entity_type       value_entity_type NOT NULL,
  entity_id         BIGINT NOT NULL,
  attribute_id      BIGINT NOT NULL REFERENCES attribute_definitions(id) ON DELETE CASCADE,
  option_id         BIGINT REFERENCES attribute_options(id) ON DELETE SET NULL,
  value_text        TEXT,
  value_int         BIGINT,
  value_float       DOUBLE PRECISION,
  value_bool        BOOLEAN,
  value_date        DATE,
  value_json        JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, attribute_id)
);

CREATE INDEX IF NOT EXISTS idx_attr_vals_entity ON attribute_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attr_vals_attribute ON attribute_values(attribute_id);

COMMIT;
