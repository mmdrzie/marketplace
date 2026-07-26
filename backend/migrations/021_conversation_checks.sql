-- 021_conversation_checks.sql
-- A conversation must not have the same user as buyer and seller.

BEGIN;

ALTER TABLE conversations
  ADD CONSTRAINT IF NOT EXISTS chk_conversation_buyer_ne_seller
  CHECK (buyer_id <> seller_id);

COMMIT;
