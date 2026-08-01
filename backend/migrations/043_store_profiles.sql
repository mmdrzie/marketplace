-- 043_store_profiles.sql
-- Store registration with document upload + admin approval

BEGIN;

CREATE TABLE IF NOT EXISTS store_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  store_name    TEXT NOT NULL DEFAULT '',
  store_slug    TEXT NOT NULL UNIQUE,
  description   TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  logo          TEXT DEFAULT '',
  cover_image   TEXT DEFAULT '',
  documents     TEXT[] DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  admin_note    TEXT DEFAULT '',
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_store_profiles_status ON store_profiles(status);

COMMIT;
