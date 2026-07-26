-- 038_create_conversation_projections.sql
-- Denormalized read-model for conversation list queries

BEGIN;

CREATE TABLE IF NOT EXISTS conversation_projections (
  id                   BIGINT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
  listing_id           BIGINT NOT NULL,
  listing_snapshot     JSONB NOT NULL,
  buyer_id             UUID NOT NULL,
  buyer_name           TEXT NOT NULL,
  buyer_avatar         TEXT,
  seller_id            UUID NOT NULL,
  seller_name          TEXT NOT NULL,
  seller_avatar        TEXT,
  seller_role          TEXT,
  last_message_id      BIGINT,
  last_message         TEXT,
  last_message_type    TEXT,
  last_sender_id       UUID,
  last_activity        TIMESTAMPTZ,
  lifecycle            TEXT NOT NULL DEFAULT 'active',
  projection_version   BIGINT NOT NULL DEFAULT 1,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cp_buyer ON conversation_projections(buyer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cp_seller ON conversation_projections(seller_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cp_lifecycle ON conversation_projections(lifecycle);
CREATE INDEX IF NOT EXISTS idx_cp_listing ON conversation_projections(listing_id);

COMMIT;
