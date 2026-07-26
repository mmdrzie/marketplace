-- 027_vehicle_registry.sql
-- Phase 1: Vehicle Registry (اسکلت اولیه — داده‌ها بعداً پُر می‌شوند)
-- مشخصات فنی استاندارد مرجع (مستقل از آگهی‌ها)

BEGIN;

-- Registry Attributes (تعریف مشخصات استاندارد: Engine, Horsepower, FuelType, ...)
CREATE TABLE IF NOT EXISTS registry_attributes (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  name_en       TEXT,
  slug          TEXT NOT NULL UNIQUE,
  data_type     TEXT NOT NULL CHECK (data_type IN ('STRING','INTEGER','FLOAT','BOOLEAN','ENUM','MULTI_ENUM')),
  applies_to    TEXT[] DEFAULT '{}',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_attr_slug ON registry_attributes(slug);

-- Registry Options (مقادیر معتبر برای ENUM)
CREATE TABLE IF NOT EXISTS registry_options (
  id                BIGSERIAL PRIMARY KEY,
  registry_attribute_id BIGINT NOT NULL REFERENCES registry_attributes(id) ON DELETE CASCADE,
  value             TEXT NOT NULL,
  label             TEXT NOT NULL,
  label_en          TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  UNIQUE(registry_attribute_id, value)
);

-- Registry Values (مقادیر واقعی برای هر مدل/واریانت)
CREATE TABLE IF NOT EXISTS registry_values (
  id                BIGSERIAL PRIMARY KEY,
  model_id          BIGINT REFERENCES vehicle_models(id) ON DELETE CASCADE,
  variant_id        BIGINT REFERENCES vehicle_variants(id) ON DELETE CASCADE,
  registry_attribute_id BIGINT NOT NULL REFERENCES registry_attributes(id) ON DELETE CASCADE,
  registry_option_id    BIGINT REFERENCES registry_options(id) ON DELETE SET NULL,
  value_text        TEXT,
  value_int         BIGINT,
  value_float       DOUBLE PRECISION,
  value_bool        BOOLEAN,
  source            TEXT DEFAULT 'manual',  -- manual, import, api, scraper
  verified          BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT registry_ref_check CHECK (
    (model_id IS NOT NULL AND variant_id IS NULL) OR
    (model_id IS NULL AND variant_id IS NOT NULL) OR
    (model_id IS NOT NULL AND variant_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_reg_vals_model ON registry_values(model_id);
CREATE INDEX IF NOT EXISTS idx_reg_vals_variant ON registry_values(variant_id);
CREATE INDEX IF NOT EXISTS idx_reg_vals_attr ON registry_values(registry_attribute_id);

COMMIT;
