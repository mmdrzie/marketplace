-- 049_catalog_domain.sql
-- Generic Catalog Domain: part_types, catalog_types, catalog_categories,
-- part_specs (JSONB per catalog) + parts/part_suggestions extension
-- Design locked in docs/catalog-tuning-plan.md (v8) — see ADR-011.

BEGIN;

-- ============================================================
-- 1. LOOKUP: part_types (slug immutable, soft-disable via is_active)
-- ============================================================
CREATE TABLE IF NOT EXISTS part_types (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label       TEXT NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INT NOT NULL DEFAULT 1000,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO part_types (slug, label, icon, color, sort_order) VALUES
  ('oem',          'اصلی',       'shield-check',  '#3B82F6', 1000),
  ('aftermarket',  'تأمینی',      'package',       '#10B981', 2000),
  ('performance',  'تیونینگ',     'zap',           '#F59E0B', 3000),
  ('racing',       'مسابقه‌ای',    'flag',          '#EF4444', 4000),
  ('universal',    'یونیورسال',   'globe',         '#8B5CF6', 5000)
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label, icon = EXCLUDED.icon,
  color = EXCLUDED.color, sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 2. LOOKUP: catalog_types (fixed config — no admin CRUD)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalog_types (
  id               BIGSERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label            TEXT NOT NULL,
  icon             TEXT,
  color            TEXT,
  sort_order       INT NOT NULL DEFAULT 1000,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_public        BOOLEAN NOT NULL DEFAULT false,
  settings         JSONB NOT NULL DEFAULT '{"hero":{},"theme":{},"filters":{},"landing":{}}',
  settings_version INT NOT NULL DEFAULT 1
);

INSERT INTO catalog_types (slug, label, icon, color, sort_order, is_public) VALUES
  ('tuning',     'قطعات تیونینگ',  'zap',          '#F59E0B', 1000, true),
  ('audio',      'سیستم صوتی',     'speaker',      '#8B5CF6', 2000, false),
  ('lighting',   'نورپردازی',      'lightbulb',    '#06B6D4', 3000, false),
  ('camping',    'کمپینگ',         'tent',         '#10B981', 4000, false),
  ('detailing',  'دیتیلینگ',       'sparkles',     '#EC4899', 5000, false),
  ('accessory',  'لوازم جانبی',    'shopping-bag', '#F97316', 6000, false)
ON CONFLICT (slug) DO UPDATE SET
  label = EXCLUDED.label, icon = EXCLUDED.icon, color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order, is_public = EXCLUDED.is_public;

-- ============================================================
-- 3. catalog_categories — 3-level hierarchy (vehicle → group → part type)
--    path/depth are ALWAYS derived by triggers (single source of truth)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalog_categories (
  id               BIGSERIAL PRIMARY KEY,
  catalog_type_id  BIGINT NOT NULL REFERENCES catalog_types(id) ON DELETE RESTRICT,
  parent_id        BIGINT REFERENCES catalog_categories(id) ON DELETE RESTRICT,
  slug             TEXT NOT NULL CHECK (slug = LOWER(slug) AND slug ~ '^[a-z0-9-]+$'),
  title            TEXT NOT NULL,
  title_en         TEXT,
  description      TEXT,
  description_en   TEXT,
  icon             TEXT,
  path             TEXT NOT NULL,          -- 'tuning/car/engine-dressing' (trigger)
  depth            INT NOT NULL DEFAULT 0, -- 0 = root (vehicle type)
  sort_order       INT NOT NULL DEFAULT 1000,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ            -- soft delete
);

-- BEFORE INSERT/UPDATE: derive path + depth from the parent chain
CREATE OR REPLACE FUNCTION fn_catalog_cat_derive() RETURNS TRIGGER AS $$
DECLARE
  cat_slug TEXT;
  parent_path TEXT;
  parent_depth INT;
BEGIN
  SELECT ct.slug INTO cat_slug FROM catalog_types ct WHERE ct.id = NEW.catalog_type_id;
  IF cat_slug IS NULL THEN
    RAISE EXCEPTION 'catalog_type_id % does not exist', NEW.catalog_type_id;
  END IF;

  IF NEW.parent_id IS NULL THEN
    NEW.path := cat_slug || '/' || NEW.slug;
    NEW.depth := 0;
  ELSE
    SELECT cc.path, cc.depth INTO parent_path, parent_depth
    FROM catalog_categories cc WHERE cc.id = NEW.parent_id;
    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'parent category % does not exist', NEW.parent_id;
    END IF;
    NEW.path := parent_path || '/' || NEW.slug;
    NEW.depth := parent_depth + 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_catalog_cat_derive
  BEFORE INSERT OR UPDATE OF slug, parent_id, catalog_type_id ON catalog_categories
  FOR EACH ROW EXECUTE FUNCTION fn_catalog_cat_derive();

-- AFTER UPDATE: cascade path/depth fixes to the whole subtree
CREATE OR REPLACE FUNCTION fn_catalog_cat_derive_descendants() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.path IS DISTINCT FROM OLD.path THEN
    UPDATE catalog_categories cc SET
      path  = NEW.path || substr(cc.path, length(OLD.path) + 1),
      depth = NEW.depth + (cc.depth - OLD.depth),
      updated_at = NOW()
    WHERE cc.path LIKE OLD.path || '/%';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_catalog_cat_derive_descendants
  AFTER UPDATE OF slug, parent_id, catalog_type_id ON catalog_categories
  FOR EACH ROW EXECUTE FUNCTION fn_catalog_cat_derive_descendants();

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_cat_path ON catalog_categories(path);
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_cat_root
  ON catalog_categories(catalog_type_id, slug) WHERE parent_id IS NULL AND deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_catalog_cat_child
  ON catalog_categories(parent_id, slug) WHERE parent_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_catalog_cat_type_parent_order
  ON catalog_categories(catalog_type_id, parent_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_catalog_cat_parent ON catalog_categories(parent_id);

CREATE EXTENSION IF NOT EXISTS pg_trgm; -- bootstrap in 005; kept here for safety
CREATE INDEX IF NOT EXISTS idx_catalog_cat_path_trgm
  ON catalog_categories USING GIN (path gin_trgm_ops);

-- ============================================================
-- 4. EXPAND: parts (single aggregate for all catalogs)
-- ============================================================
ALTER TABLE parts ADD COLUMN IF NOT EXISTS part_type_id BIGINT REFERENCES part_types(id) ON DELETE RESTRICT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS catalog_category_id BIGINT REFERENCES catalog_categories(id) ON DELETE RESTRICT;

UPDATE parts SET part_type_id = (SELECT id FROM part_types WHERE slug = 'aftermarket')
WHERE part_type_id IS NULL;

ALTER TABLE parts ALTER COLUMN part_type_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_parts_catalog_category ON parts(catalog_category_id);
CREATE INDEX IF NOT EXISTS idx_parts_part_type ON parts(part_type_id);

-- ============================================================
-- 5. part_specs — generic per-catalog JSONB specs (one table for all catalogs)
-- ============================================================
CREATE TABLE IF NOT EXISTS part_specs (
  id               BIGSERIAL PRIMARY KEY,
  part_id          BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  catalog_type_id  BIGINT NOT NULL REFERENCES catalog_types(id) ON DELETE RESTRICT,
  specs            JSONB NOT NULL DEFAULT '{"schema_version":1}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (part_id, catalog_type_id)
);

CREATE INDEX IF NOT EXISTS idx_part_specs_catalog ON part_specs(catalog_type_id);
CREATE INDEX IF NOT EXISTS idx_part_specs_part ON part_specs(part_id);

-- ============================================================
-- 6. EXPAND: part_suggestions (store owners can suggest catalog parts)
-- ============================================================
ALTER TABLE part_suggestions ADD COLUMN IF NOT EXISTS part_type_id BIGINT REFERENCES part_types(id) ON DELETE RESTRICT;
ALTER TABLE part_suggestions ADD COLUMN IF NOT EXISTS catalog_category_id BIGINT REFERENCES catalog_categories(id) ON DELETE RESTRICT;

UPDATE part_suggestions SET part_type_id = (SELECT id FROM part_types WHERE slug = 'aftermarket')
WHERE part_type_id IS NULL;

ALTER TABLE part_suggestions ALTER COLUMN part_type_id SET NOT NULL;

COMMIT;
