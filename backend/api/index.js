import { createRequire } from 'module';const require = createRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/config/index.ts
var config;
var init_config = __esm({
  "src/config/index.ts"() {
    "use strict";
    config = {
      nodeEnv: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "4000", 10),
      apiPrefix: process.env.API_PREFIX || "/api/v1",
      frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
      database: {
        url: process.env.DATABASE_URL || "postgres://marketplace:marketplace_pass@localhost:5432/marketplace",
        poolMin: parseInt(process.env.DB_POOL_MIN || "2", 10),
        poolMax: parseInt(process.env.DB_POOL_MAX || "10", 10)
      },
      jwt: {
        secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
        accessTtl: process.env.JWT_ACCESS_TTL || "15m",
        refreshTtl: process.env.JWT_REFRESH_TTL || "7d"
      },
      email: {
        provider: process.env.EMAIL_PROVIDER || "console",
        from: process.env.EMAIL_FROM || "noreply@marketplace.com",
        smtp: {
          host: process.env.SMTP_HOST || "",
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          user: process.env.SMTP_USER || "",
          pass: process.env.SMTP_PASS || ""
        }
      },
      sms: {
        provider: process.env.SMS_PROVIDER || "console",
        kavenegar: {
          apiKey: process.env.KAVENEGAR_API_KEY || "",
          sender: process.env.KAVENEGAR_SENDER || ""
        }
      },
      storage: {
        provider: process.env.STORAGE_PROVIDER || "local",
        s3: {
          accessKey: process.env.S3_ACCESS_KEY || "",
          secretKey: process.env.S3_SECRET_KEY || "",
          bucket: process.env.S3_BUCKET || "marketplace-images",
          endpoint: process.env.S3_ENDPOINT || "",
          region: process.env.S3_REGION || "ir-thr-at1"
        }
      },
      payment: {
        provider: process.env.PAYMENT_PROVIDER || "noop",
        zarinpal: {
          merchantId: process.env.ZARINPAL_MERCHANT_ID || "",
          callbackUrl: process.env.ZARINPAL_CALLBACK_URL || ""
        }
      },
      rateLimits: {
        global: { limit: parseInt(process.env.GLOBAL_RATE_LIMIT || "100", 10), window: parseInt(process.env.GLOBAL_RATE_WINDOW || "60", 10) },
        login: { limit: parseInt(process.env.LOGIN_RATE_LIMIT || "5", 10), window: parseInt(process.env.LOGIN_RATE_WINDOW || "900", 10) },
        register: { limit: parseInt(process.env.REGISTER_RATE_LIMIT || "5", 10), window: parseInt(process.env.REGISTER_RATE_WINDOW || "3600", 10) },
        otpSend: { limit: parseInt(process.env.OTP_SEND_RATE_LIMIT || "3", 10), window: parseInt(process.env.OTP_SEND_RATE_WINDOW || "3600", 10) },
        otpVerify: { limit: parseInt(process.env.OTP_VERIFY_RATE_LIMIT || "10", 10), window: parseInt(process.env.OTP_VERIFY_RATE_WINDOW || "900", 10) },
        forgotPassword: { limit: parseInt(process.env.FORGOT_RATE_LIMIT || "3", 10), window: parseInt(process.env.FORGOT_RATE_WINDOW || "3600", 10) },
        verifyEmail: { limit: parseInt(process.env.VERIFY_EMAIL_RATE_LIMIT || "5", 10), window: parseInt(process.env.VERIFY_EMAIL_RATE_WINDOW || "86400", 10) },
        publishListing: { limit: parseInt(process.env.PUBLISH_LISTING_RATE_LIMIT || "10", 10), window: parseInt(process.env.PUBLISH_LISTING_RATE_WINDOW || "86400", 10) },
        createConversation: { limit: parseInt(process.env.CONVERSATION_RATE_LIMIT || "30", 10), window: parseInt(process.env.CONVERSATION_RATE_WINDOW || "3600", 10) },
        sendMessage: { limit: parseInt(process.env.MESSAGE_RATE_LIMIT || "60", 10), window: parseInt(process.env.MESSAGE_RATE_WINDOW || "60", 10) }
      }
    };
  }
});

// src/config/database.ts
var database_exports = {};
__export(database_exports, {
  checkConnection: () => checkConnection,
  closeDb: () => closeDb,
  getDb: () => getDb
});
async function getDb() {
  if (pool) return pool;
  const pg = await import("pg");
  const p = new pg.Pool({
    connectionString: config.database.url,
    min: config.database.poolMin,
    max: config.database.poolMax
  });
  p.on("error", (err) => {
    console.error("[db] unexpected pool error:", err);
  });
  pool = p;
  return pool;
}
async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
async function checkConnection() {
  try {
    const db = await getDb();
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
var pool;
var init_database = __esm({
  "src/config/database.ts"() {
    "use strict";
    init_config();
    pool = null;
  }
});

// src/config/auth.ts
var auth_exports = {};
__export(auth_exports, {
  authConfig: () => authConfig
});
var authConfig;
var init_auth = __esm({
  "src/config/auth.ts"() {
    "use strict";
    init_config();
    authConfig = {
      secret: new TextEncoder().encode(config.jwt.secret),
      accessTtl: config.jwt.accessTtl,
      refreshTtl: config.jwt.refreshTtl,
      refreshCookieName: "refresh_token",
      refreshCookiePath: "/api/v1/auth",
      refreshCookieSameSite: "Lax",
      refreshCookieSecure: config.nodeEnv === "production",
      refreshCookieHttpOnly: true,
      refreshCookieMaxAge: 7 * 24 * 60 * 60
    };
  }
});

// src/services/payment/providers/noop.ts
var noop_exports = {};
__export(noop_exports, {
  NoopPaymentProvider: () => NoopPaymentProvider
});
var NoopPaymentProvider;
var init_noop = __esm({
  "src/services/payment/providers/noop.ts"() {
    "use strict";
    NoopPaymentProvider = class {
      async createPayment(amount, currency, metadata) {
        return {
          success: true,
          providerPaymentId: `noop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          redirectUrl: null
        };
      }
      async verifyPayment(providerPaymentId) {
        return { success: true, providerPaymentId };
      }
      async refund(providerPaymentId, _amount) {
        return { success: true, providerPaymentId };
      }
    };
  }
});

// api/index.ts
import { Hono as Hono21 } from "hono";
import { handle } from "hono/vercel";

// src/middleware/cors.ts
init_config();
function corsMiddleware() {
  return async (c, next) => {
    const origin = c.req.header("Origin") || "";
    const allowedOrigins = [config.frontendUrl, "http://localhost:3000", "http://localhost:4000"];
    if (allowedOrigins.includes(origin)) {
      c.res.headers.set("Access-Control-Allow-Origin", origin);
      c.res.headers.set("Access-Control-Allow-Credentials", "true");
      c.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      c.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      c.res.headers.set("Access-Control-Max-Age", "86400");
    }
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204);
    }
    await next();
  };
}

// src/shared/errors.ts
var ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  PHONE_VERIFICATION_REQUIRED: "PHONE_VERIFICATION_REQUIRED",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  OTP_INVALID: "OTP_INVALID",
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_RATE_LIMITED: "OTP_RATE_LIMITED",
  PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",
  RESOURCE_CONFLICT: "RESOURCE_CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR"
};

// src/errors.ts
var httpStatusMap = {
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.PHONE_VERIFICATION_REQUIRED]: 403,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.OTP_INVALID]: 422,
  [ErrorCode.OTP_EXPIRED]: 422,
  [ErrorCode.OTP_RATE_LIMITED]: 429,
  [ErrorCode.PASSWORD_TOO_WEAK]: 422,
  [ErrorCode.RESOURCE_CONFLICT]: 409,
  [ErrorCode.INTERNAL_ERROR]: 500
};
var AppError = class _AppError extends Error {
  code;
  httpStatus;
  constructor(code, message) {
    super(message || code);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = httpStatusMap[code] || 500;
  }
  static validation(message) {
    return new _AppError(ErrorCode.VALIDATION_ERROR, message);
  }
  static unauthorized(message) {
    return new _AppError(ErrorCode.UNAUTHORIZED, message || "Unauthorized");
  }
  static forbidden(message) {
    return new _AppError(ErrorCode.FORBIDDEN, message || "Forbidden");
  }
  static notFound(message) {
    return new _AppError(ErrorCode.NOT_FOUND, message || "Resource not found");
  }
  static rateLimited(message) {
    return new _AppError(ErrorCode.RATE_LIMITED, message || "Too many requests");
  }
  static phoneVerificationRequired(message) {
    return new _AppError(ErrorCode.PHONE_VERIFICATION_REQUIRED, message || "Phone verification required");
  }
  static emailAlreadyExists(message) {
    return new _AppError(ErrorCode.EMAIL_ALREADY_EXISTS, message || "Email already exists");
  }
  static invalidCredentials(message) {
    return new _AppError(ErrorCode.INVALID_CREDENTIALS, message || "Invalid email or password");
  }
  static invalidToken(message) {
    return new _AppError(ErrorCode.INVALID_TOKEN, message || "Invalid token");
  }
  static tokenExpired(message) {
    return new _AppError(ErrorCode.TOKEN_EXPIRED, message || "Token expired");
  }
  static otpInvalid(message) {
    return new _AppError(ErrorCode.OTP_INVALID, message || "Invalid OTP code");
  }
  static otpExpired(message) {
    return new _AppError(ErrorCode.OTP_EXPIRED, message || "OTP code expired");
  }
  static passwordTooWeak(message) {
    return new _AppError(ErrorCode.PASSWORD_TOO_WEAK, message || "Password is too weak");
  }
  static resourceConflict(message) {
    return new _AppError(ErrorCode.RESOURCE_CONFLICT, message || "Resource conflict");
  }
  static internal(message) {
    return new _AppError(ErrorCode.INTERNAL_ERROR, message || "Internal server error");
  }
};

// src/middleware/errorHandler.ts
function errorHandler() {
  return async (c, next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof AppError) {
        c.status(err.httpStatus);
        return c.json({
          success: false,
          error: { code: err.code, message: err.message }
        });
      }
      if (err instanceof SyntaxError) {
        c.status(422);
        return c.json({
          success: false,
          error: { code: ErrorCode.VALIDATION_ERROR, message: "Invalid JSON body" }
        });
      }
      console.error("[error] unhandled:", err);
      c.status(500);
      return c.json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: "Internal server error" }
      });
    }
  };
}

// src/config/rateLimits.ts
init_config();
var rateLimits = {
  global: config.rateLimits.global,
  login: config.rateLimits.login,
  register: config.rateLimits.register,
  "otp:send": config.rateLimits.otpSend,
  "otp:verify": config.rateLimits.otpVerify,
  "forgot:password": config.rateLimits.forgotPassword,
  "email:verify": config.rateLimits.verifyEmail,
  "listing:publish": config.rateLimits.publishListing,
  "conversation:create": config.rateLimits.createConversation,
  "message:send": config.rateLimits.sendMessage
};

// src/middleware/rateLimiter.ts
var store = {};
function getKey(name, identifier) {
  return `${name}:${identifier}`;
}
function rateLimiter(name) {
  return async (c, next) => {
    const config2 = rateLimits[name];
    if (!config2) {
      await next();
      return;
    }
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const key = getKey(name, ip);
    const now = Date.now();
    const entry = store[key];
    if (!entry || now > entry.resetAt) {
      store[key] = { count: 1, resetAt: now + config2.window * 1e3 };
      await next();
      return;
    }
    if (entry.count >= config2.limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1e3);
      c.res.headers.set("Retry-After", String(retryAfter));
      return c.json(
        {
          success: false,
          error: { code: ErrorCode.RATE_LIMITED, message: `Rate limit exceeded. Try again in ${retryAfter}s` }
        },
        429
      );
    }
    entry.count++;
    await next();
  };
}

// src/routes/index.ts
import { Hono as Hono20 } from "hono";

// src/routes/health.ts
init_database();
import { Hono } from "hono";
var router = new Hono();
router.get("/", async (c) => {
  const dbConnected = await checkConnection();
  return c.json({
    success: true,
    data: {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      db: dbConnected ? "connected" : "disconnected"
    }
  });
});

// src/routes/auth.ts
import { Hono as Hono2 } from "hono";
import { zValidator } from "@hono/zod-validator";

// src/domain/services/auth.ts
import bcrypt from "bcryptjs";

// src/repositories/user.ts
init_database();
var UserRepository = class {
  async findByEmail(email) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );
    return rows[0];
  }
  async findById(id) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL",
      [id]
    );
    return rows[0];
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.password_hash, data.name]
    );
    return rows[0];
  }
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push(`updated_at = NOW()`);
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return rows[0];
  }
  async updatePassword(id, passwordHash) {
    const db = await getDb();
    await db.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
      [passwordHash, id]
    );
  }
};
var userRepo = new UserRepository();

// src/repositories/refreshToken.ts
init_database();
var RefreshTokenRepository = class {
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.user_id, data.token_hash, data.expires_at]
    );
    return rows[0];
  }
  async findByTokenHash(hash) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL",
      [hash]
    );
    return rows[0];
  }
  async revoke(id) {
    const db = await getDb();
    await db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1",
      [id]
    );
  }
  async revokeAllForUser(userId) {
    const db = await getDb();
    await db.query(
      "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [userId]
    );
  }
};
var refreshTokenRepo = new RefreshTokenRepository();

// src/services/jwt.ts
init_auth();
import { SignJWT, jwtVerify } from "jose";
function parseTtl(ttl) {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return 900;
  }
}
async function signAccessToken(payload) {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(parseTtl(authConfig.accessTtl)).sign(authConfig.secret);
}
async function signRefreshToken(userId) {
  return new SignJWT({ sub: userId, type: "refresh" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(parseTtl(authConfig.refreshTtl)).sign(authConfig.secret);
}

// src/services/email/providers/console.ts
var ConsoleEmailProvider = class {
  name = "console";
  async send(payload) {
    console.log("\u2500".repeat(50));
    console.log("[email] To:", payload.to);
    console.log("[email] Subject:", payload.subject);
    console.log("[email] Body:", payload.body);
    if (payload.html) {
      console.log("[email] HTML:", payload.html.slice(0, 200) + "...");
    }
    console.log("\u2500".repeat(50));
  }
};

// src/services/email/providers/noop.ts
var NoopEmailProvider = class {
  name = "noop";
  async send(_payload) {
  }
};

// src/services/email/index.ts
init_config();
function createEmailProvider() {
  switch (config.email.provider) {
    case "noop":
      return new NoopEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
}
var EmailService = class {
  provider;
  constructor(provider) {
    this.provider = provider ?? createEmailProvider();
  }
  async send(payload) {
    await this.provider.send(payload);
  }
  async sendVerificationEmail(to, token) {
    const url = `${config.frontendUrl}/email/verify/${token}`;
    await this.send({
      to,
      subject: "Verify your email address",
      body: `Please verify your email by clicking this link: ${url}`,
      html: `<p>Please verify your email by clicking <a href="${url}">this link</a>.</p>`
    });
  }
  async sendPasswordResetEmail(to, token) {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;
    await this.send({
      to,
      subject: "Reset your password",
      body: `Reset your password here: ${url}`,
      html: `<p>Reset your password <a href="${url}">here</a>.</p>`
    });
  }
};

// src/domain/events/index.ts
var TypedEvent = class {
  constructor(name) {
    this.name = name;
  }
  name;
};
var InMemoryEventBus = class {
  handlers = /* @__PURE__ */ new Map();
  publish(event, payload) {
    const handlers = this.handlers.get(event.name);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          result.catch((err) => console.error(`[eventbus] handler error for ${event.name}:`, err));
        }
      } catch (err) {
        console.error(`[eventbus] handler error for ${event.name}:`, err);
      }
    }
  }
  subscribe(event, handler) {
    if (!this.handlers.has(event.name)) {
      this.handlers.set(event.name, /* @__PURE__ */ new Set());
    }
    this.handlers.get(event.name).add(handler);
  }
  unsubscribe(event, handler) {
    this.handlers.get(event.name)?.delete(handler);
  }
};
var eventBus = new InMemoryEventBus();
var UserRegistered = new TypedEvent("user.registered");
var UserLoggedIn = new TypedEvent("user.logged_in");
var EmailVerified = new TypedEvent("email.verified");
var PhoneVerified = new TypedEvent("phone.verified");
var ListingCreated = new TypedEvent("listing.created");
var ListingUpdated = new TypedEvent("listing.updated");
var ListingDeleted = new TypedEvent("listing.deleted");
var ListingStatusChanged = new TypedEvent("listing.status_changed");
var ConversationStarted = new TypedEvent("conversation.started");
var MessageSent = new TypedEvent("message.sent");
var AccountUpgraded = new TypedEvent("account.upgraded");

// src/domain/services/auth.ts
var SALT_ROUNDS = 12;
var AuthService = class {
  emailService;
  constructor(emailService) {
    this.emailService = emailService ?? new EmailService();
  }
  async register(input) {
    const existing = await userRepo.findByEmail(input.email);
    if (existing) {
      throw AppError.emailAlreadyExists();
    }
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepo.create({
      email: input.email,
      password_hash: passwordHash,
      name: input.name
    });
    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: !!user.phone_verified_at,
      emailVerified: !!user.email_verified_at
    });
    const refreshToken = await signRefreshToken(user.id);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await refreshTokenRepo.create({
      user_id: user.id,
      token_hash: refreshHash,
      expires_at: expiresAt
    });
    eventBus.publish(UserRegistered, { userId: user.id, email: user.email, name: user.name });
    return {
      token: accessToken,
      refreshToken,
      user: this.sanitizeUser(user)
    };
  }
  async login(input) {
    const user = await userRepo.findByEmail(input.email);
    if (!user) {
      throw AppError.invalidCredentials();
    }
    const valid = await bcrypt.compare(input.password, user.password_hash);
    if (!valid) {
      throw AppError.invalidCredentials();
    }
    if (user.status !== "active") {
      throw AppError.forbidden("Account is deactivated");
    }
    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: !!user.phone_verified_at,
      emailVerified: !!user.email_verified_at
    });
    const refreshToken = await signRefreshToken(user.id);
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await refreshTokenRepo.create({
      user_id: user.id,
      token_hash: refreshHash,
      expires_at: expiresAt
    });
    return {
      token: accessToken,
      refreshToken,
      user: this.sanitizeUser(user)
    };
  }
  async refresh(refreshTokenStr) {
    let payload;
    try {
      const { jwtVerify: jwtVerify3 } = await import("jose");
      const { authConfig: authConfig2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const { payload: p } = await jwtVerify3(refreshTokenStr, authConfig2.secret);
      payload = p;
    } catch {
      throw AppError.invalidToken();
    }
    if (!payload.sub) {
      throw AppError.invalidToken();
    }
    const refreshHash = await bcrypt.hash(refreshTokenStr, 10);
    const stored = await refreshTokenRepo.findByTokenHash(refreshHash);
    if (!stored) {
      throw AppError.invalidToken();
    }
    if (new Date(stored.expires_at) < /* @__PURE__ */ new Date()) {
      throw AppError.tokenExpired();
    }
    const user = await userRepo.findById(payload.sub);
    if (!user || user.status !== "active") {
      throw AppError.unauthorized();
    }
    await refreshTokenRepo.revoke(stored.id);
    const accessToken = await signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      phoneVerified: !!user.phone_verified_at,
      emailVerified: !!user.email_verified_at
    });
    const newRefreshToken = await signRefreshToken(user.id);
    const newRefreshHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    await refreshTokenRepo.create({
      user_id: user.id,
      token_hash: newRefreshHash,
      expires_at: expiresAt
    });
    return { token: accessToken, refreshToken: newRefreshToken };
  }
  async logout(refreshTokenStr) {
    const refreshHash = await bcrypt.hash(refreshTokenStr, 10);
    const stored = await refreshTokenRepo.findByTokenHash(refreshHash);
    if (stored) {
      await refreshTokenRepo.revoke(stored.id);
    }
  }
  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return this.sanitizeUser(user);
  }
  async updateProfile(userId, data) {
    const user = await userRepo.update(userId, data);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return this.sanitizeUser(user);
  }
  async forgotPassword(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      return;
    }
    const { SignJWT: SignJWT2 } = await import("jose");
    const { authConfig: authConfig2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const resetToken = await new SignJWT2({ sub: user.id, type: "password_reset" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("1h").sign(authConfig2.secret);
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }
  async resetPassword(token, newPassword) {
    let payload;
    try {
      const { jwtVerify: jwtVerify3 } = await import("jose");
      const { authConfig: authConfig2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const { payload: p } = await jwtVerify3(token, authConfig2.secret);
      payload = p;
    } catch {
      throw AppError.invalidToken("Invalid or expired reset token");
    }
    if (!payload.sub) {
      throw AppError.invalidToken();
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepo.updatePassword(payload.sub, passwordHash);
  }
  sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
      city: user.city,
      emailVerified: !!user.email_verified_at,
      phoneVerified: !!user.phone_verified_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
};
var authService = new AuthService();

// src/middleware/auth.ts
init_auth();
import { jwtVerify as jwtVerify2 } from "jose";
function auth() {
  return async (c, next) => {
    const header = c.req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {
      throw AppError.unauthorized("Missing or invalid Authorization header");
    }
    const token = header.slice(7);
    try {
      const { payload } = await jwtVerify2(token, authConfig.secret);
      c.set("user", payload);
      await next();
    } catch (err) {
      if (err instanceof Error && err.name === "JWTExpired") {
        throw AppError.tokenExpired();
      }
      throw AppError.invalidToken();
    }
  };
}
function optionalAuth() {
  return async (c, next) => {
    const header = c.req.header("Authorization");
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);
      try {
        const { payload } = await jwtVerify2(token, authConfig.secret);
        c.set("user", payload);
      } catch {
      }
    }
    await next();
  };
}

// src/validation/auth.ts
import { z } from "zod";
var registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(100)
});
var loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required")
});
var forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format")
});
var resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});
var updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().max(500).nullable().optional()
});

// src/routes/auth.ts
var router2 = new Hono2();
var REFRESH_COOKIE = "refresh_token";
var COOKIE_PATH = "/api/v1/auth";
var COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
function setRefreshCookie(c, token) {
  c.header(
    "Set-Cookie",
    `${REFRESH_COOKIE}=${token}; HttpOnly; Path=${COOKIE_PATH}; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
  );
}
function clearRefreshCookie(c) {
  c.header(
    "Set-Cookie",
    `${REFRESH_COOKIE}=; HttpOnly; Path=${COOKIE_PATH}; SameSite=Lax; Max-Age=0`
  );
}
router2.post("/register", rateLimiter("register"), zValidator("json", registerSchema), async (c) => {
  const { email, password, name } = c.req.valid("json");
  const result = await authService.register({ email, password, name });
  setRefreshCookie(c, result.refreshToken);
  return c.json({ success: true, data: { token: result.token, user: result.user } }, 201);
});
router2.post("/login", rateLimiter("login"), zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const result = await authService.login({ email, password });
  setRefreshCookie(c, result.refreshToken);
  return c.json({ success: true, data: { token: result.token, user: result.user } });
});
router2.post("/refresh", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
  const refreshToken = match?.[1];
  if (!refreshToken) {
    throw AppError.unauthorized("No refresh token");
  }
  const result = await authService.refresh(refreshToken);
  setRefreshCookie(c, result.refreshToken);
  return c.json({ success: true, data: { token: result.token } });
});
router2.post("/logout", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${REFRESH_COOKIE}=([^;]*)`));
  const refreshToken = match?.[1];
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  clearRefreshCookie(c);
  return c.json({ success: true, data: null });
});
router2.get("/me", auth(), async (c) => {
  const user = c.get("user");
  const profile = await authService.getMe(user.id);
  return c.json({ success: true, data: profile });
});
router2.put("/me", auth(), zValidator("json", updateProfileSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");
  const profile = await authService.updateProfile(user.id, data);
  return c.json({ success: true, data: profile });
});
router2.post("/forgot", rateLimiter("forgot:password"), zValidator("json", forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid("json");
  await authService.forgotPassword(email);
  return c.json({ success: true, data: null });
});
router2.post("/reset", zValidator("json", resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid("json");
  await authService.resetPassword(token, password);
  return c.json({ success: true, data: null });
});

// src/routes/email.ts
import { Hono as Hono3 } from "hono";
import { zValidator as zValidator2 } from "@hono/zod-validator";
import { z as z2 } from "zod";

// src/domain/services/emailVerification.ts
import bcrypt2 from "bcryptjs";

// src/repositories/verification.ts
init_database();
var VerificationRepository = class {
  // Email
  async createEmailVerification(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [data.user_id, data.token_hash, data.expires_at]
    );
    return rows[0];
  }
  async findEmailVerificationByHash(hash) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM email_verifications WHERE token_hash = $1 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1",
      [hash]
    );
    return rows[0];
  }
  async markEmailVerified(id) {
    const db = await getDb();
    await db.query("UPDATE email_verifications SET verified_at = NOW() WHERE id = $1", [id]);
  }
  // Phone
  async createPhoneVerification(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO phone_verifications (user_id, phone, otp_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.user_id, data.phone, data.otp_hash, data.expires_at]
    );
    return rows[0];
  }
  async findPhoneVerificationByHash(hash, userId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM phone_verifications WHERE otp_hash = $1 AND user_id = $2 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1",
      [hash, userId]
    );
    return rows[0];
  }
  async markPhoneVerified(id) {
    const db = await getDb();
    await db.query("UPDATE phone_verifications SET verified_at = NOW() WHERE id = $1", [id]);
  }
  async countRecentByPhone(phone, withinSeconds) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM phone_verifications WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 second' * $2`,
      [phone, withinSeconds]
    );
    const row = rows[0];
    return parseInt(row.count, 10);
  }
  async countRecentByUser(userId, withinSeconds) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM phone_verifications WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 second' * $2`,
      [userId, withinSeconds]
    );
    const row = rows[0];
    return parseInt(row.count, 10);
  }
};
var verificationRepo = new VerificationRepository();

// src/domain/services/emailVerification.ts
var EmailVerificationService = class {
  emailService;
  constructor(emailService) {
    this.emailService = emailService ?? new EmailService();
  }
  async sendVerification(userId, email) {
    const { SignJWT: SignJWT2 } = await import("jose");
    const { authConfig: authConfig2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
    const token = await new SignJWT2({ sub: userId, type: "email_verify" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("24h").sign(authConfig2.secret);
    const tokenHash = await bcrypt2.hash(token, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
    await verificationRepo.createEmailVerification({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
    await this.emailService.sendVerificationEmail(email, token);
  }
  async verify(token) {
    let payload;
    try {
      const { jwtVerify: jwtVerify3 } = await import("jose");
      const { authConfig: authConfig2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
      const { payload: p } = await jwtVerify3(token, authConfig2.secret);
      payload = p;
    } catch {
      throw AppError.invalidToken("Invalid or expired verification token");
    }
    if (!payload.sub) {
      throw AppError.invalidToken();
    }
    const tokenHash = await bcrypt2.hash(token, 10);
    const stored = await verificationRepo.findEmailVerificationByHash(tokenHash);
    if (!stored) {
      throw AppError.invalidToken();
    }
    if (new Date(stored.expires_at) < /* @__PURE__ */ new Date()) {
      throw AppError.invalidToken("Verification token expired");
    }
    await verificationRepo.markEmailVerified(stored.id);
    await userRepo.update(payload.sub, { email_verified_at: (/* @__PURE__ */ new Date()).toISOString() });
    eventBus.publish(EmailVerified, { userId: payload.sub, email: "" });
  }
};
var emailVerificationService = new EmailVerificationService();

// src/routes/email.ts
var router3 = new Hono3();
var sendVerifySchema = z2.object({
  email: z2.string().email()
});
router3.post("/send-verify", auth(), rateLimiter("email:verify"), zValidator2("json", sendVerifySchema), async (c) => {
  const user = c.get("user");
  const { email } = c.req.valid("json");
  await emailVerificationService.sendVerification(user.id, email);
  return c.json({ success: true, data: null });
});
router3.get("/verify/:token", async (c) => {
  const token = c.req.param("token");
  await emailVerificationService.verify(token);
  return c.json({ success: true, data: null });
});

// src/routes/phone.ts
import { Hono as Hono4 } from "hono";
import { zValidator as zValidator3 } from "@hono/zod-validator";
import { z as z3 } from "zod";

// src/domain/services/phoneVerification.ts
import bcrypt3 from "bcryptjs";
import crypto from "crypto";

// src/services/sms/providers/console.ts
var ConsoleSmsProvider = class {
  name = "console";
  async send(payload) {
    console.log("\u2500".repeat(50));
    console.log("[sms] To:", payload.to);
    console.log("[sms] Message:", payload.message);
    console.log("\u2500".repeat(50));
  }
};

// src/services/sms/index.ts
init_config();
function createSmsProvider() {
  switch (config.sms.provider) {
    case "console":
    default:
      return new ConsoleSmsProvider();
  }
}
var SmsService = class {
  provider;
  constructor(provider) {
    this.provider = provider ?? createSmsProvider();
  }
  async send(payload) {
    await this.provider.send(payload);
  }
  async sendOtp(to, code) {
    await this.send({
      to,
      message: `Your verification code is: ${code}. Valid for 5 minutes.`
    });
  }
};

// src/domain/services/phoneVerification.ts
var OTP_TTL_MS = 5 * 60 * 1e3;
var OTP_RATE_WINDOW_SEC = 3600;
var OTP_MAX_PER_WINDOW = 3;
var PhoneVerificationService = class {
  smsService;
  constructor(smsService) {
    this.smsService = smsService ?? new SmsService();
  }
  generateOtp() {
    return crypto.randomInt(1e5, 999999).toString();
  }
  async sendOtp(userId, phone) {
    const recentCount = await verificationRepo.countRecentByPhone(phone, OTP_RATE_WINDOW_SEC);
    if (recentCount >= OTP_MAX_PER_WINDOW) {
      throw AppError.rateLimited("OTP rate limited. Try again later.");
    }
    const code = this.generateOtp();
    const otpHash = await bcrypt3.hash(code, 10);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await verificationRepo.createPhoneVerification({ user_id: userId, phone, otp_hash: otpHash, expires_at: expiresAt });
    await this.smsService.sendOtp(phone, code);
  }
  async verifyOtp(userId, phone, code) {
    const otpHash = await bcrypt3.hash(code, 10);
    const stored = await verificationRepo.findPhoneVerificationByHash(otpHash, userId);
    if (!stored) {
      throw AppError.otpInvalid();
    }
    if (new Date(stored.expires_at) < /* @__PURE__ */ new Date()) {
      throw AppError.otpExpired();
    }
    const valid = await bcrypt3.compare(code, stored.otp_hash);
    if (!valid) {
      throw AppError.otpInvalid();
    }
    await verificationRepo.markPhoneVerified(stored.id);
    await userRepo.update(userId, { phone, phone_verified_at: (/* @__PURE__ */ new Date()).toISOString() });
    eventBus.publish(PhoneVerified, { userId, phone });
  }
  async getStatus(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return {
      phone: user.phone,
      verified: !!user.phone_verified_at
    };
  }
};
var phoneVerificationService = new PhoneVerificationService();

// src/routes/phone.ts
var router4 = new Hono4();
var sendOtpSchema = z3.object({
  phone: z3.string().min(10).max(15)
});
var verifyOtpSchema = z3.object({
  phone: z3.string().min(10).max(15),
  code: z3.string().length(6)
});
router4.post("/send-otp", auth(), rateLimiter("otp:send"), zValidator3("json", sendOtpSchema), async (c) => {
  const user = c.get("user");
  const { phone } = c.req.valid("json");
  await phoneVerificationService.sendOtp(user.id, phone);
  return c.json({ success: true, data: null });
});
router4.post("/verify-otp", auth(), rateLimiter("otp:verify"), zValidator3("json", verifyOtpSchema), async (c) => {
  const user = c.get("user");
  const { phone, code } = c.req.valid("json");
  await phoneVerificationService.verifyOtp(user.id, phone, code);
  return c.json({ success: true, data: null });
});
router4.get("/status", auth(), async (c) => {
  const user = c.get("user");
  const status = await phoneVerificationService.getStatus(user.id);
  return c.json({ success: true, data: status });
});

// src/routes/categories.ts
import { Hono as Hono5 } from "hono";
import { zValidator as zValidator4 } from "@hono/zod-validator";

// src/repositories/category.ts
init_database();
var CategoryRepository = class {
  async findAll() {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM categories ORDER BY sort_order, name");
    return rows;
  }
  async findBySlug(slug) {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM categories WHERE slug = $1", [slug]);
    return rows[0];
  }
  async findById(id) {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM categories WHERE id = $1", [id]);
    return rows[0];
  }
  async findChildren(id) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM categories WHERE parent_id = $1 ORDER BY sort_order, name",
      [id]
    );
    return rows;
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.name_en ?? null, data.slug, data.icon ?? null, data.parent_id ?? null, data.sort_order ?? 0]
    );
    return rows[0];
  }
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push("updated_at = NOW()");
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE categories SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }
  async delete(id) {
    const db = await getDb();
    await db.query("DELETE FROM categories WHERE id = $1", [id]);
  }
};
var categoryRepo = new CategoryRepository();

// src/repositories/attribute.ts
init_database();
var AttributeRepository = class {
  async findByCategory(categoryId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM attributes WHERE category_id = $1 ORDER BY sort_order, id",
      [categoryId]
    );
    return rows;
  }
  async findById(id) {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM attributes WHERE id = $1", [id]);
    return rows[0];
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO attributes (category_id, name, label, type, options, unit, is_required, is_filterable, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.category_id,
        data.name,
        data.label,
        data.type,
        data.options !== void 0 ? JSON.stringify(data.options) : null,
        data.unit ?? null,
        data.is_required ?? false,
        data.is_filterable ?? false,
        data.sort_order ?? 0
      ]
    );
    return rows[0];
  }
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0) {
        const col = key === "options" ? `"options"` : key;
        fields.push(`${col} = $${idx++}`);
        values.push(key === "options" ? JSON.stringify(value) : value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push("updated_at = NOW()");
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE attributes SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }
  async delete(id) {
    const db = await getDb();
    await db.query("DELETE FROM attributes WHERE id = $1", [id]);
  }
};
var attributeRepo = new AttributeRepository();

// src/middleware/adminAuth.ts
function adminAuth() {
  return async (c, next) => {
    const user = c.get("user");
    if (!user || user.role !== "admin") {
      throw AppError.forbidden("Admin access required");
    }
    await next();
  };
}

// src/validation/categories.ts
import { z as z4 } from "zod";
var createCategorySchema = z4.object({
  name: z4.string().min(1).max(100),
  name_en: z4.string().max(100).optional(),
  slug: z4.string().min(1).max(100),
  icon: z4.string().max(200).optional(),
  parent_id: z4.number().positive().optional().nullable(),
  sort_order: z4.number().int().min(0).optional()
});
var updateCategorySchema = createCategorySchema.partial();
var createAttributeSchema = z4.object({
  name: z4.string().min(1).max(100),
  label: z4.string().min(1).max(100),
  type: z4.enum(["text", "number", "select", "multi_select", "boolean", "range", "color"]),
  options: z4.any().optional(),
  unit: z4.string().max(50).optional(),
  is_required: z4.boolean().optional(),
  is_filterable: z4.boolean().optional(),
  sort_order: z4.number().int().min(0).optional()
});
var updateAttributeSchema = createAttributeSchema.partial();
var createProvinceSchema = z4.object({
  name: z4.string().min(1).max(100),
  slug: z4.string().min(1).max(100),
  sort_order: z4.number().int().min(0).optional()
});
var updateProvinceSchema = createProvinceSchema.partial();
var createCitySchema = z4.object({
  name: z4.string().min(1).max(100)
});

// src/routes/categories.ts
var router5 = new Hono5();
router5.get("/", async (c) => {
  const categories = await categoryRepo.findAll();
  const tree = buildTree(categories);
  return c.json({ success: true, data: tree });
});
router5.get("/:slug/attributes", async (c) => {
  const slug = c.req.param("slug");
  const category = await categoryRepo.findBySlug(slug);
  if (!category) throw AppError.notFound("Category not found");
  const attributes = await attributeRepo.findByCategory(category.id);
  return c.json({ success: true, data: attributes });
});
router5.post("/", auth(), adminAuth(), zValidator4("json", createCategorySchema), async (c) => {
  const body = c.req.valid("json");
  const existing = await categoryRepo.findBySlug(body.slug);
  if (existing) throw AppError.resourceConflict("Slug already exists");
  const category = await categoryRepo.create(body);
  return c.json({ success: true, data: category }, 201);
});
router5.put("/:id", auth(), adminAuth(), zValidator4("json", updateCategorySchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await categoryRepo.findById(id);
  if (!existing) throw AppError.notFound("Category not found");
  const category = await categoryRepo.update(id, c.req.valid("json"));
  return c.json({ success: true, data: category });
});
router5.delete("/:id", auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await categoryRepo.findById(id);
  if (!existing) throw AppError.notFound("Category not found");
  await categoryRepo.delete(id);
  return c.json({ success: true, data: null });
});
router5.post("/:id/attributes", auth(), adminAuth(), zValidator4("json", createAttributeSchema), async (c) => {
  const categoryId = parseInt(c.req.param("id"), 10);
  const category = await categoryRepo.findById(categoryId);
  if (!category) throw AppError.notFound("Category not found");
  const body = c.req.valid("json");
  const attribute = await attributeRepo.create({ ...body, category_id: categoryId });
  return c.json({ success: true, data: attribute }, 201);
});
router5.put("/attributes/:id", auth(), adminAuth(), zValidator4("json", updateAttributeSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await attributeRepo.findById(id);
  if (!existing) throw AppError.notFound("Attribute not found");
  const attribute = await attributeRepo.update(id, c.req.valid("json"));
  return c.json({ success: true, data: attribute });
});
router5.delete("/attributes/:id", auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await attributeRepo.findById(id);
  if (!existing) throw AppError.notFound("Attribute not found");
  await attributeRepo.delete(id);
  return c.json({ success: true, data: null });
});
function buildTree(categories, parentId = null) {
  return categories.filter((c) => c.parent_id === parentId).map((c) => ({
    ...c,
    children: buildTree(categories, c.id)
  }));
}

// src/routes/provinces.ts
import { Hono as Hono6 } from "hono";
import { zValidator as zValidator5 } from "@hono/zod-validator";

// src/repositories/province.ts
init_database();
var ProvinceRepository = class {
  async findAll() {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM provinces ORDER BY sort_order, name");
    return rows;
  }
  async findById(id) {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM provinces WHERE id = $1", [id]);
    return rows[0];
  }
  async findCities(provinceId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM cities WHERE province_id = $1 ORDER BY name",
      [provinceId]
    );
    return rows;
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO provinces (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.slug, data.sort_order ?? 0]
    );
    return rows[0];
  }
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE provinces SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }
  async delete(id) {
    const db = await getDb();
    await db.query("DELETE FROM provinces WHERE id = $1", [id]);
  }
  async createCity(provinceId, name) {
    const db = await getDb();
    const { rows } = await db.query(
      "INSERT INTO cities (province_id, name) VALUES ($1, $2) RETURNING *",
      [provinceId, name]
    );
    return rows[0];
  }
  async deleteCity(id) {
    const db = await getDb();
    await db.query("DELETE FROM cities WHERE id = $1", [id]);
  }
};
var provinceRepo = new ProvinceRepository();

// src/routes/provinces.ts
var router6 = new Hono6();
router6.get("/", async (c) => {
  const provinces = await provinceRepo.findAll();
  const result = await Promise.all(
    provinces.map(async (p) => {
      const cities = await provinceRepo.findCities(p.id);
      return { ...p, cities };
    })
  );
  return c.json({ success: true, data: result });
});
router6.post("/", auth(), adminAuth(), zValidator5("json", createProvinceSchema), async (c) => {
  const body = c.req.valid("json");
  const province = await provinceRepo.create(body);
  return c.json({ success: true, data: province }, 201);
});
router6.put("/:id", auth(), adminAuth(), zValidator5("json", updateProvinceSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await provinceRepo.findById(id);
  if (!existing) throw AppError.notFound("Province not found");
  const province = await provinceRepo.update(id, c.req.valid("json"));
  return c.json({ success: true, data: province });
});
router6.delete("/:id", auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const existing = await provinceRepo.findById(id);
  if (!existing) throw AppError.notFound("Province not found");
  await provinceRepo.delete(id);
  return c.json({ success: true, data: null });
});
router6.post("/:id/cities", auth(), adminAuth(), zValidator5("json", createCitySchema), async (c) => {
  const provinceId = parseInt(c.req.param("id"), 10);
  const province = await provinceRepo.findById(provinceId);
  if (!province) throw AppError.notFound("Province not found");
  const { name } = c.req.valid("json");
  const city = await provinceRepo.createCity(provinceId, name);
  return c.json({ success: true, data: city }, 201);
});
router6.delete("/cities/:id", auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await provinceRepo.deleteCity(id);
  return c.json({ success: true, data: null });
});

// src/routes/listings.ts
import { Hono as Hono7 } from "hono";
import { zValidator as zValidator6 } from "@hono/zod-validator";
import { z as z5 } from "zod";

// src/repositories/listing.ts
init_database();
var ListingRepository = class {
  async findAll(filters) {
    const wheres = ["l.deleted_at IS NULL"];
    const params = [];
    let p = 1;
    if (filters.scope === "me" && filters.userId) {
      wheres.push(`l.user_id = $${p++}`);
      params.push(filters.userId);
    } else {
      wheres.push(`l.status = $${p++}`);
      params.push("published");
    }
    if (filters.category) {
      wheres.push(`l.category_id = (SELECT id FROM categories WHERE slug = $${p++})`);
      params.push(filters.category);
    }
    if (filters.province) {
      wheres.push(`l.province_id = (SELECT id FROM provinces WHERE slug = $${p++})`);
      params.push(filters.province);
    }
    if (filters.status && filters.scope === "me") {
      wheres.push(`l.status = $${p++}`);
      params.push(filters.status);
    }
    if (filters.min_price !== void 0) {
      wheres.push(`l.price >= $${p++}`);
      params.push(filters.min_price);
    }
    if (filters.max_price !== void 0) {
      wheres.push(`l.price <= $${p++}`);
      params.push(filters.max_price);
    }
    const where = wheres.join(" AND ");
    let orderBy = "ORDER BY l.created_at DESC";
    if (filters.sort === "price_asc") orderBy = "ORDER BY l.price ASC";
    else if (filters.sort === "price_desc") orderBy = "ORDER BY l.price DESC";
    else if (filters.sort === "oldest") orderBy = "ORDER BY l.created_at ASC";
    else if (filters.sort === "views") orderBy = "ORDER BY l.views DESC";
    const page = filters.page || 1;
    const perPage = filters.perPage || 24;
    const offset = (page - 1) * perPage;
    const db = await getDb();
    const countRes = await db.query(`SELECT COUNT(*) as total FROM listings l WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].total, 10);
    const { rows } = await db.query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug, p.name as province_name
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN provinces p ON p.id = l.province_id
       WHERE ${where} ${orderBy} LIMIT $${p++} OFFSET $${p++}`,
      [...params, perPage, offset]
    );
    return { data: rows, total, page, lastPage: Math.ceil(total / perPage) };
  }
  async findBySlug(slug) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT l.*,
              c.name as category_name, c.slug as category_slug,
              p.name as province_name,
              u.name as seller_name, u.avatar as seller_avatar
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN provinces p ON p.id = l.province_id
       LEFT JOIN users u ON u.id = l.user_id
       WHERE l.slug = $1 AND l.deleted_at IS NULL`,
      [slug]
    );
    return rows[0];
  }
  async findById(id) {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM listings WHERE id = $1 AND deleted_at IS NULL", [id]);
    return rows[0];
  }
  async findAttributes(listingId) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT la.*, a.name, a.label, a.type, a.unit
       FROM listing_attributes la
       JOIN attributes a ON a.id = la.attribute_id
       WHERE la.listing_id = $1
       ORDER BY a.sort_order`,
      [listingId]
    );
    return rows;
  }
  async findImages(listingId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM listing_images WHERE listing_id = $1 ORDER BY sort_order, id",
      [listingId]
    );
    return rows;
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO listings (user_id, category_id, province_id, city_id, title, slug, description, price, price_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [data.user_id, data.category_id, data.province_id ?? null, data.city_id ?? null, data.title, data.slug, data.description ?? "", data.price ?? 0, data.price_type ?? "fixed", data.status ?? "draft"]
    );
    return rows[0];
  }
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    fields.push("updated_at = NOW()");
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE listings SET ${fields.join(", ")} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return rows[0];
  }
  async updateStatus(id, status, extraFields) {
    const fields = ["status = $1", "updated_at = NOW()"];
    const values = [status];
    if (extraFields) {
      let idx = 2;
      for (const [key, value] of Object.entries(extraFields)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE listings SET ${fields.join(", ")} WHERE id = $${values.length} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return rows[0];
  }
  async softDelete(id) {
    const db = await getDb();
    await db.query("UPDATE listings SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1", [id]);
  }
  async incrementViews(id) {
    const db = await getDb();
    await db.query("UPDATE listings SET views = views + 1 WHERE id = $1", [id]);
  }
  async setAttributes(listingId, attributes) {
    const db = await getDb();
    await db.query("DELETE FROM listing_attributes WHERE listing_id = $1", [listingId]);
    for (const attr of attributes) {
      await db.query(
        "INSERT INTO listing_attributes (listing_id, attribute_id, value) VALUES ($1, $2, $3)",
        [listingId, attr.attribute_id, attr.value]
      );
    }
  }
  async addImage(listingId, data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO listing_images (listing_id, url, thumbnail_url, medium_url, is_primary, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [listingId, data.url, data.thumbnail_url ?? null, data.medium_url ?? null, data.is_primary ?? false, data.sort_order ?? 0]
    );
    return rows[0];
  }
  async removeImage(id) {
    const db = await getDb();
    await db.query("DELETE FROM listing_images WHERE id = $1", [id]);
  }
  async search(q, filters) {
    const term = `%${q}%`;
    const wheres = ["l.deleted_at IS NULL", "l.status = $1", "(l.title ILIKE $2 OR l.description ILIKE $3)"];
    const params = ["published", term, term];
    let p = 4;
    if (filters.category) {
      wheres.push(`l.category_id = (SELECT id FROM categories WHERE slug = $${p++})`);
      params.push(filters.category);
    }
    if (filters.province) {
      wheres.push(`l.province_id = (SELECT id FROM provinces WHERE slug = $${p++})`);
      params.push(filters.province);
    }
    if (filters.min_price !== void 0) {
      wheres.push(`l.price >= $${p++}`);
      params.push(filters.min_price);
    }
    if (filters.max_price !== void 0) {
      wheres.push(`l.price <= $${p++}`);
      params.push(filters.max_price);
    }
    const where = wheres.join(" AND ");
    const db = await getDb();
    const countRes = await db.query(`SELECT COUNT(*) as total FROM listings l WHERE ${where}`, params);
    const total = parseInt(countRes.rows[0].total, 10);
    const { rows } = await db.query(
      `SELECT l.*
       FROM listings l
       WHERE ${where}
       ORDER BY
         CASE WHEN l.title ILIKE $2 THEN 0 WHEN l.description ILIKE $2 THEN 1 ELSE 2 END,
         l.created_at DESC
       LIMIT 24`,
      params
    );
    return { data: rows, total };
  }
};
var listingRepo = new ListingRepository();

// src/services/permission/index.ts
var CAPABILITY_REQUIREMENTS = {
  "listing:publish": { phoneVerified: true },
  "listing:submit": { phoneVerified: true },
  "conversation:start": { phoneVerified: true },
  "account:upgrade-dealer": { phoneVerified: true, roles: ["user"] },
  "account:upgrade-agency": { phoneVerified: true, roles: ["user"] },
  "admin:access": { phoneVerified: false, roles: ["admin"] }
};
var PermissionService = class {
  can(capability, user) {
    const req = CAPABILITY_REQUIREMENTS[capability];
    if (!req) return false;
    if (req.phoneVerified && !user.phoneVerified) return false;
    if (req.roles && !req.roles.includes(user.role)) return false;
    return true;
  }
  requireCapability(capability, user) {
    const req = CAPABILITY_REQUIREMENTS[capability];
    if (!req) {
      throw AppError.forbidden(`Unknown capability: ${capability}`);
    }
    if (req.phoneVerified && !user.phoneVerified) {
      throw new AppError(ErrorCode.PHONE_VERIFICATION_REQUIRED, "Phone verification required for this action");
    }
    if (req.roles && !req.roles.includes(user.role)) {
      throw AppError.forbidden("You do not have permission to perform this action");
    }
  }
};
var permissionService = new PermissionService();

// src/services/cache/index.ts
var MemoryCache = class {
  store = /* @__PURE__ */ new Map();
  defaultTtl;
  constructor(defaultTtlMs = 3e4) {
    this.defaultTtl = defaultTtlMs;
  }
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return void 0;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return void 0;
    }
    return entry.value;
  }
  set(key, value, ttlMs) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtl)
    });
  }
  invalidate(key) {
    this.store.delete(key);
  }
  invalidatePattern(pattern) {
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) {
        this.store.delete(key);
      }
    }
  }
  clear() {
    this.store.clear();
  }
  get size() {
    return this.store.size;
  }
};
var cache = new MemoryCache();

// src/domain/services/listing.ts
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 100) || "listing";
}
var ListingService = class {
  async list(filters) {
    const cacheKey = `listings:${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached && filters.scope !== "me") return cached;
    const result = await listingRepo.findAll({
      ...filters,
      userId: filters.user?.id
    });
    if (filters.scope !== "me") {
      cache.set(cacheKey, result, 15e3);
    }
    return result;
  }
  async getBySlug(slug) {
    const cacheKey = `listing:${slug}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const listing = await listingRepo.findBySlug(slug);
    if (!listing) throw AppError.notFound("Listing not found");
    const [attributes, images] = await Promise.all([
      listingRepo.findAttributes(listing.id),
      listingRepo.findImages(listing.id)
    ]);
    const result = { ...listing, attributes, images };
    cache.set(cacheKey, result, 15e3);
    listingRepo.incrementViews(listing.id).catch(() => {
    });
    return result;
  }
  async create(input) {
    permissionService.requireCapability("listing:publish", input.user);
    const category = await categoryRepo.findById(input.category_id);
    if (!category) throw AppError.notFound("Category not found");
    const slug = generateSlug(input.title);
    const listing = await listingRepo.create({
      user_id: input.user.id,
      category_id: input.category_id,
      title: input.title,
      slug,
      description: input.description,
      price: input.price,
      price_type: input.price_type || "fixed",
      province_id: input.province_id ?? null,
      city_id: input.city_id ?? null,
      status: "draft"
    });
    if (input.attributes?.length) {
      await listingRepo.setAttributes(listing.id, input.attributes);
    }
    if (input.images?.length) {
      for (const img of input.images) {
        await listingRepo.addImage(listing.id, img);
      }
    }
    eventBus.publish(ListingCreated, { listingId: String(listing.id), userId: input.user.id });
    return listing;
  }
  async update(input) {
    const listing = await listingRepo.findById(input.id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id !== input.user.id) throw AppError.forbidden("You can only edit your own listings");
    const updated = await listingRepo.update(input.id, input.data);
    if (input.attributes) {
      await listingRepo.setAttributes(input.id, input.attributes);
    }
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingUpdated, { listingId: String(input.id), userId: input.user.id });
    return updated;
  }
  async delete(id, user) {
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id !== user.id && user.role !== "admin") {
      throw AppError.forbidden("You can only delete your own listings");
    }
    await listingRepo.softDelete(id);
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingDeleted, { listingId: String(id), userId: user.id });
  }
  async submit(id, user) {
    permissionService.requireCapability("listing:submit", user);
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id !== user.id) throw AppError.forbidden("You can only submit your own listings");
    if (listing.status !== "draft") throw AppError.validation("Only draft listings can be submitted");
    const oldStatus = listing.status;
    const updated = await listingRepo.updateStatus(id, "pending");
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: "pending"
    });
    return updated;
  }
  async approve(id, user) {
    if (user.role !== "admin") throw AppError.forbidden("Admin access required");
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.status !== "pending") throw AppError.validation("Only pending listings can be approved");
    const oldStatus = listing.status;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
    const updated = await listingRepo.updateStatus(id, "published", {
      published_at: now,
      expires_at: expiresAt
    });
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: "published"
    });
    return updated;
  }
  async reject(id, user) {
    if (user.role !== "admin") throw AppError.forbidden("Admin access required");
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.status !== "pending") throw AppError.validation("Only pending listings can be rejected");
    const oldStatus = listing.status;
    const updated = await listingRepo.updateStatus(id, "rejected");
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: "rejected"
    });
    return updated;
  }
  async markSold(id, user) {
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id !== user.id) throw AppError.forbidden("You can only mark your own listings as sold");
    if (listing.status !== "published") throw AppError.validation("Only published listings can be marked as sold");
    const oldStatus = listing.status;
    const updated = await listingRepo.updateStatus(id, "sold");
    cache.invalidate(`listing:listing.slug`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: "sold"
    });
    return updated;
  }
  async renew(id, user) {
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id !== user.id) throw AppError.forbidden("You can only renew your own listings");
    if (listing.status !== "published" && listing.status !== "sold") {
      throw AppError.validation("Only published or sold listings can be renewed");
    }
    const oldStatus = listing.status;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
    const updated = await listingRepo.updateStatus(id, "published", {
      published_at: (/* @__PURE__ */ new Date()).toISOString(),
      expires_at: expiresAt
    });
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern("listings:");
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: "published"
    });
    return updated;
  }
  async search(q, filters) {
    const cacheKey = `search:${q}:${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const result = await listingRepo.search(q, filters);
    cache.set(cacheKey, result, 3e4);
    return result;
  }
};
var listingService = new ListingService();

// src/repositories/favorite.ts
init_database();
var FavoriteRepository = class {
  async findByUser(userId) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT l.*, f.created_at as favorited_at
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       WHERE f.user_id = $1 AND l.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  }
  async toggle(userId, listingId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2",
      [userId, listingId]
    );
    if (rows[0]) {
      await db.query("DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2", [userId, listingId]);
      return { favorited: false };
    }
    await db.query(
      "INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, listingId]
    );
    return { favorited: true };
  }
};
var favoriteRepo = new FavoriteRepository();

// src/routes/listings.ts
var router7 = new Hono7();
var createListingSchema = z5.object({
  title: z5.string().min(1).max(200),
  description: z5.string().max(5e3).optional(),
  price: z5.number().int().min(0).optional(),
  price_type: z5.enum(["fixed", "negotiable", "auction"]).optional(),
  category_id: z5.number().int().positive(),
  province_id: z5.number().int().positive().optional(),
  city_id: z5.number().int().positive().optional(),
  attributes: z5.array(z5.object({ attribute_id: z5.number().int().positive(), value: z5.string() })).optional(),
  images: z5.array(z5.object({
    url: z5.string().url(),
    thumbnail_url: z5.string().optional(),
    medium_url: z5.string().optional(),
    is_primary: z5.boolean().optional(),
    sort_order: z5.number().int().min(0).optional()
  })).optional()
});
var updateListingSchema = createListingSchema.partial().omit({ images: true, attributes: true });
var actionSchema = z5.object({
  action: z5.enum(["submit", "sold", "renew", "approve", "reject"])
});
router7.get("/", optionalAuth(), async (c) => {
  const query = c.req.query();
  const user = c.get("user");
  const scope = query.scope;
  if (scope === "me" && !user) throw AppError.unauthorized();
  const result = await listingService.list({
    scope: query.scope,
    category: query.category,
    province: query.province,
    status: query.status,
    min_price: query.min_price ? parseInt(query.min_price, 10) : void 0,
    max_price: query.max_price ? parseInt(query.max_price, 10) : void 0,
    sort: query.sort,
    page: query.page ? parseInt(query.page, 10) : void 0,
    perPage: query.per_page ? parseInt(query.per_page, 10) : void 0,
    user
  });
  return c.json({
    success: true,
    data: result.data,
    meta: {
      current_page: result.page,
      last_page: result.lastPage,
      per_page: 24,
      total: result.total
    }
  });
});
router7.get("/:slug", optionalAuth(), async (c) => {
  const slug = c.req.param("slug");
  const listing = await listingService.getBySlug(slug);
  return c.json({ success: true, data: listing });
});
router7.post("/", auth(), rateLimiter("publishListing"), zValidator6("json", createListingSchema), async (c) => {
  const body = c.req.valid("json");
  const listing = await listingService.create({ ...body, user: c.get("user") });
  return c.json({ success: true, data: listing }, 201);
});
router7.put("/:id", auth(), zValidator6("json", updateListingSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const body = c.req.valid("json");
  const listing = await listingService.update({ id, data: body, user: c.get("user") });
  return c.json({ success: true, data: listing });
});
router7.delete("/:id", auth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await listingService.delete(id, c.get("user"));
  return c.json({ success: true, data: null });
});
router7.patch("/:id", auth(), zValidator6("json", actionSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { action } = c.req.valid("json");
  const user = c.get("user");
  let listing;
  switch (action) {
    case "submit":
      listing = await listingService.submit(id, user);
      break;
    case "sold":
      listing = await listingService.markSold(id, user);
      break;
    case "renew":
      listing = await listingService.renew(id, user);
      break;
    case "approve":
      listing = await listingService.approve(id, user);
      break;
    case "reject":
      listing = await listingService.reject(id, user);
      break;
  }
  return c.json({ success: true, data: listing });
});
router7.post("/:id/favorite", auth(), async (c) => {
  const listingId = parseInt(c.req.param("id"), 10);
  const result = await favoriteRepo.toggle(c.get("user").id, listingId);
  return c.json({ success: true, data: result }, result.favorited ? 201 : 200);
});
router7.post("/:id/report", auth(), async (c) => {
  const listingId = parseInt(c.req.param("id"), 10);
  const userId = c.get("user").id;
  const db = (await Promise.resolve().then(() => (init_database(), database_exports))).getDb;
  const d = await db();
  await d.query(
    "INSERT INTO reports (user_id, listing_id) VALUES ($1, $2)",
    [userId, listingId]
  );
  return c.json({ success: true, data: { reported: true } }, 201);
});

// src/routes/search.ts
import { Hono as Hono8 } from "hono";
var router8 = new Hono8();
router8.get("/", async (c) => {
  const q = c.req.query("q");
  if (!q || q.trim().length === 0) {
    throw AppError.validation("Search query is required");
  }
  const result = await listingService.search(q, {
    category: c.req.query("category"),
    province: c.req.query("province"),
    min_price: c.req.query("min_price") ? parseInt(c.req.query("min_price"), 10) : void 0,
    max_price: c.req.query("max_price") ? parseInt(c.req.query("max_price"), 10) : void 0
  });
  return c.json({
    success: true,
    data: result.data,
    meta: { total: result.total }
  });
});

// src/routes/uploads.ts
import { Hono as Hono9 } from "hono";
init_config();
var router9 = new Hono9();
router9.post("/presigned", auth(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { filename, contentType } = body;
  if (!filename) throw AppError.validation("Filename is required");
  if (config.storage.provider === "local" || !config.storage.s3.endpoint) {
    return c.json({
      success: true,
      data: {
        url: `/uploads/${Date.now()}-${filename}`,
        method: "PUT",
        fields: {}
      }
    });
  }
  throw AppError.internal("S3 storage not yet configured");
});

// src/routes/conversations.ts
import { Hono as Hono10 } from "hono";
import { zValidator as zValidator7 } from "@hono/zod-validator";
import { z as z6 } from "zod";

// src/repositories/conversation.ts
init_database();
var ConversationRepository = class {
  async findByUser(userId) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT c.*,
              l.title as listing_title, l.slug as listing_slug, l.primary_image as listing_image,
              u.name as other_name, u.avatar as other_avatar,
              (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
       FROM conversations c
       JOIN listings l ON l.id = c.listing_id
       JOIN users u ON u.id = CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC`,
      [userId]
    );
    return rows;
  }
  async findById(id) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM conversations WHERE id = $1",
      [id]
    );
    return rows[0];
  }
  async findByListingAndBuyer(listingId, buyerId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2",
      [listingId, buyerId]
    );
    return rows[0];
  }
  async findMessages(conversationId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    );
    return rows;
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO conversations (listing_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING *`,
      [data.listing_id, data.buyer_id, data.seller_id]
    );
    return rows[0];
  }
  async addMessage(conversationId, senderId, body) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, senderId, body]
    );
    await db.query(
      "UPDATE conversations SET last_message_at = NOW() WHERE id = $1",
      [conversationId]
    );
    return rows[0];
  }
  async markRead(conversationId, userId) {
    const db = await getDb();
    await db.query(
      `UPDATE messages SET is_read = true, read_at = NOW()
       WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
      [conversationId, userId]
    );
  }
  async getUnreadCount(userId) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.buyer_id = $1 OR c.seller_id = $1)
         AND m.sender_id != $1
         AND m.is_read = false`,
      [userId]
    );
    return parseInt(rows[0].count, 10);
  }
};
var conversationRepo = new ConversationRepository();

// src/domain/services/conversation.ts
var ConversationService = class {
  async list(user) {
    return conversationRepo.findByUser(user.id);
  }
  async getById(id, user) {
    const conversation = await conversationRepo.findById(id);
    if (!conversation) throw AppError.notFound("Conversation not found");
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      throw AppError.forbidden("You are not a participant in this conversation");
    }
    const messages = await conversationRepo.findMessages(id);
    return { ...conversation, messages };
  }
  async start(input) {
    permissionService.requireCapability("conversation:start", input.user);
    const listing = await listingRepo.findById(input.listing_id);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id === input.user.id) {
      throw AppError.validation("You cannot start a conversation with yourself");
    }
    const existing = await conversationRepo.findByListingAndBuyer(input.listing_id, input.user.id);
    if (existing) {
      await conversationRepo.addMessage(existing.id, input.user.id, input.message);
      const messages2 = await conversationRepo.findMessages(existing.id);
      eventBus.publish(MessageSent, {
        conversationId: String(existing.id),
        senderId: input.user.id,
        body: input.message
      });
      return { ...existing, messages: messages2 };
    }
    const conversation = await conversationRepo.create({
      listing_id: input.listing_id,
      buyer_id: input.user.id,
      seller_id: listing.user_id
    });
    await conversationRepo.addMessage(conversation.id, input.user.id, input.message);
    const messages = await conversationRepo.findMessages(conversation.id);
    eventBus.publish(ConversationStarted, {
      conversationId: String(conversation.id),
      listingId: String(input.listing_id),
      buyerId: input.user.id,
      sellerId: listing.user_id
    });
    return { ...conversation, messages };
  }
  async sendMessage(input) {
    const conversation = await conversationRepo.findById(input.conversationId);
    if (!conversation) throw AppError.notFound("Conversation not found");
    if (conversation.buyer_id !== input.user.id && conversation.seller_id !== input.user.id) {
      throw AppError.forbidden("You are not a participant in this conversation");
    }
    const message = await conversationRepo.addMessage(input.conversationId, input.user.id, input.body);
    eventBus.publish(MessageSent, {
      conversationId: String(input.conversationId),
      senderId: input.user.id,
      body: input.body
    });
    return message;
  }
  async markRead(conversationId, user) {
    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) throw AppError.notFound("Conversation not found");
    if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) {
      throw AppError.forbidden("You are not a participant in this conversation");
    }
    await conversationRepo.markRead(conversationId, user.id);
  }
  async getUnreadCount(user) {
    return conversationRepo.getUnreadCount(user.id);
  }
};
var conversationService = new ConversationService();

// src/routes/conversations.ts
var router10 = new Hono10();
var startSchema = z6.object({
  listing_id: z6.number().int().positive(),
  message: z6.string().min(1).max(2e3)
});
var messageSchema = z6.object({
  body: z6.string().min(1).max(2e3)
});
router10.get("/", auth(), async (c) => {
  const conversations = await conversationService.list(c.get("user"));
  return c.json({ success: true, data: conversations });
});
router10.get("/unread-count", auth(), async (c) => {
  const count = await conversationService.getUnreadCount(c.get("user"));
  return c.json({ success: true, data: { count } });
});
router10.get("/:id", auth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const conversation = await conversationService.getById(id, c.get("user"));
  return c.json({ success: true, data: conversation });
});
router10.post("/", auth(), rateLimiter("createConversation"), zValidator7("json", startSchema), async (c) => {
  const body = c.req.valid("json");
  const conversation = await conversationService.start({
    listing_id: body.listing_id,
    message: body.message,
    user: c.get("user")
  });
  return c.json({ success: true, data: conversation }, 201);
});
router10.post("/:id/messages", auth(), rateLimiter("sendMessage"), zValidator7("json", messageSchema), async (c) => {
  const conversationId = parseInt(c.req.param("id"), 10);
  const { body } = c.req.valid("json");
  const message = await conversationService.sendMessage({ conversationId, body, user: c.get("user") });
  return c.json({ success: true, data: message }, 201);
});
router10.put("/:id/read", auth(), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await conversationService.markRead(id, c.get("user"));
  return c.json({ success: true, data: null });
});

// src/routes/favorites.ts
import { Hono as Hono11 } from "hono";
var router11 = new Hono11();
router11.get("/", auth(), async (c) => {
  const listings = await favoriteRepo.findByUser(c.get("user").id);
  return c.json({ success: true, data: listings });
});

// src/routes/articles.ts
import { Hono as Hono12 } from "hono";

// src/repositories/article.ts
init_database();
var ArticleRepository = class {
  async findAll() {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles
       WHERE published_at IS NOT NULL AND deleted_at IS NULL
       ORDER BY is_pinned DESC, published_at DESC`
    );
    return rows;
  }
  async findBySlug(slug) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles
       WHERE slug = $1 AND published_at IS NOT NULL AND deleted_at IS NULL`,
      [slug]
    );
    return rows[0];
  }
  async incrementViews(id) {
    const db = await getDb();
    await db.query("UPDATE articles SET views = views + 1 WHERE id = $1", [id]);
  }
};
var articleRepo = new ArticleRepository();

// src/routes/articles.ts
var router12 = new Hono12();
router12.get("/", async (c) => {
  const articles = await articleRepo.findAll();
  return c.json({ success: true, data: articles });
});
router12.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const article = await articleRepo.findBySlug(slug);
  if (!article) throw AppError.notFound("Article not found");
  articleRepo.incrementViews(article.id).catch(() => {
  });
  return c.json({ success: true, data: article });
});

// src/routes/tenders.ts
init_database();
import { Hono as Hono13 } from "hono";
import { zValidator as zValidator8 } from "@hono/zod-validator";
import { z as z7 } from "zod";
var router13 = new Hono13();
var createTenderSchema = z7.object({
  title: z7.string().min(1).max(200),
  description: z7.string().max(5e3).optional(),
  category: z7.string().optional(),
  province_id: z7.number().int().positive().optional(),
  city_id: z7.number().int().positive().optional(),
  budget: z7.number().int().min(0).optional(),
  deadline: z7.string().datetime()
});
var bidSchema = z7.object({
  amount: z7.number().int().positive(),
  description: z7.string().max(2e3).optional()
});
function generateSlug2(title) {
  return title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 100) || "tender";
}
router13.get("/", async (c) => {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT t.*, u.name as user_name
     FROM tenders t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.status = 'open' AND t.deadline > NOW()
     ORDER BY t.created_at DESC`
  );
  return c.json({ success: true, data: rows });
});
router13.get("/:slug", async (c) => {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT t.*, u.name as user_name
     FROM tenders t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.slug = $1`,
    [c.req.param("slug")]
  );
  const tender = rows[0];
  if (!tender) throw AppError.notFound("Tender not found");
  await db.query("UPDATE tenders SET views = views + 1 WHERE id = $1", [tender.id]);
  return c.json({ success: true, data: tender });
});
router13.post("/", auth(), zValidator8("json", createTenderSchema), async (c) => {
  const body = c.req.valid("json");
  const slug = generateSlug2(body.title);
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO tenders (user_id, title, slug, description, category, province_id, city_id, budget, deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [c.get("user").id, body.title, slug, body.description ?? "", body.category ?? null, body.province_id ?? null, body.city_id ?? null, body.budget ?? 0, body.deadline]
  );
  return c.json({ success: true, data: rows[0] }, 201);
});
router13.post("/:id/bid", auth(), zValidator8("json", bidSchema), async (c) => {
  const tenderId = parseInt(c.req.param("id"), 10);
  const db = await getDb();
  const { rows: tenders } = await db.query("SELECT * FROM tenders WHERE id = $1", [tenderId]);
  const tender = tenders[0];
  if (!tender) throw AppError.notFound("Tender not found");
  if (tender.status !== "open") throw AppError.validation("Tender is not open for bids");
  if (tender.user_id === c.get("user").id) throw AppError.validation("You cannot bid on your own tender");
  const body = c.req.valid("json");
  const { rows } = await db.query(
    `INSERT INTO tender_bids (tender_id, user_id, amount, description) VALUES ($1, $2, $3, $4) RETURNING *`,
    [tenderId, c.get("user").id, body.amount, body.description ?? ""]
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

// src/routes/payments.ts
import { Hono as Hono14 } from "hono";
import { zValidator as zValidator9 } from "@hono/zod-validator";
import { z as z8 } from "zod";

// src/repositories/payment.ts
init_database();
var PaymentRepository = class {
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO payments (user_id, amount, currency, provider, metadata)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.user_id, data.amount, data.currency ?? "IRR", data.provider ?? "noop", JSON.stringify(data.metadata ?? {})]
    );
    return rows[0];
  }
  async update(id, data) {
    const fields = ["updated_at = NOW()"];
    const values = [];
    let idx = 1;
    if (data.status) {
      fields.push(`status = $${idx++}`);
      values.push(data.status);
    }
    if (data.provider_id !== void 0) {
      fields.push(`provider_id = $${idx++}`);
      values.push(data.provider_id);
    }
    if (data.metadata) {
      fields.push(`metadata = $${idx++}`);
      values.push(JSON.stringify(data.metadata));
    }
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE payments SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }
  async addWalletTransaction(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.user_id, data.type, data.amount, data.balance_before, data.balance_before + data.amount, data.description ?? "", data.reference_type ?? null, data.reference_id ?? null]
    );
    return rows[0];
  }
  async getWalletTransactions(userId) {
    const db = await getDb();
    const { rows } = await db.query(
      "SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    return rows;
  }
  async getWalletBalance(userId) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as balance FROM wallet_transactions WHERE user_id = $1`,
      [userId]
    );
    return parseInt(rows[0].balance, 10);
  }
};
var paymentRepo = new PaymentRepository();

// src/services/payment/provider.ts
function createPaymentProvider() {
  const providerName = process.env.PAYMENT_PROVIDER || "noop";
  if (providerName === "zarinpal") {
    throw new Error("Zarinpal provider not yet implemented");
  }
  const { NoopPaymentProvider: NoopPaymentProvider2 } = (init_noop(), __toCommonJS(noop_exports));
  return new NoopPaymentProvider2();
}

// src/domain/services/payment.ts
var FEATURED_PRICE = 5e4;
var SUBSCRIPTION_PRICE = 2e5;
var PaymentService = class {
  async createFeaturedPayment(listingId, user) {
    const listing = await listingRepo.findById(listingId);
    if (!listing) throw AppError.notFound("Listing not found");
    if (listing.user_id !== user.id) throw AppError.forbidden("You can only feature your own listings");
    const payment = await paymentRepo.create({
      user_id: user.id,
      amount: FEATURED_PRICE,
      metadata: { type: "featured", listing_id: listingId, listing_title: listing.title }
    });
    const provider = createPaymentProvider();
    const result = await provider.createPayment(FEATURED_PRICE, "IRR", {
      payment_id: payment.id,
      type: "featured",
      listing_id: listingId
    });
    if (result.success && result.providerPaymentId) {
      await paymentRepo.update(payment.id, {
        provider_id: result.providerPaymentId
      });
      if (payment.provider === "noop") {
        await this.completePayment(payment.id);
      }
    }
    return { ...payment, redirect_url: result.redirectUrl };
  }
  async createSubscriptionPayment(user) {
    const payment = await paymentRepo.create({
      user_id: user.id,
      amount: SUBSCRIPTION_PRICE,
      metadata: { type: "subscription" }
    });
    const provider = createPaymentProvider();
    const result = await provider.createPayment(SUBSCRIPTION_PRICE, "IRR", {
      payment_id: payment.id,
      type: "subscription"
    });
    if (result.success && result.providerPaymentId) {
      await paymentRepo.update(payment.id, {
        provider_id: result.providerPaymentId
      });
      if (payment.provider === "noop") {
        await this.completePayment(payment.id);
      }
    }
    return { ...payment, redirect_url: result.redirectUrl };
  }
  async completePayment(paymentId) {
    const db = (await Promise.resolve().then(() => (init_database(), database_exports))).getDb;
    const d = await db();
    const { rows } = await d.query("SELECT * FROM payments WHERE id = $1", [paymentId]);
    const payment = rows[0];
    if (!payment) throw AppError.notFound("Payment not found");
    await paymentRepo.update(paymentId, { status: "completed" });
    const balance = await paymentRepo.getWalletBalance(payment.user_id);
    await paymentRepo.addWalletTransaction({
      user_id: payment.user_id,
      type: payment.metadata?.type === "subscription" ? "subscription" : "featured",
      amount: -payment.amount,
      balance_before: balance,
      description: payment.metadata?.type === "subscription" ? "Dealer subscription" : `Featured listing #${payment.metadata?.listing_id}`,
      reference_type: "payment",
      reference_id: paymentId
    });
    if (payment.metadata?.type === "featured" && payment.metadata?.listing_id) {
      await listingRepo.update(payment.metadata.listing_id, { is_featured: true });
    }
  }
};
var paymentService = new PaymentService();

// src/routes/payments.ts
var router14 = new Hono14();
var featuredSchema = z8.object({
  listing_id: z8.number().int().positive()
});
router14.post("/featured", auth(), zValidator9("json", featuredSchema), async (c) => {
  const { listing_id } = c.req.valid("json");
  const result = await paymentService.createFeaturedPayment(listing_id, c.get("user"));
  return c.json({ success: true, data: result }, 201);
});
router14.post("/dealer-subscription", auth(), async (c) => {
  const result = await paymentService.createSubscriptionPayment(c.get("user"));
  return c.json({ success: true, data: result }, 201);
});

// src/routes/wallet.ts
import { Hono as Hono15 } from "hono";
var router15 = new Hono15();
router15.get("/transactions", auth(), async (c) => {
  const transactions = await paymentRepo.getWalletTransactions(c.get("user").id);
  return c.json({ success: true, data: transactions });
});

// src/routes/dealers.ts
import { Hono as Hono16 } from "hono";
import { zValidator as zValidator10 } from "@hono/zod-validator";
import { z as z9 } from "zod";

// src/repositories/dealer.ts
init_database();
var DealerRepository = class {
  async findByUserId(userId) {
    const db = await getDb();
    const { rows } = await db.query("SELECT * FROM dealer_profiles WHERE user_id = $1", [userId]);
    return rows[0];
  }
  async create(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO dealer_profiles (user_id, business_name, logo, address, description, dealer_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.user_id, data.business_name, data.logo ?? null, data.address ?? null, data.description ?? null, data.dealer_code ?? `DLR-${Date.now().toString(36).toUpperCase()}`]
    );
    return rows[0];
  }
  async update(userId, data) {
    const fields = ["updated_at = NOW()"];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== void 0) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    values.push(userId);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE dealer_profiles SET ${fields.join(", ")} WHERE user_id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }
  async getStats(userId) {
    const db = await getDb();
    const [listingsRes, reviewsRes] = await Promise.all([
      db.query(
        `SELECT
           COUNT(*) as total_listings,
           COUNT(*) FILTER (WHERE status = 'published') as active_listings,
           COUNT(*) FILTER (WHERE status = 'sold') as sold_listings,
           COALESCE(SUM(views), 0) as total_views
         FROM listings WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId]
      ),
      db.query(
        `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
         FROM dealer_reviews WHERE dealer_id = $1`,
        [userId]
      )
    ]);
    const l = listingsRes.rows[0];
    const r = reviewsRes.rows[0];
    return {
      total_listings: parseInt(l.total_listings, 10),
      active_listings: parseInt(l.active_listings, 10),
      sold_listings: parseInt(l.sold_listings, 10),
      total_views: parseInt(l.total_views, 10),
      avg_rating: parseFloat(r.avg_rating),
      total_reviews: parseInt(r.total_reviews, 10)
    };
  }
  async getSubscription(userId) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT dp.*, u.role FROM dealer_profiles dp
       JOIN users u ON u.id = dp.user_id
       WHERE dp.user_id = $1`,
      [userId]
    );
    return rows[0];
  }
  async addReview(data) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO dealer_reviews (dealer_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.dealer_id, data.user_id, data.rating, data.comment ?? ""]
    );
    return rows[0];
  }
};
var dealerRepo = new DealerRepository();

// src/domain/services/dealer.ts
var DealerService = class {
  async upgrade(input) {
    permissionService.requireCapability(
      input.role === "agency" ? "account:upgrade-agency" : "account:upgrade-dealer",
      input.user
    );
    if (input.user.role !== "user") {
      throw AppError.resourceConflict("Account already upgraded");
    }
    const existing = await dealerRepo.findByUserId(input.user.id);
    if (existing) {
      throw AppError.resourceConflict("Dealer profile already exists");
    }
    const profile = await dealerRepo.create({
      user_id: input.user.id,
      business_name: input.business_name
    });
    await userRepo.update(input.user.id, { role: input.role });
    eventBus.publish(AccountUpgraded, { userId: input.user.id, role: input.role });
    return profile;
  }
  async getPublicProfile(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw AppError.notFound("User not found");
    const profile = await dealerRepo.findByUserId(userId);
    const stats = profile ? await dealerRepo.getStats(userId) : null;
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      city: user.city,
      dealer_profile: profile,
      stats
    };
  }
  async addReview(input) {
    const dealer = await userRepo.findById(input.dealer_id);
    if (!dealer || dealer.role !== "dealer" && dealer.role !== "agency") {
      throw AppError.notFound("Dealer not found");
    }
    if (input.dealer_id === input.user.id) {
      throw AppError.validation("You cannot review yourself");
    }
    const review = await dealerRepo.addReview({
      dealer_id: input.dealer_id,
      user_id: input.user.id,
      rating: input.rating,
      comment: input.comment
    });
    return review;
  }
  async getStats(user) {
    if (user.role !== "dealer" && user.role !== "agency") {
      throw AppError.forbidden("Dealer access required");
    }
    return dealerRepo.getStats(user.id);
  }
  async getSubscription(user) {
    if (user.role !== "dealer" && user.role !== "agency") {
      throw AppError.forbidden("Dealer access required");
    }
    const sub = await dealerRepo.getSubscription(user.id);
    if (!sub) throw AppError.notFound("Dealer profile not found");
    return sub;
  }
};
var dealerService = new DealerService();

// src/routes/dealers.ts
var upgradeSchema = z9.object({
  role: z9.enum(["dealer", "agency"]),
  business_name: z9.string().min(1).max(200)
});
var reviewSchema = z9.object({
  rating: z9.number().int().min(1).max(5),
  comment: z9.string().max(1e3).optional()
});
var accountRouter = new Hono16();
accountRouter.post("/upgrade", auth(), zValidator10("json", upgradeSchema), async (c) => {
  const body = c.req.valid("json");
  const profile = await dealerService.upgrade({ ...body, user: c.get("user") });
  return c.json({ success: true, data: profile }, 201);
});
var dealerDashboardRouter = new Hono16();
dealerDashboardRouter.get("/stats", auth(), async (c) => {
  const stats = await dealerService.getStats(c.get("user"));
  return c.json({ success: true, data: stats });
});
dealerDashboardRouter.get("/subscription", auth(), async (c) => {
  const sub = await dealerService.getSubscription(c.get("user"));
  return c.json({ success: true, data: sub });
});
var dealerPublicRouter = new Hono16();
dealerPublicRouter.get("/:id/profile", async (c) => {
  const profile = await dealerService.getPublicProfile(c.req.param("id"));
  return c.json({ success: true, data: profile });
});
dealerPublicRouter.post("/:id/reviews", auth(), zValidator10("json", reviewSchema), async (c) => {
  const body = c.req.valid("json");
  const review = await dealerService.addReview({
    dealer_id: c.req.param("id"),
    rating: body.rating,
    comment: body.comment,
    user: c.get("user")
  });
  return c.json({ success: true, data: review }, 201);
});

// src/routes/users.ts
import { Hono as Hono17 } from "hono";
var router16 = new Hono17();
router16.get("/:id/profile", async (c) => {
  const user = await userRepo.findById(c.req.param("id"));
  if (!user) throw AppError.notFound("User not found");
  return c.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      city: user.city,
      created_at: user.created_at
    }
  });
});

// src/routes/admin.ts
import { Hono as Hono18 } from "hono";
import { zValidator as zValidator11 } from "@hono/zod-validator";
import { z as z10 } from "zod";
init_database();
import bcrypt4 from "bcryptjs";
var router17 = new Hono18();
router17.use("*", auth(), adminAuth());
var createUserSchema = z10.object({
  email: z10.string().email(),
  password: z10.string().min(8),
  name: z10.string().min(1).max(100),
  role: z10.enum(["user", "dealer", "agency", "admin"]).optional(),
  status: z10.string().optional()
});
var roleSchema = z10.object({
  role: z10.enum(["user", "dealer", "agency", "admin"])
});
var statusSchema = z10.object({
  status: z10.string().min(1)
});
var settingsSchema = z10.object({
  maintenance_mode: z10.boolean().optional(),
  max_listings_per_user: z10.number().int().positive().optional(),
  default_listings_limit: z10.number().int().positive().optional(),
  featured_price: z10.number().int().positive().optional(),
  subscription_price: z10.number().int().positive().optional()
});
var reportStatusSchema = z10.object({
  status: z10.enum(["pending", "reviewed", "dismissed"])
});
router17.get("/users", async (c) => {
  const q = c.req.query("q");
  const page = parseInt(c.req.query("page") || "1", 10);
  const perPage = parseInt(c.req.query("per_page") || "20", 10);
  const offset = (page - 1) * perPage;
  const db = await getDb();
  if (q) {
    const searchTerm = `%${q}%`;
    const countRes2 = await db.query(
      "SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL AND (name ILIKE $1 OR email ILIKE $1)",
      [searchTerm]
    );
    const total2 = parseInt(countRes2.rows[0].total, 10);
    const { rows: rows2 } = await db.query(
      "SELECT id, email, name, phone, role, status, avatar, city, email_verified_at, phone_verified_at, created_at FROM users WHERE deleted_at IS NULL AND (name ILIKE $1 OR email ILIKE $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [searchTerm, perPage, offset]
    );
    return c.json({ success: true, data: rows2, meta: { current_page: page, per_page: perPage, total: total2, last_page: Math.ceil(total2 / perPage) } });
  }
  const countRes = await db.query("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL");
  const total = parseInt(countRes.rows[0].total, 10);
  const { rows } = await db.query(
    "SELECT id, email, name, phone, role, status, avatar, city, email_verified_at, phone_verified_at, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [perPage, offset]
  );
  return c.json({ success: true, data: rows, meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) } });
});
router17.post("/users", zValidator11("json", createUserSchema), async (c) => {
  const body = c.req.valid("json");
  const passwordHash = await bcrypt4.hash(body.password, 12);
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, name, role, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, role, status, avatar, city, email_verified_at, phone_verified_at, created_at`,
    [body.email, passwordHash, body.name, body.role ?? "user", body.status ?? "active"]
  );
  return c.json({ success: true, data: rows[0] }, 201);
});
router17.put("/users/:id/role", zValidator11("json", roleSchema), async (c) => {
  const { role } = c.req.valid("json");
  const db = await getDb();
  const { rowCount } = await db.query(
    "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
    [role, c.req.param("id")]
  );
  if (rowCount === 0) throw AppError.notFound("User not found");
  return c.json({ success: true, data: null });
});
router17.put("/users/:id/status", zValidator11("json", statusSchema), async (c) => {
  const { status } = c.req.valid("json");
  const db = await getDb();
  const { rowCount } = await db.query(
    "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL",
    [status, c.req.param("id")]
  );
  if (rowCount === 0) throw AppError.notFound("User not found");
  return c.json({ success: true, data: null });
});
router17.delete("/users/:id", async (c) => {
  const db = await getDb();
  const { rowCount } = await db.query(
    "UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    [c.req.param("id")]
  );
  if (rowCount === 0) throw AppError.notFound("User not found");
  return c.json({ success: true, data: null });
});
router17.get("/settings", async (c) => {
  const db = await getDb();
  const { rows } = await db.query("SELECT * FROM app_settings LIMIT 1");
  return c.json({ success: true, data: rows[0] || {} });
});
router17.put("/settings", zValidator11("json", settingsSchema), async (c) => {
  const body = c.req.valid("json");
  const db = await getDb();
  const existing = await db.query("SELECT * FROM app_settings LIMIT 1");
  if (existing.rows[0]) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value !== void 0) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length > 0) {
      values.push(existing.rows[0].id);
      await db.query(`UPDATE app_settings SET ${fields.join(", ")} WHERE id = $${idx}`, values);
    }
  } else {
    await db.query(
      `INSERT INTO app_settings (${Object.keys(body).join(", ")})
       VALUES (${Object.keys(body).map((_, i) => `$${i + 1}`).join(", ")})`,
      Object.values(body)
    );
  }
  return c.json({ success: true, data: body });
});
router17.get("/reports", async (c) => {
  const page = parseInt(c.req.query("page") || "1", 10);
  const perPage = parseInt(c.req.query("per_page") || "20", 10);
  const offset = (page - 1) * perPage;
  const db = await getDb();
  const countRes = await db.query("SELECT COUNT(*) as total FROM reports");
  const total = parseInt(countRes.rows[0].total, 10);
  const { rows } = await db.query(
    `SELECT r.*, u.name as reporter_name, l.title as listing_title, l.slug as listing_slug
     FROM reports r
     JOIN users u ON u.id = r.user_id
     JOIN listings l ON l.id = r.listing_id
     ORDER BY r.created_at DESC LIMIT $1 OFFSET $2`,
    [perPage, offset]
  );
  return c.json({ success: true, data: rows, meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) } });
});
router17.put("/reports/:id", zValidator11("json", reportStatusSchema), async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { status } = c.req.valid("json");
  const db = await getDb();
  await db.query("UPDATE reports SET status = $1 WHERE id = $2", [status, id]);
  return c.json({ success: true, data: null });
});

// src/routes/notifications.ts
import { Hono as Hono19 } from "hono";
init_database();
var router18 = new Hono19();
router18.use("*", auth());
router18.get("/", async (c) => {
  const userId = c.get("user").id;
  const page = parseInt(c.req.query("page") || "1", 10);
  const perPage = parseInt(c.req.query("per_page") || "20", 10);
  const offset = (page - 1) * perPage;
  const db = await getDb();
  const countRes = await db.query(
    "SELECT COUNT(*) as total FROM notifications WHERE user_id = $1",
    [userId]
  );
  const total = parseInt(countRes.rows[0].total, 10);
  const { rows } = await db.query(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
    [userId, perPage, offset]
  );
  return c.json({
    success: true,
    data: rows,
    meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) }
  });
});
router18.put("/read-all", async (c) => {
  const db = await getDb();
  await db.query(
    "UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false",
    [c.get("user").id]
  );
  return c.json({ success: true, data: null });
});
router18.put("/:id/read", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const db = await getDb();
  await db.query(
    "UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2",
    [id, c.get("user").id]
  );
  return c.json({ success: true, data: null });
});

// src/routes/index.ts
var router19 = new Hono20();
router19.route("/health", router);
router19.route("/auth", router2);
router19.route("/email", router3);
router19.route("/phone", router4);
router19.route("/categories", router5);
router19.route("/provinces", router6);
router19.route("/listings", router7);
router19.route("/search", router8);
router19.route("/upload", router9);
router19.route("/conversations", router10);
router19.route("/favorites", router11);
router19.route("/articles", router12);
router19.route("/tenders", router13);
router19.route("/payments", router14);
router19.route("/wallet", router15);
router19.route("/account", accountRouter);
router19.route("/dealer", dealerDashboardRouter);
router19.route("/dealers", dealerPublicRouter);
router19.route("/users", router16);
router19.route("/admin", router17);
router19.route("/notifications", router18);

// api/index.ts
init_config();
var app = new Hono21();
app.use("*", corsMiddleware());
app.use("*", errorHandler());
app.use("/api/*", rateLimiter("global"));
app.route(config.apiPrefix, router19);
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: { code: ErrorCode.NOT_FOUND, message: `Route not found: ${c.req.method} ${c.req.path}` }
    },
    404
  );
});
var GET = handle(app);
var POST = handle(app);
var PUT = handle(app);
var PATCH = handle(app);
var DELETE = handle(app);
var OPTIONS = handle(app);
export {
  DELETE,
  GET,
  OPTIONS,
  PATCH,
  POST,
  PUT
};
