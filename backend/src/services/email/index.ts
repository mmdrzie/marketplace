import type { EmailProvider, EmailPayload } from './provider.js';
import { ConsoleEmailProvider } from './providers/console.js';
import { NoopEmailProvider } from './providers/noop.js';
import { SmtpEmailProvider } from './providers/smtp.js';
import { config } from '../../config/index.js';

export * from './provider.js';

export function createEmailProvider(): EmailProvider {
  switch (config.email.provider) {
    case 'noop':
      return new NoopEmailProvider();
    case 'smtp':
      return new SmtpEmailProvider();
    case 'console':
    default:
      return new ConsoleEmailProvider();
  }
}

export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.provider = provider ?? createEmailProvider();
  }

  async send(payload: EmailPayload): Promise<void> {
    await this.provider.send(payload);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const url = `${config.frontendUrl}/email/verify/${token}`;
    await this.send({
      to,
      subject: 'Verify your email address',
      body: `Please verify your email by clicking this link: ${url}`,
      html: `<p>Please verify your email by clicking <a href="${url}">this link</a>.</p>`,
    });
  }

  async sendOtp(to: string, code: string): Promise<void> {
    await this.send({
      to,
      subject: 'Your verification code',
      body: `Your OTP code is: ${code}. Valid for 5 minutes.`,
      html: `<p>Your OTP code is: <strong>${code}</strong></p><p>Valid for 5 minutes.</p>`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const url = `${config.frontendUrl}/reset-password?token=${token}`;
    await this.send({
      to,
      subject: 'Reset your password',
      body: `Reset your password here: ${url}`,
      html: `<p>Reset your password <a href="${url}">here</a>.</p>`,
    });
  }
}
