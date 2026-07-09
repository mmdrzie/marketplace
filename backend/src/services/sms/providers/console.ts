import type { SmsPayload, SmsProvider } from '../provider.js';

export class ConsoleSmsProvider implements SmsProvider {
  readonly name = 'console';

  async send(payload: SmsPayload): Promise<void> {
    console.log('─'.repeat(50));
    console.log('[sms] To:', payload.to);
    console.log('[sms] Message:', payload.message);
    console.log('─'.repeat(50));
  }
}
