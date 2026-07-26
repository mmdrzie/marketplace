-- 023_app_settings_unique.sql
-- Enforce a single app_settings row via a constant-expression unique index.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS app_settings_singleton_key ON app_settings ((true));

COMMIT;
