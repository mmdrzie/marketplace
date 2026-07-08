-- 010_notifications.sql
-- Notifications + App Settings

BEGIN;

CREATE TABLE IF NOT EXISTS app_settings (
  id                      BIGSERIAL PRIMARY KEY,
  maintenance_mode        BOOLEAN NOT NULL DEFAULT false,
  max_listings_per_user   INTEGER NOT NULL DEFAULT 50,
  default_listings_limit  INTEGER NOT NULL DEFAULT 5,
  featured_price          BIGINT NOT NULL DEFAULT 50000,
  subscription_price      BIGINT NOT NULL DEFAULT 200000,
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (maintenance_mode, max_listings_per_user, default_listings_limit, featured_price, subscription_price)
VALUES (false, 50, 5, 50000, 200000)
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  data        JSONB NOT NULL DEFAULT '{}',
  action_url  TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

COMMIT;
