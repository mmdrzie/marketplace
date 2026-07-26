-- 031_projections.sql
-- Phase 1: Projection tables for Read Models
-- جداول غیرنرمال‌شده برای صفحات عمومی (فقط خواندنی)

BEGIN;

-- Listing Projection
CREATE TABLE IF NOT EXISTS listing_projection (
  id                BIGINT PRIMARY KEY,
  slug              TEXT NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  price             BIGINT NOT NULL DEFAULT 0,
  price_type        TEXT NOT NULL DEFAULT 'fixed',
  status            TEXT NOT NULL DEFAULT 'published',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  views             INTEGER NOT NULL DEFAULT 0,
  primary_image     TEXT,
  category_id       BIGINT,
  category_name     TEXT,
  province_id       BIGINT,
  province_name     TEXT,
  city_id           BIGINT,
  city_name         TEXT,
  user_id           TEXT NOT NULL,
  user_name         TEXT,
  user_phone        TEXT,
  dealer_name       TEXT,
  dealer_phone      TEXT,
  vehicle_variant_id BIGINT,
  brand_name        TEXT,
  model_name        TEXT,
  variant_name      TEXT,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lp_status ON listing_projection(status);
CREATE INDEX IF NOT EXISTS idx_lp_slug ON listing_projection(slug);
CREATE INDEX IF NOT EXISTS idx_lp_category ON listing_projection(category_id);
CREATE INDEX IF NOT EXISTS idx_lp_province ON listing_projection(province_id);
CREATE INDEX IF NOT EXISTS idx_lp_published ON listing_projection(published_at DESC);

-- Vehicle Projection
CREATE TABLE IF NOT EXISTS vehicle_projection (
  brand_id      BIGINT NOT NULL,
  brand_name    TEXT NOT NULL,
  brand_name_en TEXT,
  brand_slug    TEXT NOT NULL,
  brand_logo    TEXT,
  model_id      BIGINT NOT NULL,
  model_name    TEXT NOT NULL,
  model_slug    TEXT NOT NULL,
  model_year_from INTEGER,
  model_year_to   INTEGER,
  variant_id    BIGINT,
  variant_name  TEXT,
  variant_slug  TEXT,
  UNIQUE(brand_id, model_id, COALESCE(variant_id, 0))
);

CREATE INDEX IF NOT EXISTS idx_vp_brand_slug ON vehicle_projection(brand_slug);
CREATE INDEX IF NOT EXISTS idx_vp_model_slug ON vehicle_projection(model_slug);

-- Dealer Projection
CREATE TABLE IF NOT EXISTS dealer_projection (
  id            BIGINT PRIMARY KEY,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  phone         TEXT,
  address       TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  rating        DOUBLE PRECISION NOT NULL DEFAULT 0,
  review_count  INTEGER NOT NULL DEFAULT 0,
  listing_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dp_verified ON dealer_projection(is_verified);
CREATE INDEX IF NOT EXISTS idx_dp_slug ON dealer_projection(slug);

-- Analytics Projection
CREATE TABLE IF NOT EXISTS analytics_projection (
  date              DATE PRIMARY KEY,
  total_listings    BIGINT NOT NULL DEFAULT 0,
  active_listings   BIGINT NOT NULL DEFAULT 0,
  new_listings_today BIGINT NOT NULL DEFAULT 0,
  total_users       BIGINT NOT NULL DEFAULT 0,
  total_dealers     BIGINT NOT NULL DEFAULT 0,
  total_views       BIGINT NOT NULL DEFAULT 0,
  total_conversations BIGINT NOT NULL DEFAULT 0
);

COMMIT;
