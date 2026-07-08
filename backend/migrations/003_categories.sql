-- 003_categories.sql
-- Categories, Attributes (EAV), Provinces & Cities

BEGIN;

-- Categories: self-referencing tree
CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  name_en     TEXT,
  slug        TEXT NOT NULL UNIQUE,
  icon        TEXT,
  parent_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Attributes: EAV schema per category
CREATE TABLE IF NOT EXISTS attributes (
  id             BIGSERIAL PRIMARY KEY,
  category_id    BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  label          TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('text','number','select','multi_select','boolean','range','color')),
  options        JSONB,
  unit           TEXT,
  is_required    BOOLEAN NOT NULL DEFAULT false,
  is_filterable  BOOLEAN NOT NULL DEFAULT false,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attributes_category_id ON attributes(category_id);

-- Provinces
CREATE TABLE IF NOT EXISTS provinces (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provinces_slug ON provinces(slug);

-- Cities
CREATE TABLE IF NOT EXISTS cities (
  id          BIGSERIAL PRIMARY KEY,
  province_id BIGINT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cities_province_id ON cities(province_id);

COMMIT;
