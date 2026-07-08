export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL || 'postgres://marketplace:marketplace_pass@localhost:5432/marketplace',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'console',
    from: process.env.EMAIL_FROM || 'noreply@marketplace.com',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'console',
    kavenegar: {
      apiKey: process.env.KAVENEGAR_API_KEY || '',
      sender: process.env.KAVENEGAR_SENDER || '',
    },
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    s3: {
      accessKey: process.env.S3_ACCESS_KEY || '',
      secretKey: process.env.S3_SECRET_KEY || '',
      bucket: process.env.S3_BUCKET || 'marketplace-images',
      endpoint: process.env.S3_ENDPOINT || '',
      region: process.env.S3_REGION || 'ir-thr-at1',
    },
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER || 'noop',
    zarinpal: {
      merchantId: process.env.ZARINPAL_MERCHANT_ID || '',
      callbackUrl: process.env.ZARINPAL_CALLBACK_URL || '',
    },
  },

  rateLimits: {
    global: { limit: parseInt(process.env.GLOBAL_RATE_LIMIT || '100', 10), window: parseInt(process.env.GLOBAL_RATE_WINDOW || '60', 10) },
    login: { limit: parseInt(process.env.LOGIN_RATE_LIMIT || '5', 10), window: parseInt(process.env.LOGIN_RATE_WINDOW || '900', 10) },
    register: { limit: parseInt(process.env.REGISTER_RATE_LIMIT || '5', 10), window: parseInt(process.env.REGISTER_RATE_WINDOW || '3600', 10) },
    otpSend: { limit: parseInt(process.env.OTP_SEND_RATE_LIMIT || '3', 10), window: parseInt(process.env.OTP_SEND_RATE_WINDOW || '3600', 10) },
    otpVerify: { limit: parseInt(process.env.OTP_VERIFY_RATE_LIMIT || '10', 10), window: parseInt(process.env.OTP_VERIFY_RATE_WINDOW || '900', 10) },
    forgotPassword: { limit: parseInt(process.env.FORGOT_RATE_LIMIT || '3', 10), window: parseInt(process.env.FORGOT_RATE_WINDOW || '3600', 10) },
    verifyEmail: { limit: parseInt(process.env.VERIFY_EMAIL_RATE_LIMIT || '5', 10), window: parseInt(process.env.VERIFY_EMAIL_RATE_WINDOW || '86400', 10) },
    publishListing: { limit: parseInt(process.env.PUBLISH_LISTING_RATE_LIMIT || '10', 10), window: parseInt(process.env.PUBLISH_LISTING_RATE_WINDOW || '86400', 10) },
    createConversation: { limit: parseInt(process.env.CONVERSATION_RATE_LIMIT || '30', 10), window: parseInt(process.env.CONVERSATION_RATE_WINDOW || '3600', 10) },
    sendMessage: { limit: parseInt(process.env.MESSAGE_RATE_LIMIT || '60', 10), window: parseInt(process.env.MESSAGE_RATE_WINDOW || '60', 10) },
  },
} as const;
