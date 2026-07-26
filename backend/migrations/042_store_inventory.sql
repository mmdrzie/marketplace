-- 042_store_inventory.sql
-- Store inventory: each store (user with role=store) can manage their parts

BEGIN;

CREATE TABLE IF NOT EXISTS store_inventory (
  id              BIGSERIAL PRIMARY KEY,
  store_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  part_id         BIGINT NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
  price           BIGINT NOT NULL DEFAULT 0,
  stock_count     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  notes           TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(store_id, part_id)
);

CREATE INDEX IF NOT EXISTS idx_store_inventory_store ON store_inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_status ON store_inventory(status);

COMMIT;
