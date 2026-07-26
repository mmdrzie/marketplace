-- 037b_messages_add_version.sql
-- Add optimistic concurrency, timestamps, and offer reference to messages

BEGIN;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS version      BIGINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS offer_id     BIGINT;

CREATE INDEX IF NOT EXISTS idx_messages_updated ON messages(updated_at) WHERE deleted_at IS NULL;

COMMIT;
