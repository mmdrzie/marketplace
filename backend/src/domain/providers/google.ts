import crypto from 'node:crypto';
import { createHash } from 'node:crypto';
import { createLocalJWKSet, createRemoteJWKSet, jwtVerify } from 'jose';
import { GOOGLE_EMBEDDED_JWKS } from './google-jwks.js';
import type { User } from '../entities/user/User.entity.js';
import type { UserRepository } from '../entities/user/User.repository.js';
import type { VerificationRepository } from '../entities/verification/Verification.repository.js';
import type { OauthAccountRepository } from '../entities/oauth/OauthAccount.repository.js';
import type { OneTimeTokenRepository } from '../entities/oauth/OneTimeToken.repository.js';
import type { OauthLoginLogRepository } from '../entities/oauth/OauthLoginLog.repository.js';
import { OauthAccount } from '../entities/oauth/OauthAccount.entity.js';
import { AppError } from '../../errors.js';
import { ErrorCode } from '../../shared/index.js';
import { EmailService } from '../../services/email/index.js';
import { config } from '../../config/index.js';
import { PasswordAuthProvider, generateOtpCode, sha256Hex, OTP_TTL_MS } from './password.js';
import type { AuthCore, AuthIdentity, AuthSession, AuthProvider } from './AuthProvider.js';

const STATE_TTL_MS = 10 * 60 * 1000;
const RESULT_TTL_MS = 5 * 60 * 1000;
const VERIFY_TTL_MS = 10 * 60 * 1000;
const LINK_TTL_MS = 10 * 60 * 1000;

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

// Local snapshot first (no network needed; some networks are blocked by Google).
const embeddedJwks = GOOGLE_EMBEDDED_JWKS.keys.length > 0 ? createLocalJWKSet(GOOGLE_EMBEDDED_JWKS) : null;
// Remote fallback (works on hosts with unrestricted access, e.g. Vercel).
const remoteJwks = createRemoteJWKSet(new URL(GOOGLE_CERTS_URL));

async function verifyGoogleIdToken(idToken: string, clientId: string): Promise<GoogleIdTokenClaims> {
  const options = {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  };
  const errors: string[] = [];

  if (embeddedJwks) {
    try {
      const { payload } = await jwtVerify(idToken, embeddedJwks, options);
      return payload as GoogleIdTokenClaims;
    } catch (err) {
      errors.push(`embedded:${err instanceof Error ? err.message : String(err)}`);
    }
  }

  try {
    const { payload } = await jwtVerify(idToken, remoteJwks, options);
    return payload as GoogleIdTokenClaims;
  } catch (err) {
    errors.push(`remote:${err instanceof Error ? err.message : String(err)}`);
  }

  throw new Error(`ID token verification failed (${errors.join(' | ')})`);
}

interface GoogleIdTokenClaims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nonce?: string;
}

export interface GoogleCallbackInput {
  code?: string;
  error?: string;
  stateJti: string;
  ip?: string | null;
  userAgent?: string | null;
}

export interface GoogleFlowInput {
  ip?: string | null;
  userAgent?: string | null;
}

export interface GoogleCallbackResult {
  redirectUrl: string;
}

function sanitizeRedirect(raw?: string | null): string {
  if (!raw) return '/';
  if (raw.startsWith('//')) return '/';
  if (raw.startsWith('/')) return raw;
  if (raw.startsWith(config.frontendUrl)) {
    const rest = raw.slice(config.frontendUrl.length);
    return rest || '/';
  }
  return '/';
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64url');
}

export class GoogleAuthProvider implements AuthProvider {
  readonly name = 'google';

  private readonly userRepo: UserRepository;
  private readonly oauthRepo: OauthAccountRepository;
  private readonly oneTimeRepo: OneTimeTokenRepository;
  private readonly loginLogRepo: OauthLoginLogRepository;
  private readonly verificationRepo: VerificationRepository;
  private readonly emailService: EmailService;
  private readonly core: AuthCore;
  private readonly passwordProvider: PasswordAuthProvider;

  constructor(deps: {
    userRepo: UserRepository;
    oauthRepo: OauthAccountRepository;
    oneTimeRepo: OneTimeTokenRepository;
    loginLogRepo: OauthLoginLogRepository;
    verificationRepo: VerificationRepository;
    emailService: EmailService;
    core: AuthCore;
    passwordProvider: PasswordAuthProvider;
  }) {
    this.userRepo = deps.userRepo;
    this.oauthRepo = deps.oauthRepo;
    this.oneTimeRepo = deps.oneTimeRepo;
    this.loginLogRepo = deps.loginLogRepo;
    this.verificationRepo = deps.verificationRepo;
    this.emailService = deps.emailService;
    this.core = deps.core;
    this.passwordProvider = deps.passwordProvider;
  }

  isConfigured(): boolean {
    return Boolean(config.google.clientId && config.google.clientSecret && config.google.redirectUri);
  }

  /* ---- Authorization URL ---- */

  async authorize(input?: { redirect?: string | null; role?: string | null }): Promise<{ url: string; tokenJti: string }> {
    if (!this.isConfigured()) {
      throw AppError.badRequest('Google OAuth is not configured');
    }

    const stateJti = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
    const codeChallenge = base64UrlEncode(createHash('sha256').update(codeVerifier).digest());

    await this.oneTimeRepo.create({
      jti: stateJti,
      type: 'oauth_state',
      metadata: {
        provider: 'google',
        nonce,
        code_verifier: codeVerifier,
        redirect: sanitizeRedirect(input?.redirect),
        // Applied ONLY to brand-new account creation (AUTH_API.md §6).
        role: input?.role ?? null,
      },
      expiresAt: new Date(Date.now() + STATE_TTL_MS),
    });

    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: stateJti,
      nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
      access_type: 'online',
    });

    return { url: `${GOOGLE_AUTH_URL}?${params.toString()}`, tokenJti: stateJti };
  }

  /* ---- Callback ---- */

  async handleCallback(input: GoogleCallbackInput): Promise<GoogleCallbackResult> {
    const log = (entry: { user?: User | null; email?: string | null; success: boolean; reason?: string | null }) =>
      this.loginLogRepo.create({
        userId: entry.user?.id ?? null,
        email: entry.email ?? entry.user?.email ?? null,
        provider: 'google',
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        success: entry.success,
        failureReason: entry.reason ?? null,
      });

    const state = await this.oneTimeRepo.consume(input.stateJti, 'oauth_state');
    if (!state) {
      await log({ success: false, reason: 'invalid_state' });
      return this.errorRedirect('invalid_state');
    }

    if (input.error) {
      await log({ success: false, reason: `google_error:${input.error}` });
      return this.errorRedirect('access_denied');
    }

    if (!input.code) {
      await log({ success: false, reason: 'missing_code' });
      return this.errorRedirect('missing_code');
    }

    const redirectTarget = sanitizeRedirect(String(state.metadata.redirect ?? ''));
    const requestedRole = state.metadata.role as string | null | undefined;
    const roleForNewAccount = requestedRole && ['dealer', 'agency', 'store', 'workshop'].includes(requestedRole)
      ? (requestedRole as 'dealer' | 'agency' | 'store' | 'workshop')
      : undefined;

    // Exchange authorization code (PKCE).
    let tokenResponse: Record<string, unknown>;
    try {
      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: input.code,
          client_id: config.google.clientId,
          client_secret: config.google.clientSecret,
          redirect_uri: config.google.redirectUri,
          grant_type: 'authorization_code',
          code_verifier: String(state.metadata.code_verifier ?? ''),
        }),
      });
      tokenResponse = (await res.json()) as Record<string, unknown>;
    } catch {
      await log({ success: false, reason: 'token_exchange_failed' });
      return this.errorRedirect('token_exchange_failed');
    }

    if (!tokenResponse.id_token) {
      await log({ success: false, reason: 'id_token_missing' });
      return this.errorRedirect('id_token_missing');
    }

    // Verify the ID token signature with Google's JWKS (embedded snapshot first,
    // remote fallback — some networks get 403 from the Google certs URL).
    let claims: GoogleIdTokenClaims;
    try {
      claims = await verifyGoogleIdToken(String(tokenResponse.id_token), config.google.clientId);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.error('[google] ID token verification failed:', detail);
      await log({ success: false, reason: `invalid_id_token:${detail.slice(0, 200)}` });
      return this.errorRedirect('invalid_id_token');
    }

    if (claims.nonce !== state.metadata.nonce) {
      await log({ success: false, reason: 'nonce_mismatch' });
      return this.errorRedirect('nonce_mismatch');
    }

    if (!claims.sub) {
      await log({ success: false, reason: 'missing_subject' });
      return this.errorRedirect('missing_subject');
    }

    const identity: AuthIdentity = {
      provider: 'google',
      providerAccountId: claims.sub,
      email: claims.email ?? undefined,
      emailVerified: claims.email_verified === true,
      displayName: claims.name ?? undefined,
      avatarUrl: claims.picture ?? undefined,
    };

    // 1) Known identity → session.
    const existing = await this.oauthRepo.findByProviderAccount('google', identity.providerAccountId);
    if (existing) {
      const user = await this.userRepo.findById(existing.userId);
      if (!user || user.status !== 'active') {
        await log({ user, success: false, reason: 'inactive_account' });
        return this.errorRedirect('inactive_account');
      }
      existing.refreshSnapshot({
        name: identity.displayName ?? null,
        avatarUrl: identity.avatarUrl ?? null,
        email: identity.email ?? null,
      });
      existing.markLogin();
      await this.oauthRepo.save(existing);
      if (user.avatar === null && identity.avatarUrl) {
        user.avatar = identity.avatarUrl;
        await this.userRepo.save(user);
      }
      await log({ user, success: true });
      return this.sessionRedirect(user, redirectTarget);
    }

    // 2) Email matches an existing user.
    const identityEmail = identity.email ?? '';
    if (identityEmail) {
      const byEmail = await this.userRepo.findByEmail(identityEmail);
      if (byEmail) {
        if (byEmail.hasPassword && identity.emailVerified !== true) {
          // Google did NOT verify the mailbox, so we cannot prove ownership —
          // require password re-authentication before linking (ADR-012 §5).
          const linkJti = await this.createToken('oauth_link', byEmail.id, {
            provider: 'google',
            identity,
          });
          await log({ user: byEmail, success: false, reason: 'link_required' });
          return this.flowRedirect('link_required', linkJti, byEmail.email, redirectTarget);
        }
        // Google verified the mailbox (email_verified === true): proof of email
        // ownership is equivalent to an OTP — link directly, no password step.
        // Also unlocks accounts that were registered with a password but never
        // email-verified (login was locked for them).
        if (!byEmail.emailVerified) {
          byEmail.verifyEmail();
          await this.userRepo.save(byEmail);
        }
        await this.linkIdentity(byEmail, identity);
        await log({ user: byEmail, success: true, reason: 'linked_via_google' });
        return this.sessionRedirect(byEmail, redirectTarget);
      }
    }

    // 3) Brand-new account.
    if (this.canTrustEmail(identity)) {
      const user = await this.core.createUserFromIdentity(identity, roleForNewAccount ? { role: roleForNewAccount } : undefined);
      await this.linkIdentity(user, identity);
      const account = await this.oauthRepo.findByUserAndProvider(user.id, 'google');
      if (account) {
        account.markLogin();
        await this.oauthRepo.save(account);
      }
      await log({ user, success: true });
      return this.sessionRedirect(user, redirectTarget);
    }

    // 4) Email cannot be trusted (missing or not verified by Google) → OTP fallback.
    if (!identityEmail) {
      await log({ success: false, reason: 'email_missing' });
      return this.errorRedirect('email_missing');
    }
    const user = await this.core.createUserFromIdentity(
      { ...identity, emailVerified: false },
      roleForNewAccount ? { role: roleForNewAccount } : undefined,
    );
    await this.linkIdentity(user, identity);
    const pendingJti = await this.createToken('oauth_verify', user.id, {
      provider: 'google',
      email: user.email,
    });
    await this.sendOtp(user.email);
    await log({ user, success: false, reason: 'pending_verification' });
    return this.flowRedirect('verify', pendingJti, user.email, redirectTarget);
  }

  /* ---- Terminal steps (each issues a session directly) ---- */

  async finalize(input: GoogleFlowInput & { t: string }): Promise<AuthSession> {
    const token = await this.oneTimeRepo.consume(input.t, 'oauth_result');
    if (!token || !token.subject) throw AppError.invalidToken('Session expired or invalid');
    const user = await this.userRepo.findById(token.subject);
    if (!user || user.status !== 'active') throw AppError.invalidToken('Session expired or invalid');
    await this.loginLogRepo.create({
      userId: user.id,
      email: user.email,
      provider: 'google',
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: true,
    });
    return this.core.issueSession(user);
  }

  async verifyCode(input: GoogleFlowInput & { t: string; code: string }): Promise<AuthSession> {
    const token = await this.oneTimeRepo.consume(input.t, 'oauth_verify');
    if (!token || !token.subject) throw AppError.invalidToken('Verification session expired or invalid');
    const user = await this.userRepo.findById(token.subject);
    if (!user) throw AppError.invalidToken('Verification session expired or invalid');

    const stored = await this.verificationRepo.findLatestRegistrationOtp(user.email, 'email');
    if (!stored) throw AppError.otpInvalid();
    if (stored.isExpired) throw AppError.otpExpired();
    if (sha256Hex(input.code) !== stored.otpHash) throw AppError.otpInvalid();
    await this.verificationRepo.markRegistrationOtpVerified(stored.id);

    user.verifyEmail();
    await this.userRepo.save(user);

    const account = await this.oauthRepo.findByUserAndProvider(user.id, 'google');
    if (account) {
      account.markLogin();
      await this.oauthRepo.save(account);
    }

    await this.loginLogRepo.create({
      userId: user.id,
      email: user.email,
      provider: 'google',
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: true,
    });
    return this.core.issueSession(user);
  }

  async resendCode(input: GoogleFlowInput & { t: string }): Promise<void> {
    const token = await this.oneTimeRepo.peek(input.t, 'oauth_verify');
    if (!token || token.isExpired() || token.isConsumed() || !token.subject) {
      throw AppError.invalidToken('Verification session expired or invalid');
    }
    const user = await this.userRepo.findById(token.subject);
    if (!user) throw AppError.invalidToken('Verification session expired or invalid');
    await this.sendOtp(user.email);
  }

  async linkAccount(input: GoogleFlowInput & { t: string; password: string }): Promise<AuthSession> {
    const token = await this.oneTimeRepo.consume(input.t, 'oauth_link');
    if (!token || !token.subject) throw AppError.invalidToken('Link session expired or invalid');
    const user = await this.userRepo.findById(token.subject);
    if (!user) throw AppError.invalidToken('Link session expired or invalid');

    const identity = token.metadata.identity as AuthIdentity | undefined;
    if (!identity || identity.provider !== 'google' || !identity.providerAccountId) {
      throw AppError.invalidToken('Link session expired or invalid');
    }

    // Re-authenticate with the account password before linking (ADR-012 §5).
    // Note: authenticate() throws EMAIL_NOT_VERIFIED only AFTER the bcrypt check
    // passed — a correct password with an unverified mailbox. Since Google already
    // proved the mailbox with this very flow, verifying the email here is safe.
    try {
      const auth = await this.passwordProvider.authenticate({ email: user.email, password: input.password });
      if (auth.kind !== 'session') throw AppError.invalidCredentials();
    } catch (err) {
      if (err instanceof AppError && err.code === ErrorCode.EMAIL_NOT_VERIFIED) {
        user.verifyEmail();
        await this.userRepo.save(user);
      } else {
        throw err;
      }
    }

    await this.linkIdentity(user, identity);

    await this.loginLogRepo.create({
      userId: user.id,
      email: user.email,
      provider: 'google',
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: true,
      failureReason: 'linked_after_password_auth',
    });
    return this.core.issueSession(user);
  }

  /* ---- AuthProvider interface (for future account management) ---- */

  async link(userId: string, input: { identity: AuthIdentity }): Promise<AuthIdentity> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw AppError.notFound('User not found');
    await this.linkIdentity(user, input.identity);
    return input.identity;
  }

  async unlink(userId: string): Promise<void> {
    const account = await this.oauthRepo.findByUserAndProvider(userId, 'google');
    if (!account) return;
    account.softDelete();
    await this.oauthRepo.save(account);
  }

  async refreshIdentity(identity: AuthIdentity): Promise<AuthIdentity> {
    return identity;
  }

  /* ---- Private helpers ---- */

  private canTrustEmail(identity: AuthIdentity): boolean {
    return identity.provider === 'google'
      && Boolean(identity.email)
      && identity.emailVerified === true;
  }

  private async sendOtp(email: string): Promise<void> {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await this.verificationRepo.createRegistrationOtp({
      identifier: email,
      type: 'email',
      otp_hash: sha256Hex(code),
      expires_at: expiresAt,
    });
    await this.emailService.sendOtp(email, code);
  }

  private async createToken(
    type: 'oauth_result' | 'oauth_verify' | 'oauth_link',
    subject: string,
    metadata: Record<string, unknown>,
  ): Promise<string> {
    const jti = crypto.randomUUID();
    const ttl = type === 'oauth_result' ? RESULT_TTL_MS : type === 'oauth_link' ? LINK_TTL_MS : VERIFY_TTL_MS;
    await this.oneTimeRepo.create({
      jti,
      type,
      subject,
      metadata,
      expiresAt: new Date(Date.now() + ttl),
    });
    return jti;
  }

  private async linkIdentity(user: User, identity: AuthIdentity): Promise<void> {
    let account = await this.oauthRepo.findAnyByProviderAccount('google', identity.providerAccountId);
    if (account) {
      if (!account.isLinked()) account.restore();
      account.refreshSnapshot({
        name: identity.displayName ?? null,
        avatarUrl: identity.avatarUrl ?? null,
        email: identity.email ?? null,
      });
    } else {
      account = OauthAccount.fromSnapshot({
        id: crypto.randomUUID(),
        userId: user.id,
        provider: 'google',
        providerAccountId: identity.providerAccountId,
        providerUserName: identity.displayName ?? null,
        providerAvatar: identity.avatarUrl ?? null,
        email: identity.email ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null,
        deletedAt: null,
      });
    }
    await this.oauthRepo.save(account);
  }

  private async sessionRedirect(user: User, redirect?: string): Promise<GoogleCallbackResult> {
    const tokenJti = await this.createToken('oauth_result', user.id, { provider: 'google' });
    return this.flowRedirect('session', tokenJti, undefined, redirect);
  }

  private flowRedirect(
    mode: 'session' | 'verify' | 'link_required',
    tokenJti: string,
    email?: string,
    redirect?: string,
  ): GoogleCallbackResult {
    const params = new URLSearchParams({ mode, t: tokenJti });
    if (email) params.set('email', email);
    if (redirect) params.set('redirect', redirect);
    // link_required lives on its own page (AUTH_API.md §7) — it needs a
    // password form; google-complete handles session/verify/error only.
    if (mode === 'link_required') {
      return { redirectUrl: `${config.frontendUrl}/link-account?${params.toString()}` };
    }
    return { redirectUrl: `${config.frontendUrl}/google-complete?${params.toString()}` };
  }

  private errorRedirect(reason: string): GoogleCallbackResult {
    return { redirectUrl: `${config.frontendUrl}/google-complete?mode=error&reason=${encodeURIComponent(reason)}` };
  }
}
