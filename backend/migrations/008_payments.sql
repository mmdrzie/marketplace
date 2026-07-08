-- 008_payments.sql
-- Payments & Wallet Transactions

BEGIN;

CREATE TABLE IF NOT EXISTS payments (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        BIGINT NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'IRR',
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider      TEXT NOT NULL DEFAULT 'noop',
  provider_id   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'featured', 'subscription')),
  amount          BIGINT NOT NULL,
  balance_before  BIGINT NOT NULL DEFAULT 0,
  balance_after   BIGINT NOT NULL DEFAULT 0,
  reference_type  TEXT,
  reference_id    BIGINT,
  description     TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id);

COMMIT;
