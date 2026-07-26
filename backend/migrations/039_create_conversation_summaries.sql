-- 039_create_conversation_summaries.sql
-- Analytics summary per conversation

BEGIN;

CREATE TABLE IF NOT EXISTS conversation_summaries (
  conversation_id      BIGINT PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
  first_message_at     TIMESTAMPTZ,
  last_message_at      TIMESTAMPTZ,
  message_count        BIGINT NOT NULL DEFAULT 0,
  avg_response_time    DOUBLE PRECISION,
  buyer_last_seen      TIMESTAMPTZ,
  seller_last_seen     TIMESTAMPTZ,
  projection_version   BIGINT NOT NULL DEFAULT 1,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
