import type { SmsPayload, SmsProvider } from '../provider.js';
import { config } from '../../../config/index.js';

export class KavenegarSmsProvider implements SmsProvider {
  readonly name = 'kavenegar';

  async send(payload: SmsPayload): Promise<void> {
    const { apiKey, sender } = config.sms.kavenegar;
    const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;

    const params = new URLSearchParams();
    params.set('receptor', payload.to);
    params.set('message', payload.message);
    if (sender) params.set('sender', sender);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      throw new Error(`Kavenegar SMS failed: ${res.status} ${await res.text()}`);
    }
  }
}
