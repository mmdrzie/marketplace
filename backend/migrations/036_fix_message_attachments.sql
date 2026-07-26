-- 036_fix_message_attachments.sql
-- Rename columns to match domain conventions; add missing indexes

BEGIN;

ALTER TABLE message_attachments RENAME COLUMN storage_path TO file_url;
ALTER TABLE message_attachments RENAME COLUMN mime_type TO file_type;
ALTER TABLE message_attachments RENAME COLUMN size TO file_size;

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_delivery_status ON messages(delivery_status);

COMMIT;
