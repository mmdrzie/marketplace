BEGIN;

CREATE TABLE IF NOT EXISTS escrow_deals (
  id            BIGSERIAL PRIMARY KEY,
  listing_id    BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        BIGINT NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'pending_payment',
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON escrow_deals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON escrow_deals(seller_id);

COMMIT;
