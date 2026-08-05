import type { User } from '../entities/user/User.entity.js';

/**
 * Normalized identity produced by every auth provider.
 * The AuthService core depends only on this shape — never on a specific provider.
 */
export interface AuthIdentity {
  provider: string;
  providerAccountId: string;
  email?: string;
  emailVerified: boolean;
  displayName?: string;
  avatarUrl?: string;
  phone?: string | null;
}

/**
 * Outcome of a provider authentication attempt.
 * - session: identity proven → AuthService issues a session.
 * - pending_verification: identity proven but email not verified → OTP flow.
 * - link_required: email matches an existing user with a password → re-auth first.
 */
export type AuthenticateResult =
  | { kind: 'session'; user: User }
  | { kind: 'pending_verification'; user: User; pendingJti: string }
  | { kind: 'link_required'; user: User; linkJti: string };

export interface IssueSessionOptions {
  singleSession?: boolean;
  ip?: string | null;
  userAgent?: string | null;
}

/** Safe, serializable user projection (never contains passwordHash). */
export interface SanitizedUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  city: string | null;
  role: User['role'];
  emailVerified: boolean;
  phoneVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  user: SanitizedUser;
}

/** Implemented by AuthService; providers call it to mint sessions. */
export interface SessionIssuer {
  issueSession(user: User, opts?: IssueSessionOptions): Promise<AuthSession>;
}

/** The full core surface providers may depend on (AuthService). */
export interface AuthCore extends SessionIssuer {
  createUserFromIdentity(
    identity: AuthIdentity,
    opts?: { role?: User['role']; phone?: string | null },
  ): Promise<User>;
}

/**
 * Contract for authentication providers (password, google, future apple/github/microsoft).
 * Each provider is responsible ONLY for authenticating its users; shared logic
 * (user creation, linking rules, sessions, gates) lives in AuthService.
 */
export interface AuthProvider {
  readonly name: string;

  /**
   * Prove a user's identity with provider-specific credentials and return a
   * normalized result. For OAuth providers this validates the authorization
   * code/state; for the password provider this is email+password login.
   */
  authenticate?(input: unknown): Promise<AuthenticateResult>;

  /** Create/link the provider identity row for an existing user (e.g. after password re-auth). */
  link?(userId: string, input: unknown): Promise<AuthIdentity>;

  /** Remove the provider identity (soft delete) when the user disconnects. */
  unlink?(userId: string, input?: unknown): Promise<void>;

  /** Refresh the identity snapshot (name/avatar) from the provider. */
  refreshIdentity?(identity: AuthIdentity): Promise<AuthIdentity>;

  /** Build the provider authorization URL (OAuth flows). */
  authorize?(input?: unknown): Promise<{ url: string; tokenJti: string }>;
}
