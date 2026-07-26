-- 033_alter_conversations.sql
-- Conversation Aggregate: add status, last_message_id, timestamps, soft delete

BEGIN;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS status          TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_message_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at      TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conversations_status   ON conversations(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_deleted  ON conversations(deleted_at) WHERE deleted_at IS NULL;

COMMIT;
