-- 053_business_roles.sql
-- Business role self-registration (ADR-013 / auth-redesign-plan v7):
--   - dealer_profiles.status: new dealer/agency signups start as 'pending'
--     until admin approval (legacy rows stay 'approved' via DEFAULT).
--   - refresh_tokens activity tracking (last_used_at / last_ip / last_user_agent)
--     powers GET /stats/public counters.activeUsers («کاربران آنلاین» proxy).

BEGIN;

ALTER TABLE dealer_profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending', 'approved', 'rejected', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_dealer_profiles_status ON dealer_profiles(status);

ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS last_ip TEXT;
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS last_user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_last_used
  ON refresh_tokens(last_used_at)
  WHERE last_used_at IS NOT NULL;

COMMIT;
