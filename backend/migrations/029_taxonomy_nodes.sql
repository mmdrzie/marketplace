-- 029_taxonomy_nodes.sql
-- Phase 1: Taxonomy Nodes (مرکزی) + Feature Flags + Soft Delete تکمیلی

BEGIN;

-- Taxonomy Nodes: سرویس مرکزی برای همه slugها
CREATE TYPE node_type AS ENUM ('category', 'brand', 'model', 'variant');
CREATE TYPE visibility_level AS ENUM ('PUBLIC', 'PRIVATE', 'HIDDEN', 'ARCHIVED');

CREATE TABLE IF NOT EXISTS taxonomy_nodes (
  id              BIGSERIAL PRIMARY KEY,
  node_type       node_type NOT NULL,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  name_en         TEXT,
  parent_id       BIGINT REFERENCES taxonomy_nodes(id) ON DELETE SET NULL,
  path            TEXT,                     -- materialized path: /vehicles/cars/peugeot/206
  depth           INTEGER NOT NULL DEFAULT 0,
  ref_id          BIGINT,                   -- reference to the actual entity (brand_id/model_id/etc)
  is_active       BOOLEAN NOT NULL DEFAULT true,
  visibility      visibility_level NOT NULL DEFAULT 'PUBLIC',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  icon            TEXT,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(node_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_tax_nodes_type ON taxonomy_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_tax_nodes_parent ON taxonomy_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_tax_nodes_path ON taxonomy_nodes(path);
CREATE INDEX IF NOT EXISTS idx_tax_nodes_ref ON taxonomy_nodes(node_type, ref_id);
CREATE INDEX IF NOT EXISTS idx_tax_nodes_active ON taxonomy_nodes(is_active, visibility);

-- Feature Flags (دو سطح: system + entity)
CREATE TABLE IF NOT EXISTS feature_flags (
  id              BIGSERIAL PRIMARY KEY,
  flag_type       TEXT NOT NULL CHECK (flag_type IN ('system', 'entity')),
  entity_type     TEXT,                    -- 'model', 'variant', 'category', 'brand' (برای entity)
  entity_id       BIGINT,                  -- ref to the entity
  key             TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT false,
  conditions      JSONB,                   -- optional conditions (e.g. {"min_subscription":"premium"})
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(flag_type, entity_type, entity_id, key)
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_entity ON feature_flags(flag_type, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);

-- Soft Delete: columns تکمیلی برای جداول اصلی
ALTER TABLE brands ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE vehicle_models ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE vehicle_variants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE vehicle_variants ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Indexes برای soft delete
CREATE INDEX IF NOT EXISTS idx_brands_deleted ON brands(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_models_deleted ON vehicle_models(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_vehicle_variants_deleted ON vehicle_variants(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_deleted ON categories(deleted_at) WHERE deleted_at IS NULL;

COMMIT;
