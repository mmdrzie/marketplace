-- 007_features.sql
-- Articles & Tenders

BEGIN;

-- Articles
CREATE TABLE IF NOT EXISTS articles (
  id            BIGSERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  excerpt       TEXT NOT NULL DEFAULT '',
  body          TEXT NOT NULL DEFAULT '',
  cover_image   TEXT,
  category      TEXT,
  author        TEXT NOT NULL DEFAULT '',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  views         INTEGER NOT NULL DEFAULT 0,
  reading_time  INTEGER NOT NULL DEFAULT 1,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at) WHERE published_at IS NOT NULL;

-- Tenders
CREATE TABLE IF NOT EXISTS tenders (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT NOT NULL DEFAULT '',
  category        TEXT,
  province_id     BIGINT REFERENCES provinces(id) ON DELETE SET NULL,
  city_id         BIGINT REFERENCES cities(id) ON DELETE SET NULL,
  budget          BIGINT NOT NULL DEFAULT 0,
  deadline        TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  views           INTEGER NOT NULL DEFAULT 0,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenders_slug ON tenders(slug);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);

-- Tender Bids
CREATE TABLE IF NOT EXISTS tender_bids (
  id            BIGSERIAL PRIMARY KEY,
  tender_id     BIGINT NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        BIGINT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tender_bids_tender ON tender_bids(tender_id);

COMMIT;
