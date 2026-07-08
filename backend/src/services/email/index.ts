import type { EmailProvider, EmailPayload } from './provider';
import { ConsoleEmailProvider } from './providers/console';
import { NoopEmailProvider } from './providers/noop';
import { config } from '../../config';

export * from './provider';

export function createEmailProvider(): EmailProvider {
  switch (config.email.provider) {
    case 'noop':
      return new NoopEmailProvider();
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
