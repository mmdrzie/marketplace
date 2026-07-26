-- 028_listing_links.sql
-- Phase 1: Listing → VehicleVariant link + Media table
-- ALTER existing listings, CREATE new media table

BEGIN;

-- vehicle_variant_id به listings اضافه می‌شه (NOT NULL در آینده، فعلاً برای Backward Compat)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS vehicle_variant_id BIGINT REFERENCES vehicle_variants(id) ON DELETE SET NULL;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_listings_vehicle_variant ON listings(vehicle_variant_id);
CREATE INDEX IF NOT EXISTS idx_listings_public_id ON listings(public_id);
CREATE INDEX IF NOT EXISTS idx_listings_deleted_by ON listings(deleted_by);

-- Media table (جدید: جایگزین listing_images تدریجی)
CREATE TYPE media_type AS ENUM ('IMAGE','VIDEO','DOCUMENT','360','AUDIO','PDF');

CREATE TABLE IF NOT EXISTS media (
  id              BIGSERIAL PRIMARY KEY,
  entity_type     TEXT NOT NULL DEFAULT 'listing',  -- 'listing', 'dealer', 'brand', 'user'
  entity_id       BIGINT NOT NULL,
  type            media_type NOT NULL DEFAULT 'IMAGE',
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  medium_url      TEXT,
  width           INTEGER,
  height          INTEGER,
  size            BIGINT,
  mime_type       TEXT,
  duration        INTEGER,       -- seconds (for VIDEO/AUDIO/360)
  checksum        TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  meta            JSONB,         -- EXIF, GPS, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);

-- listing_images به media وصل کردن (optional: برای backward compat view)
-- listing_images همچنان کار می‌کنه، media تدریجی جایگزینش می‌شه

-- public_id for dealers and users (اختیاری)
ALTER TABLE dealer_profiles ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_dealers_public_id ON dealer_profiles(public_id);
CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id) WHERE deleted_at IS NULL;

COMMIT;
