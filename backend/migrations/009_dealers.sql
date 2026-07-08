-- 009_dealers.sql
-- Dealer Profiles & Reviews

BEGIN;

CREATE TABLE IF NOT EXISTS dealer_profiles (
  user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name           TEXT NOT NULL DEFAULT '',
  logo                    TEXT,
  address                 TEXT,
  description             TEXT,
  dealer_code             TEXT UNIQUE,
  subscription_plan       TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  listings_limit          INTEGER NOT NULL DEFAULT 5,
  is_verified             BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dealer_reviews (
  id          BIGSERIAL PRIMARY KEY,
  dealer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dealer_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_dealer_reviews_dealer ON dealer_reviews(dealer_id);

COMMIT;
