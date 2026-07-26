-- 032_outbox.sql
-- Outbox Pattern: at-least-once event delivery

BEGIN;

CREATE TABLE IF NOT EXISTS outbox_events (
  id              BIGSERIAL PRIMARY KEY,
  aggregate_type  TEXT NOT NULL,          -- 'listing', 'user', 'vehicle', 'payment', etc.
  aggregate_id    TEXT NOT NULL,          -- the aggregate root ID
  event_type      TEXT NOT NULL,          -- 'listing.created', 'user.registered', etc.
  event_type_version INTEGER NOT NULL DEFAULT 1,
  payload         JSONB NOT NULL,
  metadata        JSONB NOT NULL,         -- correlation_id, causation_id, timestamp, etc.
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'published', 'failed', 'dead_letter')),
  retry_count     INTEGER NOT NULL DEFAULT 0,
  max_retries     INTEGER NOT NULL DEFAULT 3,
  last_error      TEXT,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox_events(status, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_event_type ON outbox_events(event_type);

-- Idempotency Keys
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key       TEXT PRIMARY KEY,
  response  JSONB,
  processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
