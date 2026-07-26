-- 017_listing_stats.sql
-- Daily listing view tracking + conversations count helper

BEGIN;

CREATE TABLE IF NOT EXISTS listing_views_daily (
  id          BIGSERIAL PRIMARY KEY,
  listing_id  BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  views       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, date)
);

CREATE INDEX IF NOT EXISTS idx_listing_views_daily_listing ON listing_views_daily(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_daily_date ON listing_views_daily(date);

-- Row Level Security policies use Supabase-specific `auth.uid()` and the
-- `service_role` role. On raw PostgreSQL these do not exist, so we only
-- enable RLS and create the policies when the `auth` schema is present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
  ) THEN
    ALTER TABLE listing_views_daily ENABLE ROW LEVEL SECURITY;

    -- Only the listing owner (or admin) can read view stats
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'listing_views_daily'
        AND policyname = 'listing_views_owner_select'
    ) THEN
      CREATE POLICY listing_views_owner_select ON listing_views_daily
        FOR SELECT
        USING (
          listing_id IN (
            SELECT id FROM listings WHERE user_id = auth.uid()
          )
        );
    END IF;

    -- The trigger function runs with security definer, so no direct insert
    -- policy needed for the trigger. Allow service_role full access.
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'listing_views_daily'
        AND policyname = 'listing_views_service_all'
    ) THEN
      CREATE POLICY listing_views_service_all ON listing_views_daily
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION track_listing_view()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO listing_views_daily (listing_id, date, views)
  VALUES (NEW.id, CURRENT_DATE, 1)
  ON CONFLICT (listing_id, date)
  DO UPDATE SET views = listing_views_daily.views + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_listing_view ON listings;
CREATE TRIGGER trg_listing_view
  AFTER UPDATE OF views ON listings
  FOR EACH ROW
  WHEN (NEW.views > OLD.views)
  EXECUTE FUNCTION track_listing_view();

COMMIT;
