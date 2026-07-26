-- 037a_conversations_add_version.sql
-- Add optimistic concurrency, lifecycle state, and listing snapshot to conversations

BEGIN;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS version           BIGINT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS lifecycle         TEXT NOT NULL DEFAULT 'active'
                    CHECK (lifecycle IN ('created', 'active', 'locked', 'deleted')),
  ADD COLUMN IF NOT EXISTS listing_snapshot  JSONB;

CREATE INDEX IF NOT EXISTS idx_conversations_lifecycle ON conversations(lifecycle);

COMMIT;
