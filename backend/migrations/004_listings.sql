-- 004_listings.sql
-- Listings, Listing Attributes (EAV), Listing Images

BEGIN;

CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'published', 'rejected', 'sold', 'archived');
CREATE TYPE price_type AS ENUM ('fixed', 'negotiable', 'auction');

-- Listings
CREATE TABLE IF NOT EXISTS listings (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  province_id     BIGINT REFERENCES provinces(id) ON DELETE SET NULL,
  city_id         BIGINT REFERENCES cities(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL DEFAULT '',
  price           BIGINT NOT NULL DEFAULT 0,
  price_type      price_type NOT NULL DEFAULT 'fixed',
  status          listing_status NOT NULL DEFAULT 'draft',
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  views           INTEGER NOT NULL DEFAULT 0,
  primary_image   TEXT,
  published_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category_id ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_published_at ON listings(published_at);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);
CREATE INDEX IF NOT EXISTS idx_listings_deleted_at ON listings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price) WHERE status = 'published';

-- Listing Attributes (EAV)
CREATE TABLE IF NOT EXISTS listing_attributes (
  id            BIGSERIAL PRIMARY KEY,
  listing_id    BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  attribute_id  BIGINT NOT NULL REFERENCES attributes(id) ON DELETE RESTRICT,
  value         TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_listing_attrs_listing ON listing_attributes(listing_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_attrs_unique ON listing_attributes(listing_id, attribute_id);

-- Listing Images
CREATE TABLE IF NOT EXISTS listing_images (
  id              BIGSERIAL PRIMARY KEY,
  listing_id      BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  medium_url      TEXT,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id  BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports(listing_id);

COMMIT;
