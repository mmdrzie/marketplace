import type { EmailPayload, EmailProvider } from '../provider.js';

export class ConsoleEmailProvider implements EmailProvider {
  readonly name = 'console';

  async send(payload: EmailPayload): Promise<void> {
    console.log('─'.repeat(50));
    console.log('[email] To:', payload.to);
    console.log('[email] Subject:', payload.subject);
    console.log('[email] Body:', payload.body);
    if (payload.html) {
      console.log('[email] HTML:', payload.html.slice(0, 200) + '...');
    }
    console.log('─'.repeat(50));
  }
}
