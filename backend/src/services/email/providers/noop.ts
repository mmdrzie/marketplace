import type { EmailPayload, EmailProvider } from '../provider';

export class NoopEmailProvider implements EmailProvider {
  readonly name = 'noop';

  async send(_payload: EmailPayload): Promise<void> {
    // No operation — used in tests
  }
}
