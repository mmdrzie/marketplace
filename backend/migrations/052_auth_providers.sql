-- 052: Provider-based Authentication
-- oauth_accounts + one_time_tokens + oauth_login_logs + users.has_password
-- See ADR-012 (docs/adr/ADR-012-auth-providers.md)

CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL
    CHECK (provider IN ('google', 'apple', 'github', 'microsoft')),
  provider_account_id VARCHAR(255) NOT NULL,
  provider_user_name VARCHAR(255),
  provider_avatar VARCHAR(500),
  -- Snapshot of the provider email ONLY. Source of truth is users.email.
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Updated only on successful login, not on link.
  last_login_at TIMESTAMPTZ,
  -- Soft delete for "disconnect account"; re-link restores the row.
  deleted_at TIMESTAMPTZ,
  UNIQUE (provider, provider_account_id),
  UNIQUE (user_id, provider)
);

CREATE INDEX idx_oauth_accounts_user ON oauth_accounts(user_id);

CREATE TABLE one_time_tokens (
  jti UUID PRIMARY KEY,
  -- oauth_state | oauth_result | oauth_verify | oauth_link
  type VARCHAR(30) NOT NULL,
  subject UUID,
  -- redirect, provider, nonce, code_verifier, ...
  metadata JSONB NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ott_expiry ON one_time_tokens(expires_at);

CREATE TABLE oauth_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  provider VARCHAR(20),
  ip VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  failure_reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Standard migration pattern: ADD with default, backfill, then drop the default
-- so the application must set the value explicitly.
ALTER TABLE users ADD COLUMN has_password BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ALTER COLUMN has_password DROP DEFAULT;
