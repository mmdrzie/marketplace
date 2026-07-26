-- 025_taxonomy.sql
-- Phase 1: Taxonomy entities (Brand, VehicleModel, VehicleVariant)
-- مستقل از categories: برند و مدل و واریانت موجودیت‌های جداگانه

BEGIN;

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  name_en     TEXT,
  slug        TEXT NOT NULL UNIQUE,
  logo        TEXT,
  country     TEXT,
  founded_year INTEGER,
  website     TEXT,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);

-- Vehicle Models
CREATE TABLE IF NOT EXISTS vehicle_models (
  id            BIGSERIAL PRIMARY KEY,
  brand_id      BIGINT NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  name_en       TEXT,
  slug          TEXT NOT NULL UNIQUE,
  segment       TEXT,
  generation    TEXT,
  body_type     TEXT,
  year_from     INTEGER,
  year_to       INTEGER,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_id ON vehicle_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_slug ON vehicle_models(slug);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_is_active ON vehicle_models(is_active);

-- Vehicle Variants (تیپ/نسخه)
CREATE TABLE IF NOT EXISTS vehicle_variants (
  id            BIGSERIAL PRIMARY KEY,
  model_id      BIGINT NOT NULL REFERENCES vehicle_models(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  name_en       TEXT,
  slug          TEXT NOT NULL UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(model_id, name)
);

CREATE INDEX IF NOT EXISTS idx_vehicle_variants_model_id ON vehicle_variants(model_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_variants_slug ON vehicle_variants(slug);
CREATE INDEX IF NOT EXISTS idx_vehicle_variants_is_active ON vehicle_variants(is_active);

-- Vehicle Variant Attributes (EAV برای مشخصات مرجع واریانت)
CREATE TABLE IF NOT EXISTS vehicle_variant_attributes (
  id            BIGSERIAL PRIMARY KEY,
  variant_id    BIGINT NOT NULL REFERENCES vehicle_variants(id) ON DELETE CASCADE,
  attribute_id  BIGINT NOT NULL REFERENCES attributes(id) ON DELETE RESTRICT,
  value         TEXT NOT NULL DEFAULT '',
  UNIQUE(variant_id, attribute_id)
);

CREATE INDEX IF NOT EXISTS idx_variant_attrs_variant ON vehicle_variant_attributes(variant_id);

COMMIT;
