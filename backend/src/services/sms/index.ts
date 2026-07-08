import type { SmsProvider, SmsPayload } from './provider';
import { ConsoleSmsProvider } from './providers/console';
import { config } from '../../config';

export * from './provider';

export function createSmsProvider(): SmsProvider {
  switch (config.sms.provider) {
    case 'console':
    default:
      return new ConsoleSmsProvider();
  }
}

export class SmsService {
  private provider: SmsProvider;

  constructor(provider?: SmsProvider) {
    this.provider = provider ?? createSmsProvider();
  }

  async send(payload: SmsPayload): Promise<void> {
    await this.provider.send(payload);
  }

  async sendOtp(to: string, code: string): Promise<void> {
    await this.send({
      to,
      message: `Your verification code is: ${code}. Valid for 5 minutes.`,
    });
  }
}
