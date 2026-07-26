-- 034_alter_messages.sql
-- Message Entity: add type, delivery_status, soft delete

BEGIN;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS type             TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS delivery_status  TEXT NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS deleted_at       TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_messages_type      ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_deleted   ON messages(deleted_at) WHERE deleted_at IS NULL;

COMMIT;
