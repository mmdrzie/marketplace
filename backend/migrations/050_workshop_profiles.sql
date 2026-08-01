-- 050_workshop_profiles.sql
-- Workshop (mechanic / tuner) profiles: self-registration with documents
-- + admin approval. Mirrors store_profiles pattern with workshop-specific
-- fields (type, specialty, city, services, hours).

BEGIN;

CREATE TABLE IF NOT EXISTS workshop_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  workshop_name TEXT NOT NULL DEFAULT '',
  workshop_slug TEXT NOT NULL UNIQUE,
  type          TEXT NOT NULL DEFAULT 'mechanic'
                CHECK (type IN ('mechanic', 'tuner', 'both')),
  specialty     TEXT DEFAULT '',
  city          TEXT DEFAULT '',
  address       TEXT DEFAULT '',
  phone         TEXT DEFAULT '',
  hours         TEXT DEFAULT '',
  services      TEXT[] DEFAULT '{}',
  description   TEXT DEFAULT '',
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

CREATE INDEX IF NOT EXISTS idx_workshop_profiles_status ON workshop_profiles(status);
CREATE INDEX IF NOT EXISTS idx_workshop_profiles_city ON workshop_profiles(city);
CREATE INDEX IF NOT EXISTS idx_workshop_profiles_type ON workshop_profiles(type);

COMMIT;
