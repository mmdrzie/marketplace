BEGIN;

CREATE TABLE IF NOT EXISTS parts (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  part_number     TEXT NOT NULL DEFAULT '',
  category        TEXT NOT NULL DEFAULT '',
  category_label  TEXT NOT NULL DEFAULT '',
  price           BIGINT NOT NULL DEFAULT 0,
  image           TEXT NOT NULL DEFAULT '',
  compatibility   TEXT NOT NULL DEFAULT '',
  description     TEXT NOT NULL DEFAULT '',
  in_stock        BOOLEAN NOT NULL DEFAULT true,
  manufacturer    TEXT NOT NULL DEFAULT '',
  warranty        TEXT NOT NULL DEFAULT '',
  category_slug   TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_slug);
CREATE INDEX IF NOT EXISTS idx_parts_search ON parts USING gin(to_tsvector('simple', name || ' ' || description));

COMMIT;
